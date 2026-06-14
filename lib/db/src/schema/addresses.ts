import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  label: text("label").notNull(), // 'Home', 'Office', 'Other'
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  pincode: text("pincode").notNull(),
  city: text("city").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Address = typeof addressesTable.$inferSelect;
export type InsertAddress = typeof addressesTable.$inferInsert;
