import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self), browsing-topics=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://ep2.adtrafficquality.google https://partner.googleadservices.com https://tpc.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://dfalphamyvdfewixrnju.supabase.co https://drive.google.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://doc-*.googleusercontent.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://*.google.com https://*.google.com.vn https://*.googleapis.com https://*.gstatic.com; media-src 'self' blob: https://drive.google.com https://*.googleusercontent.com; frame-src 'self' https://drive.google.com https://docs.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://*.google.com; connect-src 'self' https://dfalphamyvdfewixrnju.supabase.co wss://dfalphamyvdfewixrnju.supabase.co https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep2.adtrafficquality.google https://api.indexnow.org https://www.bing.com https://*.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests;",
};

function applySecurityHeaders(res: Response): Response {
  const newHeaders = new Headers(res.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!newHeaders.has(key)) {
      newHeaders.set(key, value);
    }
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function applyCacheHeaders(request: Request, res: Response): Response {
  if (request.method !== "GET" || res.status !== 200) {
    return res;
  }

  const url = new URL(request.url);
  const isPrivate = /^\/(admin|seller-dashboard|seller-auth|auth|cart|withdrawal|payment)(\/|$)/.test(url.pathname);

  const newHeaders = new Headers(res.headers);
  if (isPrivate) {
    newHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  } else if (!newHeaders.has("Cache-Control")) {
    // Cache public HTML for 1 hour locally, 24 hours at Cloudflare Edge CDN
    newHeaders.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Explicit handler for sitemap-index.xml to prevent 500/404 SSR errors
      if (url.pathname === "/sitemap-index.xml") {
        const today = new Date().toISOString().split("T")[0];
        const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://salemylink.com/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
        return applySecurityHeaders(
          new Response(sitemapIndexXml, {
            status: 200,
            headers: {
              "content-type": "application/xml; charset=utf-8",
              "cache-control": "public, max-age=86400",
            },
          }),
        );
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      const withCache = applyCacheHeaders(request, normalized);
      return applySecurityHeaders(withCache);
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
