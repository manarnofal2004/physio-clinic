import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const idParams = z.object({ id: objectId });

// Query strings are text, so "true" / "false" become real booleans.
export const booleanQuery = z.enum(["true", "false"]).transform((value) => value === "true");

export const password = z.string().min(8).max(128);

export const fullName = z.string().trim().min(2).max(120);

export const email = z.string().trim().toLowerCase().pipe(z.email());
