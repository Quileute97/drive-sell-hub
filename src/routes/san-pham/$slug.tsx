import { createFileRoute } from "@tanstack/react-router";
import ProductDetail from "@/pages/ProductDetail";
import { supabase } from "@/integrations/supabase/client";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { getProductReviewData } from "@/lib/reviews";

export const Route = createFileRoute("/san-pham/$slug")({
  loader: async ({ params }) => {
    try {
      const { data } = await supabase
        .from("products")
        .select(
          "id, title, short_description, description, price, thumbnail_url, meta_title, meta_description, rating_average, rating_count, created_at, updated_at, file_format, profiles!products_seller_id_fkey(full_name), categories(name, slug)",
        )
        .eq("slug", params.slug)
        .maybeSingle();
      if (!data) return null;
      const seller = (data as { profiles?: { full_name?: string | null } | null }).profiles;
      const category = (data as { categories?: { name?: string; slug?: string } | null }).categories;

      // Fetch approved reviews & aggregate ratings for JSON-LD structured data
      const { ratingValue, reviewCount, reviews } = await getProductReviewData(
        data.id,
        Number(data.rating_average) || 0,
        Number(data.rating_count) || 0,
        5
      );

      return {
        title: fixVietnameseEncoding(data.meta_title || data.title),
        description: fixVietnameseEncoding(
          data.meta_description ||
            data.short_description ||
            (data.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
        ),
        price: data.price,
        image: data.thumbnail_url || null,
        rating: ratingValue,
        ratingCount: reviewCount,
        reviews,
        name: fixVietnameseEncoding(data.title),
        sellerName: seller?.full_name || null,
        categoryName: category?.name || null,
        categorySlug: category?.slug || null,
        fileFormat: data.file_format || null,
      };
    } catch {
      return null;
    }
  },
  head: ({ params, loaderData }) => {
    const path = `/san-pham/${params.slug}`;
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

    const productSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: loaderData.name,
      description: desc.slice(0, 300),
      url: `${SITE_URL}${path}`,
      sku: params.slug,
      ...(loaderData.image ? { image: loaderData.image } : {}),
      ...(loaderData.categoryName ? { category: loaderData.categoryName } : {}),
      ...(loaderData.fileFormat ? { encodingFormat: loaderData.fileFormat } : {}),
      brand: {
        "@type": "Brand",
        name: loaderData.sellerName || "Salemylink",
      },
      ...(loaderData.sellerName
        ? { manufacturer: { "@type": "Organization", name: loaderData.sellerName } }
        : {}),
      offers: {
        "@type": "Offer",
        price: loaderData.price,
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        url: `${SITE_URL}${path}`,
        seller: {
          "@type": "Organization",
          name: loaderData.sellerName || "Salemylink.com",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: loaderData.rating || 0,
        reviewCount: loaderData.ratingCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
      review: (loaderData.reviews && loaderData.reviews.length > 0)
        ? loaderData.reviews.map((r: any) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating || 5,
              bestRating: 5,
              worstRating: 1,
            },
            author: {
              "@type": "Person",
              name: r.authorName || "Người mua",
            },
            datePublished: r.datePublished || (r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
            reviewBody: r.comment || "Sản phẩm chất lượng, đúng mô tả.",
          }))
        : [],
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        ...(loaderData.categorySlug
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: loaderData.categoryName,
                item: `${SITE_URL}/danh-muc/${loaderData.categorySlug}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: loaderData.categorySlug ? 3 : 2,
          name: loaderData.name,
          item: `${SITE_URL}${path}`,
        },
      ],
    };

    return buildHead({
      title: loaderData.title,
      description: desc,
      path,
      type: "product",
      image: loaderData.image || undefined,
      structuredData: [productSchema, breadcrumb],
    });
  },
  component: ProductDetail,
});
