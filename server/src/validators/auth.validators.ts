import { z } from "zod";
import { email } from "./common.js";

export const loginBody = z.object({
  email,
  // No length rules here: a wrong password should get INVALID_CREDENTIALS, not a field error.
  password: z.string().min(1).max(128),
});

export type LoginBody = z.infer<typeof loginBody>;
