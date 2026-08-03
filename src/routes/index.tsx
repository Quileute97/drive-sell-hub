import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/")({
  head: () =>
    buildHead({
      title: "Salemylink – Mua bán tài liệu số, ebook, khóa học",
      description:
        "Marketplace mua bán tài liệu số, ebook, khóa học online qua Google Drive. Giao dịch an toàn, tải xuống ngay sau khi thanh toán.",
      path: "/",
      keywords:
        "bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, marketplace digital",
    }),
  component: Index,
});
