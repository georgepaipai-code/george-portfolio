import { Router, type IRouter } from "express";
import { db, travelLocationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateLocationBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/locations", async (req, res) => {
  const locations = await db.select().from(travelLocationsTable).orderBy(travelLocationsTable.createdAt);
  res.json(locations);
});

router.post("/locations", requireAuth, async (req, res) => {
  const parsed = CreateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", details: parsed.error.issues });
    return;
  }
  const [created] = await db.insert(travelLocationsTable).values(parsed.data).returning();
  res.status(201).json(created);
});

router.delete("/locations/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await db.delete(travelLocationsTable).where(eq(travelLocationsTable.id, id)).returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});

export default router;
