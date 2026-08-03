import { createFileRoute } from "@tanstack/react-router";
import Sellers from "@/pages/Sellers";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/sellers")({
  head: () =>
    buildHead({
      title: "Danh sách người bán uy tín",
      description: "Khám phá cộng đồng người bán tài liệu số uy tín trên Salemylink: đánh giá thật, sản phẩm chất lượng.",
      path: "/sellers",
    }),
  component: Sellers,
});
