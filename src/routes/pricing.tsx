import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Page } from "@/components/layout/Page";
import { products, productVariants, getProduct } from "@/domain/catalog";
import { entitlements, formatMoney, SHIPPING_FLAT_MINOR_UNITS, TAX_RATE } from "@/domain/services/pricing";
import { describeSize } from "@/domain/services/print-quality";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Dearly Studio" },
      {
        name: "description",
        content:
          "Free previews, one free digital export a week when signed in, and clear per-item prices for downloads and prints.",
      },
      { property: "og:title", content: "Pricing — Dearly Studio" },
      { property: "og:description", content: "Nothing is charged until you choose to order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const t = useT();
  return (
    <Page
      wide
      title={t("pricing.title")}
      intro={t("pricing.intro")}
    >
      <Badge variant="secondary">{t("pricing.demoBadge")}</Badge>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg">{t("pricing.previewing.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pricing.previewing.body")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg">{t("pricing.freeExport.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pricing.freeExport.body", {
              count: entitlements.freeSignedInDigitalExportsPerWeek,
            })}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg">{t("pricing.paidExport.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pricing.paidExport.body", {
              amount: formatMoney(entitlements.paidDigitalExportMinorUnits),
            })}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">{t("pricing.productsHeading")}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-sm">
            <caption className="sr-only">{t("pricing.table.caption")}</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="py-2">{t("pricing.table.product")}</th>
                <th scope="col" className="py-2">{t("pricing.table.size")}</th>
                <th scope="col" className="py-2">{t("pricing.table.finish")}</th>
                <th scope="col" className="py-2 text-right">{t("pricing.table.price")}</th>
              </tr>
            </thead>
            <tbody>
              {productVariants.map((variant) => (
                <tr key={variant.id} className="border-b border-border/60">
                  <td className="py-2">{getProduct(variant.productId)?.name}</td>
                  <td className="py-2">{describeSize(variant)}</td>
                  <td className="py-2">
                    {variant.finish}
                    {variant.frame ? ` · ${variant.frame} frame` : ""}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {formatMoney(variant.priceMinorUnits, variant.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("pricing.shippingNote", {
            shipping: formatMoney(SHIPPING_FLAT_MINOR_UNITS),
            tax: Math.round(TAX_RATE * 100),
          })}
        </p>
      </section>

      <section className="mt-10 rounded-xl border border-border bg-paper p-5">
        <h2 className="text-lg">{t("pricing.notDecided.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("pricing.notDecided.body")}
        </p>
      </section>

      <Button asChild size="lg" className="tap-safe mt-8">
        <Link to="/create">{t("pricing.cta.create")}</Link>
      </Button>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("pricing.productsCount", { count: products.length })}{" "}
        <Link to="/products" className="underline">
          {t("pricing.productsLinkText")}
        </Link>{" "}
        {t("pricing.productsLinkSuffix")}
      </p>
    </Page>
  );
}
