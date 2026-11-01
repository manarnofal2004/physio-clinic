import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./db/connect.js";

async function main() {
  await connectDb();

  const server = createApp().listen(env.PORT, () => {
    console.info(`Server listening on http://localhost:${env.PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      void disconnectDb().then(() => process.exit(0));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
