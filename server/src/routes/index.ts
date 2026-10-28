import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.js";
import { patientsRouter } from "./patients.routes.js";
import { therapistsRouter } from "./therapists.routes.js";
import { usersRouter } from "./users.routes.js";

// All API routes are mounted here under /api.
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/therapists", therapistsRouter);
apiRouter.use("/patients", patientsRouter);
