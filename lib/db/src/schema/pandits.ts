import { pgTable, serial, text, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";

export const panditsTable = pgTable("pandits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  specialty: text("specialty").notNull(),
  category: text("category").notNull(), // 'vedic' | 'astrology' | 'havan' | 'griha'
  rating: real("rating").default(5.0).notNull(),
  experience: text("experience").notNull(),
  bookings: integer("bookings").default(0).notNull(),
  age: integer("age").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  available: text("available").default("today").notNull(), // 'today' | 'tomorrow' | 'next_week'
  specializations: jsonb("specializations").notNull(), // json array of strings
  muhurats: jsonb("muhurats").notNull(), // json array of strings
  poojas: jsonb("poojas").notNull(), // json array of pooja objects: { id, name, duration, price, includesPrasad }
  initials: text("initials").notNull(),
  avatarColor: text("avatar_color").notNull(),
  email: text("email"),
  password: text("password"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Pandit = typeof panditsTable.$inferSelect;
export type InsertPandit = typeof panditsTable.$inferInsert;
