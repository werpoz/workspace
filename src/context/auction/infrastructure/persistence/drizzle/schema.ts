import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const auctions = pgTable('auctions', {
    id: uuid('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    startingPrice: integer('starting_price').notNull(), // Storing as cents
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    sellerId: uuid('seller_id').notNull(),
    itemId: uuid('item_id').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const items = pgTable('items', {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bids = pgTable('bids', {
    id: uuid('id').primaryKey(),
    auctionId: uuid('auction_id').references(() => auctions.id).notNull(),
    bidderId: uuid('bidder_id').notNull(),
    amount: integer('amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

