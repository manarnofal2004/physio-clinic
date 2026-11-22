// Escapes regex special characters so user input is matched literally.
// Without this, a search like "(a+)+" could slow the database down or match the wrong rows.
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Case-insensitive "contains" search over several fields.
// Returns {} when there is nothing to search, so it can be spread into any filter.
export function buildSearchFilter(search: string | undefined, fields: readonly string[]) {
  const text = search?.trim();
  if (!text || fields.length === 0) return {};

  const pattern = escapeRegex(text);
  return { $or: fields.map((field) => ({ [field]: { $regex: pattern, $options: "i" } })) };
}
