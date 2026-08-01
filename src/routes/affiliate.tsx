import { createFileRoute } from "@tanstack/react-router";
import Affiliate from "@/pages/Affiliate";

export const Route = createFileRoute("/affiliate")({
  component: Affiliate,
});
