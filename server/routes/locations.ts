import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const CreateLocationBody = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  continent: z.string().min(1),
});

router.get("/locations", async (_req, res) => {
  try {
    const locations = await db.select().from(schema.travelLocationsTable).orderBy(schema.travelLocationsTable.createdAt);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

router.post("/locations", requireAuth, async (req, res) => {
  const parsed = CreateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.errors });
    return;
  }
  try {
    const [location] = await db
      .insert(schema.travelLocationsTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: "Failed to create location" });
  }
});

router.delete("/locations/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(schema.travelLocationsTable).where(eq(schema.travelLocationsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete location" });
  }
});

export default router;
