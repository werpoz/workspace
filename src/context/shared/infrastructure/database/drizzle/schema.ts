import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  integer,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const whatsappSessions = pgTable(
  'whatsapp_sessions',
  {
    id: uuid('id').primaryKey(),
    phoneNumber: text('phone_number').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
    lastConnectionAt: timestamp('last_connection_at', {
      withTimezone: true,
    }),
    lastDisconnectionAt: timestamp('last_disconnection_at', {
      withTimezone: true,
    }),
    qrCode: text('qr_code'),
    connectionState: text('connection_state'),
  },
  (table) => ({
    phoneNumberUnique: uniqueIndex(
      'whatsapp_sessions_phone_number_key',
    ).on(table.phoneNumber),
  }),
);

export const whatsappMessages = pgTable(
  'whatsapp_messages',
  {
    id: uuid('id').primaryKey(),
    sessionId: uuid('session_id').notNull(),
    fromNumber: text('from_number').notNull(),
    toNumber: text('to_number').notNull(),
    type: text('type').notNull(),
    content: text('content').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    direction: text('direction').notNull(),
    keyId: text('key_id'),
    keyRemoteJid: text('key_remote_jid'),
    keyFromMe: boolean('key_from_me'),
    status: text('status'),
  },
  (table) => ({
    keyIdUnique: uniqueIndex('whatsapp_messages_key_id_key').on(table.keyId),
    sessionIdx: index('idx_whatsapp_messages_session').on(table.sessionId),
    fromIdx: index('idx_whatsapp_messages_from').on(table.fromNumber),
    toIdx: index('idx_whatsapp_messages_to').on(table.toNumber),
  }),
);

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey(),
    email: text('email').notNull(),
    password: text('password'),
    status: text('status').notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex('accounts_email_key').on(table.email),
  }),
);

export const identities = pgTable(
  'identities',
  {
    id: uuid('id').primaryKey(),
    accountId: uuid('account_id').notNull(),
  },
  (table) => ({
    accountUnique: uniqueIndex('identities_account_id_key').on(table.accountId),
  }),
);

export const emailVerifications = pgTable(
  'email_verifications',
  {
    id: uuid('id').primaryKey(),
    accountId: uuid('account_id').notNull(),
    method: text('method').notNull(),
    token: text('token'),
    code: text('code'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull(),
    verified: boolean('verified').notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
  },
  (table) => ({
    tokenUnique: uniqueIndex('email_verifications_token_key').on(table.token),
    accountIdx: index('idx_email_verifications_account').on(table.accountId),
    accountCodeUnique: uniqueIndex(
      'email_verifications_account_code_key',
    ).on(table.accountId, table.code),
  }),
);
