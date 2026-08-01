import { createFileRoute } from "@tanstack/react-router";
import Sellers from "@/pages/Sellers";

export const Route = createFileRoute("/sellers")({
  component: Sellers,
});
