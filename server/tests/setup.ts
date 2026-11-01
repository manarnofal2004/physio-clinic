// Runs before every test file: points the app at a separate test database,
// connects, and empties it between tests.
import "dotenv/config";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach } from "vitest";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI in server/.env to run the tests");

const testUri = new URL(uri);
testUri.pathname = "/physio-clinic-test";
process.env.MONGODB_URI = testUri.toString();
process.env.NODE_ENV = "test";

beforeAll(async () => {
  const { connectDb } = await import("../src/db/connect.js");
  await connectDb();
  // Build unique indexes before the tests rely on them.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});

beforeEach(async () => {
  // Every collection, including the GridFS ones that have no model.
  const collections = (await mongoose.connection.db?.collections()) ?? [];
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  if (mongoose.connection.name !== "physio-clinic-test") return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
