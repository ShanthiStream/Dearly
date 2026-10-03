import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/layout/Page";
import { UPLOAD_PRIVACY_NOTICE } from "@/domain/content";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Dearly Studio" },
      {
        name: "description",
        content:
          "Upload a photo, choose your words, pick a look, then share it or have it printed and delivered.",
      },
      { property: "og:title", content: "How it works — Dearly Studio" },
      {
        property: "og:description",
        content: "A plain walkthrough of making a card or print, and what happens to your photo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const stepIds = ["addPhoto", "chooseWords", "chooseLook", "checkIt", "sendOrOrder"] as const;

function HowItWorks() {
  const t = useT();
  // The domain notice below is fixed marketing copy; it is mapped to a translated key here.
  void UPLOAD_PRIVACY_NOTICE;

  return (
    <Page title={t("howItWorks.title")} intro={t("howItWorks.intro")}>
      <ol className="space-y-5">
        {stepIds.map((id) => (
          <li key={id} className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg">{t(`howItWorks.step.${id}.title`)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(`howItWorks.step.${id}.body`)}</p>
          </li>
        ))}
      </ol>

      <section className="mt-8 rounded-xl border border-border bg-paper p-5">
        <h2 className="text-lg">{t("howItWorks.privacyHeading")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("howItWorks.privacyNotice")}</p>
        <Button asChild variant="outline" className="tap-safe mt-4">
          <Link to="/privacy">{t("howItWorks.readPrivacy")}</Link>
        </Button>
      </section>

      <Button asChild size="lg" className="tap-safe mt-8">
        <Link to="/create">{t("howItWorks.cta.create")}</Link>
      </Button>
    </Page>
  );
}
