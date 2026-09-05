// ported from main.tsx
import "@fontsource/inter";

import { useEffect } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AffiliateTracker } from "@/components/AffiliateTracker";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import NotFound from "@/pages/NotFound";
import appCss from "../styles.css?url";

// Structured data preserved from index.html (single @graph script tag) with multilingual support
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://salemylink.com/#website",
      url: "https://salemylink.com",
      name: "Salemylink.com",
      alternateName: ["Salemylink", "Sale My Link"],
      description: "Nền tảng bán sản phẩm digital hàng đầu Việt Nam - Digital Products Marketplace",
      inLanguage: ["vi-VN", "en-US", "zh-CN", "es-ES"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://salemylink.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://salemylink.com/#organization",
      name: "Salemylink.com",
      url: "https://salemylink.com",
      logo: {
        "@type": "ImageObject",
        url: "https://salemylink.com/logo.png",
        width: 512,
        height: 512,
      },
      image: "https://salemylink.com/og-image.png",
      description: "Nền tảng thương mại điện tử hàng đầu cho sản phẩm digital tại Việt Nam.",
      foundingDate: "2024",
      areaServed: [{ "@type": "Country", name: "Vietnam" }, { "@type": "AdministrativeArea", name: "Worldwide" }],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@salemylink.com",
        availableLanguage: ["Vietnamese", "English", "Chinese", "Spanish"],
      },
    },
    {
      "@type": "OnlineStore",
      name: "Salemylink.com",
      url: "https://salemylink.com",
      description: "Marketplace sản phẩm digital - Mua bán ebook, tài liệu, khóa học online",
      currenciesAccepted: "VND, USD",
      paymentAccepted: "Credit Card, Bank Transfer, PayOS",
      priceRange: "₫₫ / $$",
      areaServed: "Worldwide",
    },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Salemylink - Marketplace sản phẩm Digital Việt Nam" },
      {
        name: "description",
        content:
          "Marketplace sản phẩm digital Việt Nam. Mua bán ebook, tài liệu, khóa học qua Google Drive an toàn, nhanh chóng.",
      },
      { name: "author", content: "Salemylink.com" },
      {
        name: "keywords",
        content:
          "bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital, bán tài liệu online",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://salemylink.com/" },
      { property: "og:image", content: "https://salemylink.com/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Salemylink - Marketplace sản phẩm digital Việt Nam",
      },
      { property: "og:locale", content: "vi_VN" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:locale:alternate", content: "zh_CN" },
      { property: "og:locale:alternate", content: "es_ES" },
      { property: "og:site_name", content: "Salemylink.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://salemylink.com/" },
      { name: "twitter:image", content: "https://salemylink.com/og-image.png" },
      {
        name: "twitter:image:alt",
        content: "Salemylink - Marketplace sản phẩm digital Việt Nam",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "googlebot",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "bingbot",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "baiduspider",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "yandexbot",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "theme-color", content: "#0f3a7e" },
      { name: "format-detection", content: "telephone=no" },
      { name: "geo.region", content: "VN" },
      { name: "geo.placename", content: "Vietnam" },
      { name: "language", content: "Vietnamese, English, Chinese, Spanish" },
      { httpEquiv: "content-language", content: "vi, en, zh, es" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "alternate", hrefLang: "vi", href: "https://salemylink.com/" },
      { rel: "alternate", hrefLang: "vi-VN", href: "https://salemylink.com/" },
      { rel: "alternate", hrefLang: "en", href: "https://salemylink.com/?lang=en" },
      { rel: "alternate", hrefLang: "en-US", href: "https://salemylink.com/?lang=en" },
      { rel: "alternate", hrefLang: "zh", href: "https://salemylink.com/?lang=zh" },
      { rel: "alternate", hrefLang: "zh-CN", href: "https://salemylink.com/?lang=zh" },
      { rel: "alternate", hrefLang: "es", href: "https://salemylink.com/?lang=es" },
      { rel: "alternate", hrefLang: "es-ES", href: "https://salemylink.com/?lang=es" },
      { rel: "alternate", hrefLang: "x-default", href: "https://salemylink.com/" },
      { rel: "preconnect", href: "https://dfalphamyvdfewixrnju.supabase.co" },
      { rel: "preconnect", href: "https://drive.google.com" },
      { rel: "dns-prefetch", href: "https://drive.google.com" },
      { rel: "dns-prefetch", href: "https://lh3.googleusercontent.com" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      // Google tag (gtag.js)
      { src: "https://www.googletagmanager.com/gtag/js?id=G-W8381N2VE8", async: true },
      {
        children:
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W8381N2VE8');",
      },
      // Google AdSense
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7347008033628572",
        async: true,
        crossOrigin: "anonymous",
      },
      // Structured data - combined @graph
      { type: "application/ld+json", children: JSON.stringify(structuredData) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Web Vitals monitoring after app mounts
  useEffect(() => {
    import("@/lib/webVitals").then(({ initWebVitals }) => {
      initWebVitals();
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AffiliateTracker />
            <Outlet />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-semibold text-foreground">This page didn't load</h1>
        <p className="text-muted-foreground">
          Đã xảy ra lỗi. Bạn có thể thử lại hoặc quay về trang chủ.
        </p>
        <div className="flex justify-center gap-2">
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a
            className="px-4 py-2 rounded-md border border-border bg-background text-foreground"
            href="/"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
