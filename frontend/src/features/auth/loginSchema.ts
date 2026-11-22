import type { TFunction } from "i18next";
import { z } from "zod";

// Takes t so the messages come out in the current language. The password has no length
// rule, like the server: a wrong one should get the server's answer, not a field error.
export const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .pipe(z.email(t("login.errors.invalidEmail"))),
    password: z.string().min(1, t("login.errors.passwordRequired")),
  });

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
