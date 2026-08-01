import { createFileRoute } from "@tanstack/react-router";
import SellerProfile from "@/pages/SellerProfile";

export const Route = createFileRoute("/seller/$sellerId")({
  component: SellerProfile,
});
