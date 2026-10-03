import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Page } from "@/components/layout/Page";
import { useStore } from "@/features/creation/creation-store";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "Your account — Dearly Studio" },
      {
        name: "description",
        content: "Text size, privacy controls, billing and account deletion in one place.",
      },
      { property: "og:title", content: "Your account — Dearly Studio" },
      { property: "og:description", content: "Settings and privacy controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const { prefs, setTextSize } = useStore();
  const t = useT();

  return (
    <Page title={t("account.title")} intro={t("account.intro")}>
      <section className="rounded-xl border border-border bg-card p-5">
        <Label className="text-base">{t("account.textSize")}</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("account.textSizeHelp")}
        </p>
        <div className="mt-3 flex gap-2">
          {(["standard", "large"] as const).map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={prefs.textSize === size}
              onClick={() => setTextSize(size)}
              className={cn(
                "tap-safe rounded-full border px-4 py-2 text-sm capitalize",
                prefs.textSize === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background",
              )}
            >
              {size === "standard" ? t("account.standard") : t("account.large")}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <Label className="text-base">{t("nav.language")}</Label>
        <p className="mt-1 text-sm text-muted-foreground">{t("account.languageHelp")}</p>
        <div className="mt-3">
          <LanguageSwitcher className="tap-safe h-11 w-full gap-2 sm:w-64" />
        </div>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="tap-safe justify-start">
          <Link to="/account/privacy">{t("account.privacyLink")}</Link>
        </Button>
        <Button asChild variant="outline" className="tap-safe justify-start">
          <Link to="/account/billing">{t("account.billingLink")}</Link>
        </Button>
        <Button asChild variant="outline" className="tap-safe justify-start">
          <Link to="/people">{t("account.peopleLink")}</Link>
        </Button>
        <Button asChild variant="outline" className="tap-safe justify-start">
          <Link to="/orders">{t("account.ordersLink")}</Link>
        </Button>
      </div>
    </Page>
  );
}
