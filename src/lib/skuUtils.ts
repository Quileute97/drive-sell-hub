/**
 * Helper to generate a valid, standard SKU / MPN string compliant with Google Merchant Center
 * and Schema.org recommendations (max length 50 chars, recommended alphanumeric with hyphens).
 */
export function generateSku(id?: string | null, slug?: string | null): string {
  if (id && typeof id === "string") {
    const alphanumeric = id.replace(/[^a-zA-Z0-9]/g, "");
    if (alphanumeric.length >= 6) {
      return `SKU-${alphanumeric.slice(0, 12).toUpperCase()}`;
    }
  }

  if (slug && typeof slug === "string") {
    const alphanumeric = slug.replace(/[^a-zA-Z0-9]/g, "");
    if (alphanumeric.length > 0) {
      const suffix = alphanumeric.slice(-12).toUpperCase();
      return `SKU-${suffix}`;
    }
  }

  return "SKU-ITEM";
}

/**
 * Safely parse a date value to ISO YYYY-MM-DD string without throwing RangeError.
 */
export function safeIsoDate(val?: any, fallback?: string): string {
  try {
    if (!val) {
      return fallback || new Date().toISOString().slice(0, 10);
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      return fallback || new Date().toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  } catch {
    return fallback || new Date().toISOString().slice(0, 10);
  }
}
