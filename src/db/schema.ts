import { pgTable, text, timestamp, boolean, uuid, index, uniqueIndex, integer, jsonb, type AnyPgColumn } from "drizzle-orm/pg-core";
import type { PageData } from "../lib/page-data";

/* ---------- Sign-in tables (shape required by Better Auth) ---------- */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (t) => [index("session_user_idx").on(t.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("account_user_idx").on(t.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Designspace ---------- */
export const campaign = pgTable("campaign", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  setting: text("setting").notNull().default(""),
  ruleset: text("ruleset").notNull().default("dnd2014"),
  calendar: text("calendar").notNull().default("harptos"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("campaign_owner_idx").on(t.ownerId)]);

export type Campaign = typeof campaign.$inferSelect;

/* ---------- Wiki ---------- */
/** A wiki entry's identity and place in the tree. Everything written on the page lives in its revisions. */
export const entry = pgTable("entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaign.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => entry.id, { onDelete: "restrict" }),
  type: text("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("entry_campaign_idx").on(t.campaignId), index("entry_parent_idx").on(t.parentId)]);

/** Every saved version of an entry. Never changed after it is written; the newest one is the page. */
export const entryRevision = pgTable("entry_revision", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id").notNull().references(() => entry.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  lead: text("lead").notNull().default(""),
  info: jsonb("info").$type<Record<string, string>>().notNull().default({}),
  data: jsonb("data").$type<PageData>().notNull().default({}),
  sections: jsonb("sections").$type<Record<string, string>>().notNull().default({}),
  authorId: text("author_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("entry_revision_number_idx").on(t.entryId, t.number)]);

export type Entry = typeof entry.$inferSelect;
export type EntryRevision = typeof entryRevision.$inferSelect;
