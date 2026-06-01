const db = require('../config/db');

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const [postRows] = await db.query('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    const [result] = await db.query(
      'INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)',
      [postId, req.user.id]
    );

    if (result.affectedRows > 0) {
      await db.query('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [postId]);
    }

    const [rows] = await db.query('SELECT like_count FROM posts WHERE id = ?', [postId]);
    res.json({ message: '좋아요 완료', like_count: rows[0].like_count });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const [result] = await db.query(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, req.user.id]
    );

    if (result.affectedRows > 0) {
      await db.query('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [postId]);
    }

    const [rows] = await db.query('SELECT like_count FROM posts WHERE id = ?', [postId]);
    res.json({ message: '좋아요 취소', like_count: rows[0]?.like_count ?? 0 });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};
