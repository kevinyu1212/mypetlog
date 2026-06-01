const db = require('../config/db');

exports.listComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const [rows] = await db.query(
      `SELECT cm.id, cm.content, cm.created_at, cm.updated_at,
              u.id AS user_id, u.nickname, u.profile_image
       FROM comments cm JOIN users u ON u.id = cm.user_id
       WHERE cm.post_id = ? ORDER BY cm.created_at ASC`,
      [postId]
    );
    res.json({ comments: rows });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || String(content).trim().length === 0) {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    const [postRows] = await db.query('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, req.user.id, content]
    );
    await db.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', [postId]);

    res.status(201).json({ message: '댓글이 작성되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content || String(content).trim().length === 0) {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    const [rows] = await db.query(
      'SELECT user_id FROM comments WHERE id = ? AND post_id = ?',
      [commentId, postId]
    );
    if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

    await db.query('UPDATE comments SET content = ? WHERE id = ?', [content, commentId]);
    res.json({ message: '댓글이 수정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const [rows] = await db.query(
      'SELECT user_id FROM comments WHERE id = ? AND post_id = ?',
      [commentId, postId]
    );
    if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    await db.query('DELETE FROM comments WHERE id = ? AND post_id = ?', [commentId, postId]);
    await db.query('UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?', [postId]);

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};
