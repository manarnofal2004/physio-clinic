import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { bannersRouter } from "./banners.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { healthRouter } from "./health.js";
import { patientsRouter } from "./patients.routes.js";
import { publicRouter } from "./public.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { reservationsRouter } from "./reservations.routes.js";
import { therapistsRouter } from "./therapists.routes.js";
import { uploadsRouter } from "./uploads.routes.js";
import { usersRouter } from "./users.routes.js";

// All API routes are mounted here under /api.
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/therapists", therapistsRouter);
apiRouter.use("/patients", patientsRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/reservations", reservationsRouter);
apiRouter.use("/banners", bannersRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/public", publicRouter);
