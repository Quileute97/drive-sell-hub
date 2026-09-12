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

      let query = supabase
        .from("products")
        .select(
          "id, slug, title, short_description, description, price, original_price, thumbnail_url, images, google_drive_link, download_only_link, read_only, meta_title, meta_description, rating_average, rating_count, download_count, view_count, file_size, file_format, tags, seller_id, category_id, created_at, updated_at, status, profiles!products_seller_id_fkey(full_name, avatar_url), categories(id, name, slug)"
        );

      let { data } = isUuid
        ? await query.or(`id.eq.${slug},slug.eq."${slug}"`).maybeSingle()
        : await query.eq("slug", slug).maybeSingle();

      if (!data) return null;

      const seller = (data as any).profiles;
      const category = (data as any).categories;

      // Fetch approved reviews & aggregate ratings for JSON-LD structured data
      const { ratingValue, reviewCount, reviews } = await getProductReviewData(
        data.id,
        Number(data.rating_average) || 0,
        Number(data.rating_count) || 0,
        5
      );

      const plainDescription = (data.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

      return {
        ...data,
        id: data.id,
        slug: data.slug,
        title: fixVietnameseEncoding(data.title),
        name: fixVietnameseEncoding(data.title),
        metaTitle: data.meta_title ? fixVietnameseEncoding(data.meta_title) : null,
        metaDescription: data.meta_description ? fixVietnameseEncoding(data.meta_description) : null,
        shortDescription: data.short_description ? fixVietnameseEncoding(data.short_description) : null,
        plainDescription,
        price: Number(data.price) || 0,
        original_price: data.original_price ? Number(data.original_price) : null,
        thumbnail_url: data.thumbnail_url || null,
        images: data.images || [],
        ratingAverage: Number(data.rating_average) || 0,
        ratingCount: reviewCount,
        ratingValue,
        reviews,
        sellerName: seller?.full_name || null,
        sellerAvatar: seller?.avatar_url || null,
        categoryName: category?.name || null,
        categorySlug: category?.slug || null,
        fileFormat: data.file_format || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
        title: "Sản phẩm digital | Salemylink",
        description:
          "Chi tiết sản phẩm digital trên Salemylink: ebook, tài liệu, khóa học, source code. Tải ngay sau khi thanh toán.",
        path,
        type: "product",
      });
    }

    const formattedPrice =
      Number(loaderData.price) === 0
        ? "Miễn phí"
        : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(loaderData.price);

    // Unique Title for every product
    const customTitle = loaderData.metaTitle;
    const title = customTitle && customTitle.length >= 15
      ? (customTitle.includes("Salemylink") ? customTitle : `${customTitle} | Salemylink`)
      : `${loaderData.name} - ${formattedPrice} | Salemylink`;

    // Unique Meta Description for every product
    const categoryInfo = loaderData.categoryName ? ` (${loaderData.categoryName})` : "";
    const formatInfo = loaderData.fileFormat ? ` định dạng ${loaderData.fileFormat}` : "";
    const customDesc = loaderData.metaDescription || loaderData.shortDescription;
    const desc =
      customDesc && customDesc.length >= 20
        ? `${customDesc} — Tải ngay tại Salemylink.`
        : `${loaderData.name}${categoryInfo}${formatInfo}. Giao dịch an toàn, tải xuống ngay sau khi thanh toán qua Google Drive trên Salemylink.`;

    const defaultValidFrom = safeIsoDate(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const validFrom = safeIsoDate(loaderData.createdAt, defaultValidFrom);
    const priceValidUntil = safeIsoDate(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const rawImage = loaderData.thumbnail_url;
    const hasRealImage = Boolean(rawImage && typeof rawImage === "string" && !rawImage.includes("placeholder"));
    const finalImage = hasRealImage
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
      ...(hasRealImage ? { image: [finalImage] } : {}),
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
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
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
    };

    // Only add aggregateRating and review if real reviews exist in the database
    if (loaderData.ratingCount > 0 && loaderData.reviews && loaderData.reviews.length > 0) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        "@id": `${SITE_URL}${path}#rating`,
        ratingValue: Math.min(5, Math.max(1, Math.round(Number(loaderData.ratingValue || loaderData.ratingAverage || 5) * 10) / 10)),
        reviewCount: Number(loaderData.ratingCount),
        ratingCount: Number(loaderData.ratingCount),
        bestRating: 5,
        worstRating: 1,
      };
      productSchema.review = loaderData.reviews.map((r: any, idx: number) => ({
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
        publisher: {
          "@type": "Organization",
          name: "Salemylink.com",
          url: SITE_URL,
        },
      }));
    }

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
      title,
      description: desc,
      path,
      type: "product",
      image: hasRealImage ? finalImage : undefined,
      structuredData: [productSchema, breadcrumb],
    });
  },
  component: ProductRoutePage,
});

function ProductRoutePage() {
  const loaderData = Route.useLoaderData();
  return <ProductDetail initialProduct={loaderData} />;
}
