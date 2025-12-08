CREATE TABLE IF NOT EXISTS "accounts" (
  "id" uuid PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "password" text,
  "status" text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_email_key" ON "accounts" ("email");

CREATE TABLE IF NOT EXISTS "identities" (
  "id" uuid PRIMARY KEY NOT NULL,
  "account_id" uuid NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "identities_account_id_key" ON "identities" ("account_id");

CREATE TABLE IF NOT EXISTS "email_verifications" (
  "id" uuid PRIMARY KEY NOT NULL,
  "account_id" uuid NOT NULL,
  "method" text NOT NULL,
  "token" text,
  "code" text,
  "expires_at" timestamptz NOT NULL,
  "attempts" integer NOT NULL,
  "verified" boolean NOT NULL,
  "verified_at" timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_verifications_token_key" ON "email_verifications" ("token");
CREATE INDEX IF NOT EXISTS "idx_email_verifications_account" ON "email_verifications" ("account_id");
CREATE UNIQUE INDEX IF NOT EXISTS "email_verifications_account_code_key" ON "email_verifications" ("account_id","code");
