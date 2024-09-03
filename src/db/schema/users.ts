import { pgTable, text, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { client } from "./clients";

export const user = pgTable("users", {
  id: uuid("user_id").defaultRandom().primaryKey(),
  clientId: uuid("client_id_dk").references(() => client.id),
  email: varchar("email", { length: 150 }).unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  middleName: varchar("middle_name").notNull(),
  lastName: varchar("last_name").notNull(),
  avatarUrl: text("avatar_url"),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  lastSignInAt: timestamp("last_signin_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
