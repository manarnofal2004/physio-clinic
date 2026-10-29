import type { z } from "zod";
import { listQuerySchema } from "../utils/pagination.js";

export const listMyReportsQuery = listQuerySchema(["date", "createdAt"] as const, "-date");

export type ListMyReportsQuery = z.infer<typeof listMyReportsQuery>;
