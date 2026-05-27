import { Pool, type QueryResultRow } from "pg";

let pool: Pool | undefined;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured.");
    }

    pool = new Pool({ connectionString });
  }

  return pool;
}

export async function dbQuery<T extends QueryResultRow>(
  text: string,
  values?: unknown[],
) {
  return getPool().query<T>(text, values);
}
