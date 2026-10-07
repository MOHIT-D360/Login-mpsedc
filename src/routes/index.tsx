import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "S3 Eternals | Secure team access" },
      { name: "description", content: "Secure sign-in for the S3 Eternals team." },
      { property: "og:title", content: "S3 Eternals | Secure team access" },
      { property: "og:description", content: "Secure sign-in for the S3 Eternals team." },
    ],
  }),
});
