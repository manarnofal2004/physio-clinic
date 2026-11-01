import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticate, requirePrivilege } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", authenticate, requirePrivilege("dashboard.view"), getDashboardStats);
