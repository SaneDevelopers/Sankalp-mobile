import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const storeItemsTable = pgTable("store_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(), // 'samagri' | 'utensils' | 'premium'
  featured: boolean("featured").default(false).notNull(),
  description: text("description"),
  color: text("color"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type StoreItem = typeof storeItemsTable.$inferSelect;
export type InsertStoreItem = typeof storeItemsTable.$inferInsert;
