import { db, travelLocationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const locations = [
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.006, continent: "North America" },
  { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194, continent: "North America" },
  { city: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437, continent: "North America" },
  { city: "Las Vegas", country: "United States", lat: 36.1699, lng: -115.1398, continent: "North America" },
  { city: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298, continent: "North America" },
  { city: "Miami", country: "United States", lat: 25.7617, lng: -80.1918, continent: "North America" },
  { city: "Seattle", country: "United States", lat: 47.6062, lng: -122.3321, continent: "North America" },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, continent: "North America" },
  { city: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, continent: "North America" },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, continent: "North America" },
  { city: "Cancún", country: "Mexico", lat: 21.1619, lng: -86.8515, continent: "North America" },
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, continent: "Europe" },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522, continent: "Europe" },
  { city: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734, continent: "Europe" },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, continent: "Europe" },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, continent: "Europe" },
  { city: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378, continent: "Europe" },
  { city: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417, continent: "Europe" },
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, continent: "Asia" },
  { city: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681, continent: "Asia" },
  { city: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, continent: "Asia" },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978, continent: "Asia" },
  { city: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, continent: "Asia" },
  { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, continent: "Asia" },
  { city: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694, continent: "Asia" },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, continent: "Asia" },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, continent: "Asia" },
  { city: "Taipei", country: "Taiwan", lat: 25.033, lng: 121.5654, continent: "Asia" },
  { city: "Bali", country: "Indonesia", lat: -8.3405, lng: 115.092, continent: "Asia" },
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, continent: "Oceania" },
  { city: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631, continent: "Oceania" },
];

const existing = await db.select({ count: sql<number>`count(*)` }).from(travelLocationsTable);
const rowCount = Number(existing[0]!.count);

if (rowCount > 0) {
  console.log(`DB already has ${rowCount} locations — skipping seed.`);
  process.exit(0);
}

await db.insert(travelLocationsTable).values(locations);
console.log(`Seeded ${locations.length} travel locations.`);
process.exit(0);
