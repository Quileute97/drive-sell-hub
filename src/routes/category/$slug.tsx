import { createFileRoute } from "@tanstack/react-router";
import Category from "@/pages/Category";

export const Route = createFileRoute("/category/$slug")({
  component: Category,
});
