import { createFileRoute } from "@tanstack/react-router";
import SellerDashboard from "@/pages/SellerDashboard";

export const Route = createFileRoute("/seller-dashboard")({
  component: SellerDashboard,
});
