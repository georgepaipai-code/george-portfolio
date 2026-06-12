import { pgTable, serial, varchar, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const travelLocationsTable = pgTable("travel_locations", {
  id: serial("id").primaryKey(),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  continent: varchar("continent", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TravelLocation = typeof travelLocationsTable.$inferSelect;
export type NewTravelLocation = typeof travelLocationsTable.$inferInsert;
