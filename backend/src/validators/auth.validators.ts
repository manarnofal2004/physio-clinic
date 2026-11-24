import { z } from "zod";
import { email } from "./common.js";

export const loginBody = z.object({
  email,
  // No length rules here: a wrong password should get INVALID_CREDENTIALS, not a field error.
  password: z.string().min(1).max(128),
});

export type LoginBody = z.infer<typeof loginBody>;

// The ID token the Google button hands the page.
export const googleLoginBody = z.object({
  credential: z.string().min(1).max(4096),
});

export type GoogleLoginBody = z.infer<typeof googleLoginBody>;
