import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/seller/$sellerId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/nguoi-ban/$slug",
      params: { slug: params.sellerId },
      statusCode: 301,
    });
  },
});
