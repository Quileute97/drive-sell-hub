import { createFileRoute } from "@tanstack/react-router";
import Category from "@/pages/Category";
import { getCategorySeo } from "@/data/seoOverrides";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.slug)
      .split("-")
      .join(" ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const seo = getCategorySeo(params.slug, name);
    return buildHead({
      title: seo.title,
      description: seo.description,
      path: `/category/${params.slug}`,
      keywords: seo.keywords,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      twTitle: seo.twTitle,
      twDescription: seo.twDescription,
    });
  },
  component: Category,
});
