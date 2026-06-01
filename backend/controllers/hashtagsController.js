const db = require('../config/db');

exports.getHashtags = async (req, res) => {
  try {
    const { search } = req.query;

    if (search) {
      const normalized = String(search).trim().replace(/^#/, '').toLowerCase();
      const [rows] = await db.query(
        'SELECT id, tag FROM hashtags WHERE tag LIKE ? ORDER BY created_at DESC LIMIT 20',
        [`%${normalized}%`]
      );
      res.json({ hashtags: rows });
      return;
    }

    const [rows] = await db.query('SELECT id, tag FROM hashtags ORDER BY created_at DESC LIMIT 20');
    res.json({ hashtags: rows });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

