import { createFileRoute } from "@tanstack/react-router";
import SellerAuth from "@/pages/SellerAuth";

export const Route = createFileRoute("/seller-signup")({
  component: SellerAuth,
});
