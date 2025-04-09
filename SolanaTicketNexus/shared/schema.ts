import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageSrc: text("image_src"),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
  ticketPrice: doublePrecision("ticket_price").notNull(),
  ticketsAvailable: integer("tickets_available").notNull(),
  ticketsSold: integer("tickets_sold").default(0),
  verified: boolean("verified").default(true),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  ticketsSold: true,
  verified: true,
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  seatNumber: text("seat_number").notNull(),
  tokenId: text("token_id"),
  qrCodeData: text("qr_code_data").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  isUsed: boolean("is_used").default(false),
  usedDate: timestamp("used_date"),
  isForSale: boolean("is_for_sale").default(false),
  salePrice: doublePrecision("sale_price"),
  saleType: text("sale_type"), // "fixed" or "auction"
  auctionEndDate: timestamp("auction_end_date"),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  purchaseDate: true,
  isUsed: true,
  usedDate: true,
});

// Market listings
export const marketListings = pgTable("market_listings", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  price: doublePrecision("price").notNull(),
  listingType: text("listing_type").notNull(), // "fixed" or "auction"
  createdAt: timestamp("created_at").defaultNow(),
  endsAt: timestamp("ends_at"),
  currentBid: doublePrecision("current_bid"),
  currentBidderId: integer("current_bidder_id"),
});

export const insertMarketListingSchema = createInsertSchema(marketListings).omit({
  id: true,
  createdAt: true,
});

// Bids
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  bidderId: integer("bidder_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  bidTime: timestamp("bid_time").defaultNow(),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  bidTime: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type MarketListing = typeof marketListings.$inferSelect;
export type InsertMarketListing = z.infer<typeof insertMarketListingSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
