import { Router } from "express";
import { getMe, postLogin } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { loginBody } from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate({ body: loginBody }), postLogin);
authRouter.get("/me", authenticate, getMe);
