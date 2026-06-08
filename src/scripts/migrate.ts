import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { Pool } from "pg";
import { readFileSync } from "fs";

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = readFileSync(
    resolve(process.cwd(), "src/lib/server/migrations/001_photo_albums_photos.sql"),
    "utf8"
  );
  await pool.query(sql);
  console.log("Migration complete.");
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
