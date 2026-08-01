import { supabase } from "@/integrations/supabase/client";

const COOKIE_NAME = "aff_ref";
const VISITOR_KEY = "aff_visitor";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return match && match[2] ? decodeURIComponent(match[2]) : null;
}

function getVisitorId(): string {
  let v = localStorage.getItem(VISITOR_KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, v);
  }
  return v;
}

export function getAffiliateRefCode(): string | null {
  return getCookie(COOKIE_NAME);
}

export async function captureAffiliateRef(productId?: string) {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("ref");
  if (!code) return;

  setCookie(COOKIE_NAME, code, COOKIE_DAYS);

  try {
    await supabase.rpc("log_affiliate_click", {
      _code: code,
      ...(productId ? { _product_id: productId } : {}),
      _visitor_id: getVisitorId(),
      ...(document.referrer ? { _referrer: document.referrer } : {}),
      _user_agent: navigator.userAgent,
    });
  } catch (e) {
    console.warn("Affiliate click log failed", e);
  }
}

export async function resolveAffiliateId(): Promise<string | null> {
  const code = getAffiliateRefCode();
  if (!code) return null;
  const { data, error } = await supabase.rpc("resolve_affiliate_code", { _code: code });
  if (error) return null;
  return (data as string) ?? null;
}

export function clearAffiliateRef() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
