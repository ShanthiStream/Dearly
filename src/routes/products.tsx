import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/layout/Page";
import { products, productVariants } from "@/domain/catalog";
import { formatMoney } from "@/domain/services/pricing";
import { describeSize } from "@/domain/services/print-quality";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Dearly Studio" },
      {
        name: "description",
        content:
          "Postcards, folded cards, photo prints, framed prints and print-ready downloads, with sizes and quality requirements.",
      },
      { property: "og:title", content: "Products — Dearly Studio" },
      {
        property: "og:description",
        content: "Digital downloads and shipped products, clearly separated.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Products,
});

function Products() {
  const t = useT();
  return (
    <Page
      wide
      title={t("products.title")}
      intro={t("products.intro")}
    >
      <div className="space-y-6">
        {products.map((product) => {
          const items = productVariants.filter((v) => v.productId === product.id);
          return (
            <section key={product.id} className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-xl">{product.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {product.type === "digital-card" || product.type === "digital-download"
                  ? t("products.digitalLabel")
                  : t("products.physicalLabel")}
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {items.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-background p-3 text-sm"
                  >
                    <span>
                      <span className="block font-semibold">{variant.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {describeSize(variant)} · {variant.finish}
                        {variant.frame ? ` · ${variant.frame} frame` : ""}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t("products.needsSpec", { dpi: variant.minDpi, bleed: variant.bleedMm })}
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-semibold">
                      {formatMoney(variant.priceMinorUnits, variant.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {t("products.demoNote")}
      </p>

      <Button asChild size="lg" className="tap-safe mt-8">
        <Link to="/create/print">{t("products.cta.print")}</Link>
      </Button>
    </Page>
  );
}
