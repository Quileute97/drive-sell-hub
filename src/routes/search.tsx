import { createFileRoute } from "@tanstack/react-router";
import SearchProducts from "@/pages/SearchProducts";

export const Route = createFileRoute("/search")({
  component: SearchProducts,
});
