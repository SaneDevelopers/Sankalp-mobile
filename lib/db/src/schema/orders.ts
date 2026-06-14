import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  orderId: text("order_id").notNull(),
  items: jsonb("items").notNull(), // json array of: { name: string, qty: number, price: number, unit: string }
  amount: integer("amount").notNull(),
  delivery: integer("delivery").notNull(),
  status: text("status").default("processing").notNull(), // 'processing', 'in_transit', 'delivered', 'cancelled'
  addressText: text("address_text").notNull(), // shipping address snapshot
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = typeof ordersTable.$inferInsert;
