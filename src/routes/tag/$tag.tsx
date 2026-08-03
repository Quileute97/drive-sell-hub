import { createFileRoute } from "@tanstack/react-router";
import TagProducts from "@/pages/TagProducts";
import { getTagSeo } from "@/data/seoOverrides";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/tag/$tag")({
  head: ({ params }) => {
    const tag = decodeURIComponent(params.tag);
    const seo = getTagSeo(tag);
    return buildHead({
      title: seo.title,
      description: seo.description,
      path: `/tag/${params.tag}`,
      keywords: seo.keywords,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      twTitle: seo.twTitle,
      twDescription: seo.twDescription,
    });
  },
  component: TagProducts,
});
