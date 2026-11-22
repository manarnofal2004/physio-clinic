import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./db/connect.js";
import { deleteOrphanUploads } from "./services/uploads.service.js";

const HOUR_MS = 60 * 60 * 1000;

function cleanOrphanUploads() {
  deleteOrphanUploads()
    .then((count) => count > 0 && console.info(`Deleted ${count} unused upload(s)`))
    .catch((err: unknown) => console.error("Upload cleanup failed:", err));
}

async function main() {
  await connectDb();

  const server = createApp().listen(env.PORT, () => {
    console.info(`Server listening on http://localhost:${env.PORT}`);
  });

  cleanOrphanUploads();
  const cleanup = setInterval(cleanOrphanUploads, HOUR_MS);

  const shutdown = () => {
    clearInterval(cleanup);
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
