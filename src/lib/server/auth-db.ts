import { dbQuery } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/password";

type AccountType = "personal" | "business";
type BusinessRole = "ceo" | "employee";

type AccountRow = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: string;
  account_type: AccountType;
  business_role: BusinessRole | null;
  organization_name: string | null;
  is_active: boolean;
  email_verified: boolean;
  welcome_email_sent_at: string | null;
  created_at: string;
};

export type PublicAccount = Omit<AccountRow, "password_hash">;

export class AuthInputError extends Error {
  status = 400;
}

export class AuthConflictError extends Error {
  status = 409;
}

let schemaReadyPromise: Promise<void> | null = null;

async function ensureAuthSchema() {
  if (schemaReadyPromise) {
    return schemaReadyPromise;
  }

  schemaReadyPromise = (async () => {
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS accounts (
        id BIGSERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        account_type TEXT NOT NULL DEFAULT 'personal',
        business_role TEXT,
        organization_name TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        welcome_email_sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (char_length(username) >= 3),
        CHECK (position('@' in email) > 1),
        CHECK (role IN ('user', 'ceo', 'employee')),
        CHECK (account_type IN ('personal', 'business')),
        CHECK (business_role IS NULL OR business_role IN ('ceo', 'employee')),
        CHECK (
          (account_type = 'personal' AND business_role IS NULL)
          OR (account_type = 'business' AND business_role IS NOT NULL)
        )
      )
    `);

    // Backward-compatible migration for existing accounts tables.
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'",
    );
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'personal'",
    );
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS business_role TEXT",
    );
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS organization_name TEXT",
    );
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE",
    );
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE",
    );
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ",
    );
    await dbQuery(
      "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
    );

    await dbQuery(
      "CREATE UNIQUE INDEX IF NOT EXISTS accounts_username_lower_unique ON accounts (LOWER(username))",
    );
    await dbQuery(
      "CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_lower_unique ON accounts (LOWER(email))",
    );
  })();

  return schemaReadyPromise;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim();
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeRegisterInput(input: {
  username?: string;
  email?: string;
  password?: string;
  accountType?: AccountType;
  businessRole?: BusinessRole;
  organizationName?: string;
}) {
  const username = normalizeUsername(input.username ?? "");
  const email = normalizeEmail(input.email ?? "");
  const password = input.password ?? "";
  const accountType = input.accountType ?? "personal";
  const businessRole = input.businessRole;
  const organizationName = input.organizationName?.trim() || null;

  if (!username || !email || !password) {
    throw new AuthInputError("Username, email, and password are required.");
  }

  if (username.length < 3) {
    throw new AuthInputError("Username must be at least 3 characters.");
  }

  if (!validateEmail(email)) {
    throw new AuthInputError("Invalid email format.");
  }

  if (accountType === "business" && !businessRole) {
    throw new AuthInputError("Business account role is required.");
  }

  if (accountType === "business" && businessRole === "ceo" && !organizationName) {
    throw new AuthInputError("Organization name is required for CEO accounts.");
  }

  return {
    username,
    email,
    password,
    accountType,
    businessRole: accountType === "business" ? businessRole ?? null : null,
    organizationName: accountType === "business" ? organizationName : null,
  };
}

export async function createAccount(input: {
  username?: string;
  email?: string;
  password?: string;
  accountType?: AccountType;
  businessRole?: BusinessRole;
  organizationName?: string;
}) {
  await ensureAuthSchema();

  const sanitized = sanitizeRegisterInput(input);
  const password_hash = hashPassword(sanitized.password);
  const role =
    sanitized.accountType === "business" && sanitized.businessRole
      ? sanitized.businessRole
      : "user";

  try {
    const result = await dbQuery<PublicAccount>(
      `
        INSERT INTO accounts (
          username,
          email,
          password_hash,
          display_name,
          role,
          account_type,
          business_role,
          organization_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          username,
          email,
          display_name,
          role,
          account_type,
          business_role,
          organization_name,
          is_active,
          email_verified,
          welcome_email_sent_at,
          created_at
      `,
      [
        sanitized.username,
        sanitized.email,
        password_hash,
        sanitized.username,
        role,
        sanitized.accountType,
        sanitized.businessRole,
        sanitized.organizationName,
      ],
    );

    return result.rows[0];
  } catch (error) {
    const pgCode = (error as { code?: string }).code;
    if (pgCode === "23505") {
      throw new AuthConflictError("Username or email already exists.");
    }

    throw error;
  }
}

export async function loginWithPassword(input: {
  identifier?: string;
  password?: string;
}) {
  await ensureAuthSchema();

  const identifier = (input.identifier ?? "").trim().toLowerCase();
  const password = input.password ?? "";

  if (!identifier || !password) {
    throw new AuthInputError("Username/email and password are required.");
  }

  const result = await dbQuery<AccountRow>(
    `
      SELECT
        id,
        username,
        email,
        password_hash,
        display_name,
        role,
        account_type,
        business_role,
        organization_name,
        is_active,
        email_verified,
        welcome_email_sent_at,
        created_at
      FROM accounts
      WHERE LOWER(username) = $1 OR LOWER(email) = $1
      LIMIT 1
    `,
    [identifier],
  );

  const account = result.rows[0];

  if (!account || !account.is_active) {
    throw new AuthInputError("Invalid username/email or password.");
  }

  const validPassword = verifyPassword(password, account.password_hash);

  if (!validPassword) {
    throw new AuthInputError("Invalid username/email or password.");
  }

  const { password_hash, ...publicAccount } = account;
  void password_hash;

  return publicAccount;
}

export async function markWelcomeEmailSent(accountId: number) {
  await ensureAuthSchema();

  await dbQuery(
    `
      UPDATE accounts
      SET welcome_email_sent_at = NOW()
      WHERE id = $1 AND welcome_email_sent_at IS NULL
    `,
    [accountId],
  );
}
