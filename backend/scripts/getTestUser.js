require('dotenv').config();
const db = require('../config/db');

db.query('SELECT email FROM users LIMIT 1')
  .then(([rows]) => { console.log(rows[0]?.email || 'NONE'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
