const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_mMw6Oa2HekUN@ep-purple-breeze-amlky3x8-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    const acc = await pool.query("SELECT username, email, display_name FROM accounts WHERE username = 'krishtest'");
    console.log("public.accounts:", acc.rows);

    const mem = await pool.query("SELECT email, name, display_name, role, company_id FROM \"SeatSync\".seatsync_membership WHERE display_name = 'krishtest' OR email LIKE '%krishtest%'");
    console.log("SeatSync.seatsync_membership:", mem.rows);

    const comp = await pool.query("SELECT id, owner_email FROM \"SeatSync\".companies");
    console.log("SeatSync.companies:", comp.rows);
  } catch (err) {
    console.error("DB Query failed:", err.message);
  } finally {
    pool.end();
  }
}

run();
