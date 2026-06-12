import { Router } from "express";
import healthRouter from "./health.js";
import locationsRouter from "./locations.js";
import adminRouter from "./admin.js";

const router = Router();

router.use(healthRouter);
router.use(locationsRouter);
router.use(adminRouter);

export default router;
