import { Pool, type PoolClient, type QueryResultRow } from "pg";

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

export async function dbWithTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
