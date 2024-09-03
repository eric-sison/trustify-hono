import { sql } from "drizzle-orm";
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const client = pgTable("clients", {
  id: uuid("client_id").defaultRandom().primaryKey(),
  name: varchar("client_name", { length: 100 }).unique().notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  secret: varchar("client_secret", { length: 255 }).unique().notNull(),
  responseTypes: text("response_types")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  redirectUris: text("redirect_uris")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  scopes: text("scopes")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});
