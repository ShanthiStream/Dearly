import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/layout/Page";
import { Badge } from "@/components/ui/badge";
import { products, productVariants, getProduct } from "@/domain/catalog";
import { formatMoney } from "@/domain/services/pricing";
import { describeSize } from "@/domain/services/print-quality";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Catalog (staff) — Dearly Studio" },
      { name: "description", content: "Staff view of the product catalog and print requirements." },
      { property: "og:title", content: "Catalog (staff) — Dearly Studio" },
      { property: "og:description", content: "Internal staff tooling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const t = useT();

  return (
    <Page
      wide
      title={t("admin.products.title")}
      intro={t("admin.products.intro", {
        count: products.length,
        variantsCount: productVariants.length,
      })}
    >
      <Badge variant="secondary">{t("admin.products.badge.demo")}</Badge>
      <table className="mt-4 w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">{t("admin.products.table.caption")}</caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-2">{t("admin.products.table.product")}</th>
            <th scope="col" className="py-2">{t("admin.products.table.variant")}</th>
            <th scope="col" className="py-2">{t("admin.products.table.size")}</th>
            <th scope="col" className="py-2">{t("admin.products.table.minDpi")}</th>
            <th scope="col" className="py-2">{t("admin.products.table.providerSku")}</th>
            <th scope="col" className="py-2 text-right">{t("admin.products.table.price")}</th>
          </tr>
        </thead>
        <tbody>
          {productVariants.map((variant) => (
            <tr key={variant.id} className="border-b border-border/60">
              <td className="py-2">{getProduct(variant.productId)?.name}</td>
              <td className="py-2">{variant.label}</td>
              <td className="py-2">{describeSize(variant)}</td>
              <td className="py-2">{variant.minDpi}</td>
              <td className="py-2">{variant.providerSku}</td>
              <td className="py-2 text-right">
                {formatMoney(variant.priceMinorUnits, variant.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}
