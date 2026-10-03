import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Page } from "@/components/layout/Page";
import { sampleOrders } from "@/domain/samples";
import { formatMoney } from "@/domain/services/pricing";
import { orderStatusLabel } from "@/domain/services/orders";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders (staff) — Dearly Studio" },
      { name: "description", content: "Staff view of orders and fulfilment states." },
      { property: "og:title", content: "Orders (staff) — Dearly Studio" },
      { property: "og:description", content: "Internal staff tooling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const t = useT();

  return (
    <Page wide title={t("admin.orders.title")} intro={t("admin.orders.intro")}>
      <Alert className="mb-6">
        <AlertTitle>{t("admin.orders.alert.title")}</AlertTitle>
        <AlertDescription>{t("admin.orders.alert.description")}</AlertDescription>
      </Alert>

      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">{t("admin.orders.table.caption")}</caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-2">{t("admin.orders.table.order")}</th>
            <th scope="col" className="py-2">{t("admin.orders.table.status")}</th>
            <th scope="col" className="py-2">{t("admin.orders.table.items")}</th>
            <th scope="col" className="py-2 text-right">{t("admin.orders.table.total")}</th>
          </tr>
        </thead>
        <tbody>
          {sampleOrders.map((order) => (
            <tr key={order.id} className="border-b border-border/60">
              <td className="py-2">{order.number}</td>
              <td className="py-2">
                <Badge variant="secondary">{orderStatusLabel(order.status)}</Badge>
              </td>
              <td className="py-2">{order.items.length}</td>
              <td className="py-2 text-right">
                {formatMoney(order.totalMinorUnits, order.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}
