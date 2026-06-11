import { pgTable, text, serial, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const travelLocationsTable = pgTable("travel_locations", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  continent: text("continent").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTravelLocationSchema = createInsertSchema(travelLocationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTravelLocation = z.infer<typeof insertTravelLocationSchema>;
export type TravelLocation = typeof travelLocationsTable.$inferSelect;
