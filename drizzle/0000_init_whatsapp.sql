CREATE TABLE IF NOT EXISTS "whatsapp_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamptz NOT NULL,
	"updated_at" timestamptz NOT NULL,
	"last_connection_at" timestamptz,
	"last_disconnection_at" timestamptz,
	"qr_code" text,
	"connection_state" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_sessions_phone_number_key" ON "whatsapp_sessions" ("phone_number");

CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"from_number" text NOT NULL,
	"to_number" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamptz NOT NULL,
	"direction" text NOT NULL,
	"key_id" text,
	"key_remote_jid" text,
	"key_from_me" boolean,
	"status" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_messages_key_id_key" ON "whatsapp_messages" ("key_id");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_messages_session" ON "whatsapp_messages" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_messages_from" ON "whatsapp_messages" ("from_number");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_messages_to" ON "whatsapp_messages" ("to_number");
