// Starts MongoDB in Docker only when backend/.env points at a local database,
// so `pnpm dev` also works with MongoDB Atlas or another remote server.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

const env = parseEnv(readFileSync("backend/.env", "utf8"));
const uri = env.MONGODB_URI ?? "";

// "mongodb://user:pass@host1:27017,host2:27017/db?options" -> ["host1", "host2"]
const hostList = uri
  .replace(/^mongodb(\+srv)?:\/\//, "")
  .split(/[/?]/)[0]
  .split("@")
  .pop();
const hosts = hostList.split(",").map((host) => host.replace(/:\d+$/, ""));

if (hosts.every((host) => LOCAL_HOSTS.has(host))) {
  try {
    execSync("docker compose up -d --wait", { stdio: "inherit" });
  } catch {
    process.exit(1);
  }
} else {
  console.info("MONGODB_URI is not local, so Docker MongoDB is skipped.");
}
