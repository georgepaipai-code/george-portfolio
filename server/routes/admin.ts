import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";

const router = Router();

const AdminLoginBody = z.object({
  password: z.string().min(1),
});

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { password } = parsed.data;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  const token = jwt.sign({ admin: true }, process.env.SESSION_SECRET ?? "dev-secret", { expiresIn: "7d" });
  res.json({ token });
});

export default router;
