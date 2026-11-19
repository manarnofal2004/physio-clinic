// Copies each .env.example to .env when .env is missing, so a fresh clone runs with local defaults.
import { copyFileSync, existsSync } from "node:fs";

for (const dir of ["server", "client"]) {
  const target = `${dir}/.env`;
  if (existsSync(target)) continue;
  copyFileSync(`${dir}/.env.example`, target);
  console.info(`created ${target} from ${target}.example`);
}
