/**
 * Helper to generate a valid, standard SKU string compliant with Google Merchant Center
 * and Schema.org recommendations (strictly <= 50 chars, no whitespace).
 * Derived genuine unique identifier from product ID or slug.
 */
export function generateSku(id?: string | null, slug?: string | null): string {
  if (id && typeof id === "string") {
    const cleanId = id.trim().replace(/\s+/g, "");
    if (cleanId.length >= 6) {
      const formatted = cleanId.startsWith("SKU-") ? cleanId : `SKU-${cleanId}`;
      return formatted.length <= 50 ? formatted : formatted.slice(0, 50);
    }
  }

  if (slug && typeof slug === "string") {
    const cleanSlug = slug.trim().replace(/\s+/g, "");
    if (cleanSlug.length > 0) {
      const formatted = cleanSlug.startsWith("SKU-") ? cleanSlug : `SKU-${cleanSlug}`;
      return formatted.length <= 50 ? formatted : formatted.slice(0, 50);
    }
  }

  return "SKU-DIGITAL";
}

/**
 * Safely parse a date value to ISO YYYY-MM-DD string without throwing RangeError.
 */
export function safeIsoDate(val?: unknown, fallback?: string): string {
  try {
    if (!val) {
      return fallback || new Date().toISOString().slice(0, 10);
    }
    const d = new Date(val as string | number | Date);
    if (isNaN(d.getTime())) {
      return fallback || new Date().toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  } catch {
    return fallback || new Date().toISOString().slice(0, 10);
  }
}

