import { createFileRoute } from "@tanstack/react-router";
import GuideDetail from "@/pages/GuideDetail";

export const Route = createFileRoute("/guides/$slug")({
  component: GuideDetail,
});
