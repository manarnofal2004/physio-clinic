import { Router } from "express";
import { healthRouter } from "./health.js";

// All API routes are mounted here under /api.
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
