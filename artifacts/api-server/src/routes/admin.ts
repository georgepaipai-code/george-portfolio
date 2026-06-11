import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { AdminLoginResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const expected = process.env["ADMIN_PASSWORD"];
  const secret = process.env["SESSION_SECRET"];

  if (!expected || !secret) {
    res.status(500).json({ error: "Server misconfigured" });
    return;
  }

  if (!password || password !== expected) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "7d" });
  const data = AdminLoginResponse.parse({ token });
  res.json(data);
});

export default router;
