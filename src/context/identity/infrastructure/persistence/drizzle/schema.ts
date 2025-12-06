import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    email: text('email').notNull().unique(),
    username: text('username'),
    password: text('password'), // Hashed
    status: text('status').default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    provider: text('provider').notNull(), // 'local', 'google', etc.
    providerAccountId: text('provider_account_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const email_verifications = pgTable('email_verifications', {
    id: uuid('id').primaryKey(),
    accountId: uuid('account_id').references(() => users.id).notNull(),
    method: text('method').notNull(),
    code: text('code'),
    token: text('token'),
    expiresAt: timestamp('expires_at').notNull(),
    verified: boolean('verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
