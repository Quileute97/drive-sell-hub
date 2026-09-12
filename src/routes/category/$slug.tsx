import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/category/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/danh-muc/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
});
