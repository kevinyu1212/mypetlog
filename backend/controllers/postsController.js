const db = require('../config/db');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const CATEGORY_TO_ENUM = {
  '파충류': '파충류',
  '양서류': '양서류',
  '절지류': '절지류',
  '어류': '어류',
  '희귀 포유류': '희귀포유류',
  '기타 생물': '기타',
};

const ENUM_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_ENUM).map(([k, v]) => [v, k])
);

const getCategoryEnum = async (categoryId) => {
  const [rows] = await db.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
  if (rows.length === 0) return null;
  return CATEGORY_TO_ENUM[rows[0].name] || null;
};

const parseHashtags = (raw) => {
  if (raw === undefined || raw === null) return [];
  const str = Array.isArray(raw) ? raw.join(' ') : String(raw);
  const tags = str
    .replace(/#/g, ' ')
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((t) => t.slice(0, 50));

  const uniq = [];
  const seen = new Set();
  for (const t of tags) {
    if (seen.has(t)) continue;
    seen.add(t);
    uniq.push(t);
  }
  return uniq.slice(0, 10);
};

const uploadImageToCloudinary = (buffer, { folder, publicId }) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: 'image',
      public_id: publicId,
      overwrite: true,
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
    },
    (err, uploaded) => (err ? reject(err) : resolve(uploaded))
  );
  stream.end(buffer);
});

const saveHashtags = async (postId, tags) => {
  if (tags.length === 0) return;
  const values = tags.map((t) => [t]);
  await db.query('INSERT IGNORE INTO hashtags (tag) VALUES ?', [values]);
  const [tagRows] = await db.query('SELECT id, tag FROM hashtags WHERE tag IN (?)', [tags]);
  const pairs = tagRows.map((r) => [postId, r.id]);
  if (pairs.length > 0) {
    await db.query('INSERT IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES ?', [pairs]);
  }
};

const getPostHashtags = async (postId) => {
  const [rows] = await db.query(
    `SELECT h.tag FROM hashtags h
     JOIN post_hashtags ph ON ph.hashtag_id = h.id
     WHERE ph.post_id = ?`,
    [postId]
  );
  return rows.map((r) => r.tag);
};

exports.getPosts = async (req, res) => {
  try {
    const { category_id, sort = 'latest', search, hashtag, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit, 10) || 10, 50));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];
    let hashtagJoin = '';

    if (hashtag) {
      const normalized = String(hashtag).trim().replace(/^#/, '').toLowerCase();
      if (normalized) {
        hashtagJoin = `
          JOIN post_hashtags ph ON ph.post_id = p.id
          JOIN hashtags h ON h.id = ph.hashtag_id
        `;
        where.push('h.tag = ?');
        params.push(normalized);
      }
    }

    if (category_id) {
      const enumVal = await getCategoryEnum(category_id);
      if (!enumVal) return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
      where.push('p.category = ?');
      params.push(enumVal);
    }

    if (search) {
      where.push('(p.title LIKE ? OR p.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const orderBy = sort === 'popular'
      ? 'p.like_count DESC, p.created_at DESC'
      : 'p.created_at DESC';

    const sql = `
      SELECT
        p.id, p.title, p.content, p.category, p.hashtags,
        p.like_count, p.comment_count,
        p.created_at, p.updated_at, p.user_id,
        u.nickname AS author_nickname,
        u.profile_image AS author_profile_image,
        (SELECT image_url FROM post_images pi WHERE pi.post_id = p.id ORDER BY pi.id ASC LIMIT 1) AS thumbnail
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ${hashtagJoin}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(limitNum, offset);
    const [rows] = await db.query(sql, params);

    const posts = rows.map((p) => ({
      ...p,
      category_name: ENUM_TO_CATEGORY[p.category] || p.category,
    }));

    res.json({ posts, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.postId;

    const [rows] = await db.query(
      `SELECT p.*, u.nickname AS author_nickname, u.profile_image AS author_profile_image
       FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`,
      [postId]
    );

    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    const [imgRows] = await db.query(
      'SELECT image_url FROM post_images WHERE post_id = ? ORDER BY id ASC', [postId]
    );
    const tagList = await getPostHashtags(postId);

    let is_liked = false;
    if (req.user?.id) {
      const [likeRows] = await db.query(
        'SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, req.user.id]
      );
      is_liked = likeRows.length > 0;
    }

    res.json({
      post: {
        ...rows[0],
        category_name: ENUM_TO_CATEGORY[rows[0].category] || rows[0].category,
        images: imgRows.map((r) => r.image_url),
        hashtag_list: tagList,
        is_liked,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, category_id, hashtags } = req.body;
    if (!title || !content || !category_id) {
      return res.status(400).json({ message: 'title, content, category_id를 입력해주세요.' });
    }

    const categoryEnum = await getCategoryEnum(category_id);
    if (!categoryEnum) return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });

    const tags = parseHashtags(hashtags);
    const hashtagStr = tags.map((t) => `#${t}`).join(' ');

    const [insertResult] = await db.query(
      'INSERT INTO posts (user_id, category, title, content, hashtags) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, categoryEnum, title, content, hashtagStr]
    );
    const postId = insertResult.insertId;

    const files = req.files || [];
    if (files.length > 0) {
      if (!isConfigured) return res.status(500).json({ message: 'Cloudinary 설정이 필요합니다.' });

      const imageUrls = [];
      for (let i = 0; i < files.length; i += 1) {
        const uploaded = await uploadImageToCloudinary(files[i].buffer, {
          folder: 'mypetlog/posts',
          publicId: `post-${postId}-img-${i}`,
        });
        imageUrls.push(uploaded.secure_url);
      }
      await db.query('INSERT INTO post_images (post_id, image_url) VALUES ?',
        [imageUrls.map((url) => [postId, url])]);
    }

    await saveHashtags(postId, tags);
    res.status(201).json({ message: '게시글이 생성되었습니다.', post_id: postId });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, content, category_id, hashtags } = req.body;

    if (!title || !content || !category_id) {
      return res.status(400).json({ message: 'title, content, category_id를 입력해주세요.' });
    }

    const [ownerRows] = await db.query('SELECT user_id, hashtags FROM posts WHERE id = ?', [postId]);
    if (ownerRows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    if (ownerRows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

    const categoryEnum = await getCategoryEnum(category_id);
    if (!categoryEnum) return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });

    let hashtagStr = ownerRows[0].hashtags;
    if (Object.prototype.hasOwnProperty.call(req.body, 'hashtags')) {
      const tags = parseHashtags(hashtags);
      hashtagStr = tags.map((t) => `#${t}`).join(' ');
      await db.query('DELETE FROM post_hashtags WHERE post_id = ?', [postId]);
      await saveHashtags(postId, tags);
    }

    await db.query(
      'UPDATE posts SET title = ?, content = ?, category = ?, hashtags = ? WHERE id = ?',
      [title, content, categoryEnum, hashtagStr, postId]
    );

    const files = req.files || [];
    if (files.length > 0) {
      if (!isConfigured) return res.status(500).json({ message: 'Cloudinary 설정이 필요합니다.' });
      await db.query('DELETE FROM post_images WHERE post_id = ?', [postId]);

      const imageUrls = [];
      for (let i = 0; i < files.length; i += 1) {
        const uploaded = await uploadImageToCloudinary(files[i].buffer, {
          folder: 'mypetlog/posts',
          publicId: `post-${postId}-img-${i}`,
        });
        imageUrls.push(uploaded.secure_url);
      }
      await db.query('INSERT INTO post_images (post_id, image_url) VALUES ?',
        [imageUrls.map((url) => [postId, url])]);
    }

    res.json({ message: '게시글이 수정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const [ownerRows] = await db.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
    if (ownerRows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    if (ownerRows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

