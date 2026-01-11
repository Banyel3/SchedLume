import { HEADER_ALIASES } from "../constants";

/**
 * Map raw CSV headers to canonical field names
 * Supports flexible header naming (e.g., "subject" -> "subject_name")
 */
export function mapHeaders(rawHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  const normalized = rawHeaders.map((h) =>
    h.toLowerCase().trim().replace(/\s+/g, "_")
  );

  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    const index = normalized.findIndex((h) => aliases.includes(h));
    if (index !== -1) {
      mapping.set(canonical, rawHeaders[index]);
    }
  }

  return mapping;
}

/**
 * Get a value from a raw row using the header mapping
 */
export function getMappedValue(
  row: Record<string, string | undefined>,
  headerMap: Map<string, string>,
  canonical: string
): string | undefined {
  const header = headerMap.get(canonical);
  return header ? row[header]?.trim() : undefined;
}
