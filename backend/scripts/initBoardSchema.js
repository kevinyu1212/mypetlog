const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function run() {
  const schemaPath = path.join(__dirname, '../db/board_schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Simple splitter: assumes no semicolons inside string literals.
  const statements = sql
    .replace(/\r\n/g, '\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    // eslint-disable-next-line no-await-in-loop
    await db.query(stmt);
  }

  // Seed required categories
  const categories = ['파충류', '양서류', '절지류', '어류', '희귀 포유류', '기타 생물'];
  for (const name of categories) {
    // eslint-disable-next-line no-await-in-loop
    await db.query('INSERT IGNORE INTO categories (name) VALUES (?)', [name]);
  }

  // eslint-disable-next-line no-console
  console.log('Board schema initialized (categories seeded).');
  process.exit(0);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to init board schema:', err);
  process.exit(1);
});

