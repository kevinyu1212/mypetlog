const db = require('../config/db');

// Categories list
exports.getCategories = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM categories ORDER BY id ASC');
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

