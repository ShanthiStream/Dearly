import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Page } from "@/components/layout/Page";
import { sampleOrders } from "@/domain/samples";
import { formatMoney } from "@/domain/services/pricing";
import { useI18n, useT } from "@/i18n/i18n";

export const Route = createFileRoute("/account/billing")({
  head: () => ({
    meta: [
      { title: "Billing and receipts — Dearly Studio" },
      {
        name: "description",
        content: "Your receipts and what payment information we do and do not keep.",
      },
      { property: "og:title", content: "Billing and receipts — Dearly Studio" },
      { property: "og:description", content: "Receipts, with no card details stored." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Billing,
});

function formatDate(value: string, locale: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(locale);
}

function Billing() {
  const t = useT();
  const { locale } = useI18n();

  return (
    <Page title={t("account.billing.title")} intro={t("account.billing.intro")}>
      <Alert className="mb-6">
        <AlertTitle>{t("account.billing.noCardTitle")}</AlertTitle>
        <AlertDescription>{t("account.billing.noCardBody")}</AlertDescription>
      </Alert>

      <ul className="space-y-2">
        {sampleOrders.map((order) => (
          <li
            key={order.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-semibold">{order.number}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.placedAt, locale)} ·{" "}
                {formatMoney(order.totalMinorUnits, order.currency)}
              </p>
            </div>
            <Button asChild variant="outline" className="tap-safe">
              <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                {t("account.billing.view")}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </Page>
  );
}
