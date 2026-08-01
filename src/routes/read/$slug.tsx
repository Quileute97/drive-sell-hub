import { createFileRoute } from "@tanstack/react-router";
import ReadOnline from "@/pages/ReadOnline";

export const Route = createFileRoute("/read/$slug")({
  component: ReadOnline,
});
