import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  boolean,
} from "drizzle-orm/pg-core";

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  pricePerPerson: integer("price_per_person").notNull(), // en USD enteros
  durationMin: integer("duration_min").notNull(),
  image: text("image").notNull(),
  includes: text("includes").array().notNull(),
  capacity: integer("capacity").notNull().default(6),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  packageId: integer("package_id")
    .notNull()
    .references(() => packages.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  bookingDate: date("booking_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  people: integer("people").notNull(),
  subtotal: integer("subtotal").notNull(),
  discountPct: integer("discount_pct").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(0),
  total: integer("total").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("confirmada"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Package = typeof packages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
