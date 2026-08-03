import { createFileRoute } from "@tanstack/react-router";
import ReadOnline from "@/pages/ReadOnline";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/read/$slug")({
  head: ({ params }) =>
    buildHead({
      title: "Đọc trực tuyến",
      description: "Đọc tài liệu trực tuyến trên Salemylink.",
      path: `/read/${params.slug}`,
      noindex: true,
    }),
  component: ReadOnline,
});
