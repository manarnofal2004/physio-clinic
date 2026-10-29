import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";

// Builds the Express app without starting it, so tests can import it directly.
export function createApp() {
  const app = express();

  app.set("trust proxy", env.TRUST_PROXY);
  app.use(helmet());
  // Only the client app may call the API from a browser. Auth uses a header, not cookies.
  app.use(
    cors({
      origin: env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
