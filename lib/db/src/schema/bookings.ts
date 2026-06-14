import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  bookingId: text("booking_id").notNull(),
  poojaId: text("pooja_id").notNull(),
  poojaName: text("pooja_name").notNull(),
  panditId: text("pandit_id").notNull(),
  panditName: text("pandit_name").notNull(),
  panditColor: text("pandit_color").notNull(),
  panditInitials: text("pandit_initials").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").default("upcoming").notNull(), // 'upcoming', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = typeof bookingsTable.$inferInsert;
