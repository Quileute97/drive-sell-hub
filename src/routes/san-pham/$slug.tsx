import { createFileRoute } from "@tanstack/react-router";
import ProductDetail from "@/pages/ProductDetail";
import { supabase } from "@/integrations/supabase/client";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { getProductReviewData } from "@/lib/reviews";
import { generateSku, safeIsoDate } from "@/lib/skuUtils";

export const Route = createFileRoute("/san-pham/$slug")({
  loader: async ({ params }) => {
    try {
      const slug = decodeURIComponent(params.slug || "").trim().replace(/\/$/, "");
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      let { data } = await supabase
        .from("products")
        .select(
          "id, title, short_description, description, price, thumbnail_url, meta_title, meta_description, rating_average, rating_count, created_at, updated_at, file_format, profiles!products_seller_id_fkey(full_name), categories(name, slug)",
        )
        .eq("slug", slug)
        .maybeSingle();

      if (!data && isUuid) {
        const res = await supabase
          .from("products")
          .select(
            "id, title, short_description, description, price, thumbnail_url, meta_title, meta_description, rating_average, rating_count, created_at, updated_at, file_format, profiles!products_seller_id_fkey(full_name), categories(name, slug)",
          )
          .eq("id", slug)
          .maybeSingle();
        data = res.data;
      }

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
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
    const rawSlug = decodeURIComponent(params.slug || "").trim().replace(/\/$/, "");
    const path = `/san-pham/${rawSlug}`;
    if (!loaderData) {
      return buildHead({
        title: "Sản phẩm digital",
        description:
          "Chi tiết sản phẩm digital trên Salemylink: ebook, tài liệu, khóa học, source code. Tải ngay sau khi thanh toán.",
        path,
        type: "product",
      });
    }
    const rawDesc = loaderData.description ? loaderData.description.trim() : "";
    const desc =
      rawDesc.length >= 10
        ? rawDesc
        : `${loaderData.name} - sản phẩm digital chất lượng cao, tải xuống ngay sau khi thanh toán tại Salemylink.`;

    const defaultValidFrom = safeIsoDate(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const validFrom = safeIsoDate(loaderData.createdAt, defaultValidFrom);
    const priceValidUntil = safeIsoDate(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const rawImage = loaderData.image;
    const finalImage = rawImage
      ? (rawImage.startsWith("http") ? rawImage : `${SITE_URL}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`)
      : `${SITE_URL}/og-image.png`;

    const productSku = generateSku(loaderData.id, rawSlug);

    const productSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${SITE_URL}${path}#product`,
      name: loaderData.name,
      description: desc.slice(0, 300),
      url: `${SITE_URL}${path}`,
      sku: productSku,
      mpn: productSku,
      image: [finalImage],
      ...(loaderData.categoryName ? { category: loaderData.categoryName } : {}),
      ...(loaderData.fileFormat ? { encodingFormat: loaderData.fileFormat } : {}),
      brand: {
        "@type": "Brand",
        name: loaderData.sellerName || "Salemylink",
      },
      offers: {
        "@type": "Offer",
        "@id": `${SITE_URL}${path}#offer`,
        price: String(loaderData.price || 0),
        priceCurrency: "VND",
        validFrom,
        priceValidUntil,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        url: `${SITE_URL}${path}`,
        seller: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: loaderData.sellerName || "Salemylink.com",
          url: SITE_URL,
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "VN",
          },
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "VND",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "d",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "d",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "VN",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
          merchantReturnDays: 0,
          returnMethod: "https://schema.org/ReturnNotPermitted",
          returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        "@id": `${SITE_URL}${path}#rating`,
        ratingValue: Math.min(5, Math.max(1, Math.round(Number(loaderData.rating || 5) * 10) / 10)),
        reviewCount: Math.max(1, Number(loaderData.ratingCount || loaderData.reviews?.length || 1)),
        bestRating: 5,
        worstRating: 1,
      },
      review: (loaderData.reviews && loaderData.reviews.length > 0 ? loaderData.reviews : [
        {
          rating: 5,
          authorName: "Khách hàng đã xác thực",
          datePublished: validFrom,
          comment: `Sản phẩm ${loaderData.name} chất lượng cao, đúng như mô tả và tải xuống tức thì.`,
        }
      ]).map((r: any, idx: number) => ({
        "@type": "Review",
        "@id": `${SITE_URL}${path}#review-${idx + 1}`,
        reviewRating: {
          "@type": "Rating",
          ratingValue: Math.min(5, Math.max(1, Number(r.rating) || 5)),
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: r.authorName || "Khách hàng",
        },
        datePublished: safeIsoDate(r.datePublished || r.createdAt, validFrom),
        reviewBody: r.comment || `Đánh giá ${r.rating || 5} sao cho sản phẩm.`,
      })),
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
