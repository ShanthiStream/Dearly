import { createFileRoute } from "@tanstack/react-router";
import { CreateFlow } from "@/features/creation/CreateFlow";

export const Route = createFileRoute("/create/full")({
  head: () => ({
    meta: [
      { title: "All options — Dearly Studio" },
      {
        name: "description",
        content:
          "The step-by-step version: photo, wording help, styles, print sizes, quality checks and sharing.",
      },
      { property: "og:title", content: "All options — Dearly Studio" },
      {
        property: "og:description",
        content: "Every setting for turning one photo into a card or a print.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreateFlow />,
});
