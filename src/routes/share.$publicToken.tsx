import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/layout/Page";
import { sampleImages } from "@/domain/samples";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/share/$publicToken")({
  head: () => ({
    meta: [
      { title: "A card made for you — Dearly Studio" },
      { name: "description", content: "Someone made you a card. This link is private and expires." },
      { property: "og:title", content: "A card made for you" },
      {
        property: "og:description",
        content: "A private, expiring card link from Dearly Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const t = useT();
  const { publicToken } = Route.useParams();

  return (
    <Page title={t("share.title")} intro={t("share.intro")}>
      <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <img
          src={sampleImages.family}
          alt={t("share.image.alt")}
          width={1024}
          height={1024}
          className="aspect-square w-full object-cover"
        />
        <figcaption className="p-5 text-lg leading-relaxed">{t("share.caption")}</figcaption>
      </figure>

      <p className="mt-4 text-xs text-muted-foreground">
        {t("share.linkInfo", { token: publicToken })}{" "}
        <Link to="/privacy/request" className="underline">
          {t("share.linkInfo.privacyRequest")}
        </Link>{" "}
        {t("share.linkInfo.noAccountNeeded")}
      </p>

      <Button asChild className="tap-safe mt-6">
        <Link to="/create">{t("share.cta")}</Link>
      </Button>
    </Page>
  );
}
