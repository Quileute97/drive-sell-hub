import { supabase } from "@/integrations/supabase/client";
import { normalizeSlug } from "@/lib/slugUtils";

export interface SellerProfileData {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_verified: boolean | null;
  total_sales: number | null;
  role: string | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getSellerSlug(seller: { full_name?: string | null; user_id?: string }): string {
  if (seller.full_name && seller.full_name.trim()) {
    const slug = normalizeSlug(seller.full_name);
    if (slug) return slug;
  }
  return seller.user_id || "";
}

export async function fetchSellerBySlugOrId(slug: string): Promise<SellerProfileData | null> {
  if (!slug) return null;

  try {
    // 1. Direct UUID lookup
    if (UUID_REGEX.test(slug)) {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, created_at, is_verified, total_sales, role")
        .eq("user_id", slug)
        .maybeSingle();

      if (!error && data) {
        return data as SellerProfileData;
      }
    }

    // 2. Lookup by full_name matching slug
    const nameSearch = slug.replace(/-/g, " ");
    const { data: searchResults, error: searchError } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, created_at, is_verified, total_sales, role")
      .ilike("full_name", `%${nameSearch}%`)
      .limit(10);

    if (!searchError && searchResults && searchResults.length > 0) {
      const exactMatch = searchResults.find(
        (p) => normalizeSlug(p.full_name || "") === slug
      );
      if (exactMatch) return exactMatch as SellerProfileData;
      return searchResults[0] as SellerProfileData;
    }

    // 3. Fallback: scan active sellers
    const { data: allSellers } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, created_at, is_verified, total_sales, role")
      .not("full_name", "is", null)
      .limit(100);

    if (allSellers) {
      const match = allSellers.find(
        (p) => normalizeSlug(p.full_name || "") === slug
      );
      if (match) return match as SellerProfileData;
    }

    return null;
  } catch (err) {
    console.error("Error fetching seller by slug:", err);
    return null;
  }
}
