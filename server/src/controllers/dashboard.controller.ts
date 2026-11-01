import type { RequestHandler } from "express";
import { currentUser } from "../middleware/auth.js";
import { dashboardStats } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

export const getDashboardStats: RequestHandler = async (req, res) => {
  sendSuccess(res, await dashboardStats(currentUser(req)));
};
