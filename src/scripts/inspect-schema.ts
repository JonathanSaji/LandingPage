import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
import { Pool } from "pg";

async function inspect() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const result = await pool.query(`
    SELECT table_schema, table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE (table_schema = 'TravelSync' OR table_schema = 'public')
      AND table_name IN ('trips', 'trip_shares', 'accounts', 'subscriptions', 'photo_albums', 'photos')
    ORDER BY table_schema, table_name, ordinal_position
  `);

  console.table(result.rows);
  await pool.end();
}

inspect().catch((err) => { console.error(err); process.exit(1); });
