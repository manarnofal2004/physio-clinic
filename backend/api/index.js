// Vercel runs the API as a serverless function: every request comes through here.
// It uses the compiled app in dist/ (built by `pnpm build` on Vercel), connects to
// MongoDB once per warm instance, and hands the request to Express.
import { createApp } from "../dist/app.js";
import { connectDb } from "../dist/db/connect.js";

const app = createApp();
let connecting;

export default async function handler(req, res) {
  connecting ??= connectDb().catch((err) => {
    // Let the next request try again instead of failing forever.
    connecting = undefined;
    throw err;
  });
  await connecting;
  return app(req, res);
}
