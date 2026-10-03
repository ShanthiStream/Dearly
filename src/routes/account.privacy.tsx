import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Page } from "@/components/layout/Page";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/account/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy and your data — Dearly Studio" },
      {
        name: "description",
        content: "See what is kept, when it is deleted, and delete your content or whole account.",
      },
      { property: "og:title", content: "Privacy and your data — Dearly Studio" },
      { property: "og:description", content: "Self-serve deletion and retention information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPrivacy,
});

function AccountPrivacy() {
  const t = useT();

  return (
    <Page title={t("account.privacy.title")} intro={t("account.privacy.intro")}>
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg">{t("account.privacy.scheduledTitle")}</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>{t("account.privacy.drafts")}</li>
          <li>{t("account.privacy.finished")}</li>
          <li>{t("account.privacy.printFiles")}</li>
          <li>{t("account.privacy.cardList")}</li>
          <li>{t("account.privacy.orderRecords")}</li>
        </ul>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          className="tap-safe justify-start"
          onClick={() => toast.success(t("account.privacy.revokedToast"))}
        >
          {t("account.privacy.revokeLinks")}
        </Button>
        <Button asChild variant="outline" className="tap-safe justify-start">
          <Link to="/people">{t("account.privacy.deletePeople")}</Link>
        </Button>
        <Button asChild variant="outline" className="tap-safe justify-start">
          <Link to="/library">{t("account.privacy.deletePhotos")}</Link>
        </Button>
        <Button asChild variant="outline" className="tap-safe justify-start">
          <Link to="/privacy/request">{t("account.privacy.requestOnBehalf")}</Link>
        </Button>
      </div>

      <Alert variant="destructive" className="mt-8">
        <AlertTitle>{t("account.privacy.deleteAccountTitle")}</AlertTitle>
        <AlertDescription>{t("account.privacy.deleteAccountBody")}</AlertDescription>
      </Alert>
      <Button
        variant="destructive"
        className="tap-safe mt-3"
        onClick={() => toast.info(t("account.privacy.deleteAccountToast"))}
      >
        {t("account.privacy.deleteAccountButton")}
      </Button>
    </Page>
  );
}
