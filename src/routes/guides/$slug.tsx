import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/guides/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/huong-dan/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
});
