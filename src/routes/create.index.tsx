import { createFileRoute } from "@tanstack/react-router";
import { QuickCreate } from "@/features/creation/QuickCreate";

export const Route = createFileRoute("/create/")({
  head: () => ({
    meta: [
      { title: "Create from a photo — Dearly Studio" },
      {
        name: "description",
        content:
          "Upload a photo or try a sample, choose your words and a look, then share it or have it printed.",
      },
      { property: "og:title", content: "Create from a photo — Dearly Studio" },
      {
        property: "og:description",
        content: "A guided, free-to-preview way to make a card or a print from one photo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <QuickCreate />,
});
