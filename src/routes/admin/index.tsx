import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/pages/AdminDashboard";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/admin/")({
  head: () =>
    buildHead({
      title: "Quản trị",
      description: "Trang quản trị Salemylink.",
      path: "/admin",
      noindex: true,
    }),
  component: AdminDashboard,
});
