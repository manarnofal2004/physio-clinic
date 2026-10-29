import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.info("Connected to MongoDB");
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
