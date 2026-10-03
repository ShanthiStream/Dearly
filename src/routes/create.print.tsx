import { createFileRoute } from "@tanstack/react-router";
import { CreateFlow } from "@/features/creation/CreateFlow";

export const Route = createFileRoute("/create/print")({
  head: () => ({
    meta: [
      { title: "Make a print — Dearly Studio" },
      {
        name: "description",
        content:
          "Turn a photo into a postcard, photo print or framed print, with crop, bleed and quality checked first.",
      },
      { property: "og:title", content: "Make a print — Dearly Studio" },
      {
        property: "og:description",
        content: "Sizes, quality warnings, shipping and delivery estimates shown before you pay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreateFlow presetOutcome="print" />,
});
