import { createFileRoute } from "@tanstack/react-router";
import { QuickCreate } from "@/features/creation/QuickCreate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Create a card — Dearly Studio" },
      {
        name: "description",
        content:
          "Create and share a personal card from one photo. Preview for free. No card required.",
      },
      { property: "og:title", content: "Create a card — Dearly Studio" },
      {
        property: "og:description",
        content: "Turn one photo and a meaningful message into something ready to share.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <QuickCreate homeMode />,
});
