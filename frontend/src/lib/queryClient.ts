import { QueryClient, type Query } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// Photos are kept in the cache as local links (blob:...), and the browser holds each
// link's data in memory until it is revoked. A query marked with meta.objectUrl gets
// its old link revoked when a new photo replaces it or the cache drops the query.
const links = new WeakMap<Query, string>();
queryClient.getQueryCache().subscribe((event) => {
  const { query } = event;
  if (!query.meta?.objectUrl) return;
  const old = links.get(query);
  const data: unknown = query.state.data;
  const current = event.type === "removed" || typeof data !== "string" ? undefined : data;
  if (old && old !== current) URL.revokeObjectURL(old);
  if (current) links.set(query, current);
  else links.delete(query);
});
