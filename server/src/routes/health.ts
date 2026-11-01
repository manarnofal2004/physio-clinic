import { Router } from "express";
import mongoose from "mongoose";
import { sendSuccess } from "../utils/response.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const db = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  sendSuccess(res, { status: "ok", db });
});
