import { createFileRoute } from "@tanstack/react-router";
import ProductDetail from "@/pages/ProductDetail";

export const Route = createFileRoute("/product/$slug")({
  component: ProductDetail,
});
