import { createFileRoute } from "@tanstack/react-router";
import { CreateFlow } from "@/features/creation/CreateFlow";

export const Route = createFileRoute("/create/card")({
  head: () => ({
    meta: [
      { title: "Make a digital card — Dearly Studio" },
      {
        name: "description",
        content:
          "Write a warm, personal card from one photo and send it on WhatsApp or by private link.",
      },
      { property: "og:title", content: "Make a digital card — Dearly Studio" },
      {
        property: "og:description",
        content: "Photo, words, design, send. Free to preview, no account needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreateFlow presetOutcome="card" />,
});
