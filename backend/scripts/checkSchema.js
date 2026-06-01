const db = require('../config/db');

async function run() {
  const tables = ['categories', 'posts', 'post_images', 'comments', 'likes', 'hashtags', 'post_hashtags'];
  for (const t of tables) {
    const [cols] = await db.query(`SHOW COLUMNS FROM ${t}`);
    console.log(`\n=== ${t} ===`);
    cols.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));
  }
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
