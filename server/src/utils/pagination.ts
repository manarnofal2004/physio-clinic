import { z } from "zod";

export type SortOrder = 1 | -1;
export type SortSpec = Record<string, SortOrder>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Query params shared by every list endpoint: ?page=2&limit=10&sort=-createdAt&search=ahmad
// `sortFields` are the fields the endpoint allows; anything else is a 400.
export function listQuerySchema<const F extends readonly [string, ...string[]]>(
  sortFields: F,
  defaultSort = "-createdAt",
) {
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z
      .string()
      .default(defaultSort)
      .refine((value) => sortFields.includes(value.replace(/^-/, "")), {
        message: `Sort by one of: ${sortFields.join(", ")}`,
      })
      .transform(parseSort),
    search: z.string().trim().max(100).optional(),
  });
}

// "-createdAt" -> { createdAt: -1, _id: -1 }. The _id tie-breaker keeps pages
// stable when many rows share the same value.
export function parseSort(sort: string): SortSpec {
  const order: SortOrder = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "");
  return field === "_id" ? { _id: order } : { [field]: order, _id: order };
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
