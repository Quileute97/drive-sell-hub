import { createFileRoute } from "@tanstack/react-router";
import Withdrawal from "@/pages/Withdrawal";

export const Route = createFileRoute("/withdrawal")({
  component: Withdrawal,
});
