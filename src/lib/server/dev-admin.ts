import crypto from "node:crypto";
import type { PoolClient } from "pg";
import { dbQuery, dbWithTransaction } from "@/lib/server/db";

type LinkedTableSummary = {
  table: string;
  deletedRows: number;
};

type UserRow = {
  id: number;
  username: string;
  email: string;
};

type TableColumnGroup = {
  table_schema: string;
  table_name: string;
  columns: string[];
};

const ID_COLUMN_CANDIDATES = [
  "account_id",
  "user_id",
  "userid",
  "owner_id",
  "created_by_id",
  "creator_id",
  "accountid",
] as const;

const USERNAME_COLUMN_CANDIDATES = [
  "username",
  "user_name",
  "owner_username",
  "created_by_username",
] as const;

const EMAIL_COLUMN_CANDIDATES = [
  "email",
  "user_email",
  "owner_email",
  "created_by_email",
] as const;

export class DevAdminError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function quoteIdentifier(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function getAdminPassword() {
  return process.env.DEV_ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "eomlaudercs26" : "");
}

function isDevAdminEnabled() {
  return process.env.DEV_ADMIN_ENABLED === "true" || process.env.NODE_ENV !== "production";
}

export function assertDevAdminEnabled() {
  if (!isDevAdminEnabled()) {
    throw new DevAdminError("Dev admin tools are disabled.", 404);
  }
}

export function verifyDevAdminPassword(inputPassword: string) {
  const expected = getAdminPassword();

  if (!expected) {
    throw new DevAdminError("DEV_ADMIN_PASSWORD is not configured.", 500);
  }

  const inputBuffer = Buffer.from(inputPassword, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

async function getUserByUsername(client: PoolClient, username: string) {
  const result = await client.query<UserRow>(
    `
      SELECT id, username, email
      FROM accounts
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
    `,
    [username.trim()],
  );

  return result.rows[0] ?? null;
}

async function getLinkableTables(client: PoolClient) {
  const result = await client.query<TableColumnGroup>(`
    SELECT
      table_schema,
      table_name,
      ARRAY_AGG(column_name::text) AS columns
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name <> 'accounts'
      AND column_name = ANY(ARRAY[
        ${ID_COLUMN_CANDIDATES.map((c) => `'${c}'`).join(",")},
        ${USERNAME_COLUMN_CANDIDATES.map((c) => `'${c}'`).join(",")},
        ${EMAIL_COLUMN_CANDIDATES.map((c) => `'${c}'`).join(",")}
      ])
    GROUP BY table_schema, table_name
    ORDER BY table_name
  `);

  return result.rows;
}

function buildWhereClause(columns: string[], user: UserRow) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  for (const column of ID_COLUMN_CANDIDATES) {
    if (columns.includes(column)) {
      values.push(user.id);
      clauses.push(`${quoteIdentifier(column)} = $${values.length}`);
    }
  }

  for (const column of USERNAME_COLUMN_CANDIDATES) {
    if (columns.includes(column)) {
      values.push(user.username);
      clauses.push(`${quoteIdentifier(column)} = $${values.length}`);
    }
  }

  for (const column of EMAIL_COLUMN_CANDIDATES) {
    if (columns.includes(column)) {
      values.push(user.email);
      clauses.push(`${quoteIdentifier(column)} = $${values.length}`);
    }
  }

  if (!clauses.length) {
    return null;
  }

  return {
    where: clauses.join(" OR "),
    values,
  };
}

async function previewUserDeleteInTransaction(client: PoolClient, username: string) {
  const user = await getUserByUsername(client, username);

  if (!user) {
    throw new DevAdminError("User not found.", 404);
  }

  const tables = await getLinkableTables(client);
  const impacts: Array<{ table: string; rows: number }> = [];

  for (const table of tables) {
    const whereClause = buildWhereClause(table.columns, user);
    if (!whereClause) continue;

    const query = `
      SELECT COUNT(*)::int AS count
      FROM ${quoteIdentifier(table.table_schema)}.${quoteIdentifier(table.table_name)}
      WHERE ${whereClause.where}
    `;

    const result = await client.query<{ count: number }>(query, whereClause.values);
    impacts.push({ table: table.table_name, rows: result.rows[0]?.count ?? 0 });
  }

  return {
    user,
    impacts: impacts.filter((impact) => impact.rows > 0),
  };
}

export async function previewUserDelete(username: string) {
  assertDevAdminEnabled();

  if (!username?.trim()) {
    throw new DevAdminError("Username is required.");
  }

  return dbWithTransaction((client) => previewUserDeleteInTransaction(client, username));
}

export async function deleteUserWithLinkedData(username: string) {
  assertDevAdminEnabled();

  if (!username?.trim()) {
    throw new DevAdminError("Username is required.");
  }

  return dbWithTransaction(async (client) => {
    const preview = await previewUserDeleteInTransaction(client, username);
    const summary: LinkedTableSummary[] = [];
    const tables = await getLinkableTables(client);

    for (const table of tables) {
      const whereClause = buildWhereClause(table.columns, preview.user);
      if (!whereClause) continue;

      const deleteQuery = `
        DELETE FROM ${quoteIdentifier(table.table_schema)}.${quoteIdentifier(table.table_name)}
        WHERE ${whereClause.where}
      `;

      const result = await client.query(deleteQuery, whereClause.values);
      if (result.rowCount && result.rowCount > 0) {
        summary.push({ table: table.table_name, deletedRows: result.rowCount });
      }
    }

    await client.query("DELETE FROM accounts WHERE id = $1", [preview.user.id]);

    return {
      deletedUser: preview.user,
      linkedDeletions: summary,
    };
  });
}

export async function previewDeleteAllUsers() {
  assertDevAdminEnabled();

  const usersResult = await dbQuery<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM accounts",
  );

  const userCount = usersResult.rows[0]?.count ?? 0;

  return dbWithTransaction(async (client) => {
    const tables = await getLinkableTables(client);
    const impacts: Array<{ table: string; rows: number }> = [];

    for (const table of tables) {
      const countQuery = `
        SELECT COUNT(*)::int AS count
        FROM ${quoteIdentifier(table.table_schema)}.${quoteIdentifier(table.table_name)}
      `;
      const result = await client.query<{ count: number }>(countQuery);
      const rowCount = result.rows[0]?.count ?? 0;
      if (rowCount > 0) {
        impacts.push({ table: table.table_name, rows: rowCount });
      }
    }

    return {
      accountRows: userCount,
      linkedRows: impacts,
    };
  });
}

export async function deleteAllUsersWithLinkedData() {
  assertDevAdminEnabled();

  return dbWithTransaction(async (client) => {
    const tables = await getLinkableTables(client);
    const summary: LinkedTableSummary[] = [];

    for (const table of tables) {
      const deleteQuery = `DELETE FROM ${quoteIdentifier(table.table_schema)}.${quoteIdentifier(table.table_name)}`;
      const result = await client.query(deleteQuery);
      if (result.rowCount && result.rowCount > 0) {
        summary.push({ table: table.table_name, deletedRows: result.rowCount });
      }
    }

    const accountsDelete = await client.query("DELETE FROM accounts");

    return {
      deletedAccounts: accountsDelete.rowCount ?? 0,
      linkedDeletions: summary,
    };
  });
}
