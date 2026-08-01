import { createFileRoute } from "@tanstack/react-router";
import TagProducts from "@/pages/TagProducts";

export const Route = createFileRoute("/tag/$tag")({
  component: TagProducts,
});
