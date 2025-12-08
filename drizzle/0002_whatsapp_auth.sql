CREATE TABLE IF NOT EXISTS "whatsapp_auth_snapshots" (
  "session_id" uuid PRIMARY KEY NOT NULL,
  "creds" jsonb NOT NULL,
  "keys" jsonb NOT NULL,
  "updated_at" timestamptz NOT NULL
);
