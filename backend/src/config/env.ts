import "dotenv/config";
import { z } from "zod";

// Validate environment variables once at startup so a missing value fails fast
// instead of breaking a request later.
const EXAMPLE_SECRET = "change-me-to-a-long-random-string";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z.string().default("1d"),
    // One origin, or several separated by commas: only these sites may call the API.
    // Kept as origins ("http://localhost:5173/" -> "http://localhost:5173"), because that
    // is what the browser sends, so a trailing slash or path cannot break CORS.
    CLIENT_URL: z
      .string()
      .transform((value) => value.split(",").map((url) => url.trim()))
      .pipe(z.array(z.url()).min(1))
      .transform((urls) => urls.map((url) => new URL(url).origin)),
    CLINIC_TIMEZONE: z.string().default("Asia/Hebron"),
    // Behind a hosting proxy, set to the number of proxies so rate limits see the real IP.
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  })
  .refine(
    (env) =>
      env.NODE_ENV !== "production" ||
      (env.JWT_SECRET.length >= 32 && env.JWT_SECRET !== EXAMPLE_SECRET),
    {
      message: "In production JWT_SECRET must be at least 32 random characters",
      path: ["JWT_SECRET"],
    },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
