import { createFileRoute } from "@tanstack/react-router";
import ProductDetail from "@/pages/ProductDetail";
import { supabase } from "@/integrations/supabase/client";
import { buildHead, SITE_URL } from "@/lib/seoHead";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    try {
      const { data } = await supabase
        .from("products")
        .select(
          "title, short_description, description, price, thumbnail_url, meta_title, meta_description, rating_average, rating_count, created_at, updated_at",
        )
        .eq("slug", params.slug)
        .maybeSingle();
      if (!data) return null;
      return {
        title: data.meta_title || data.title,
        description:
          data.meta_description ||
          data.short_description ||
          (data.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
        price: data.price,
        image: data.thumbnail_url || null,
        rating: data.rating_average,
        ratingCount: data.rating_count,
        name: data.title,
      };
    } catch {
      return null;
    }
  },
  head: ({ params, loaderData }) => {
    const path = `/product/${params.slug}`;
    if (!loaderData) {
      return buildHead({
        title: "Sản phẩm digital",
        description:
          "Chi tiết sản phẩm digital trên Salemylink: ebook, tài liệu, khóa học, source code. Tải ngay sau khi thanh toán.",
        path,
        type: "product",
      });
    }
    const desc =
      loaderData.description ||
      `${loaderData.name} - sản phẩm digital chất lượng, tải xuống ngay sau khi thanh toán tại Salemylink.`;
    const structuredData: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: loaderData.name,
      description: desc.slice(0, 300),
      url: `${SITE_URL}${path}`,
      ...(loaderData.image ? { image: loaderData.image } : {}),
      offers: {
        "@type": "Offer",
        price: loaderData.price,
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}${path}`,
      },
      ...(loaderData.ratingCount && loaderData.ratingCount > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: loaderData.rating,
              reviewCount: loaderData.ratingCount,
            },
          }
        : {}),
    };
    return buildHead({
      title: loaderData.title,
      description: desc,
      path,
      type: "product",
      image: loaderData.image || undefined,
      structuredData,
    });
  },
  component: ProductDetail,
});
