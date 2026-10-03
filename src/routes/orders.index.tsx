import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/layout/Page";
import { sampleOrders } from "@/domain/samples";
import { formatMoney } from "@/domain/services/pricing";
import { orderStatusLabel } from "@/domain/services/orders";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Your orders — Dearly Studio" },
      {
        name: "description",
        content: "Order numbers, what was printed, what it cost, where it is, and when it should arrive.",
      },
      { property: "og:title", content: "Your orders — Dearly Studio" },
      { property: "og:description", content: "Track prints and reorder saved designs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const t = useT();

  if (sampleOrders.length === 0) {
    return (
      <Page title={t("orders.title")} intro={t("orders.empty.intro")}>
        <Button asChild className="tap-safe">
          <Link to="/create/print">{t("orders.empty.cta")}</Link>
        </Button>
      </Page>
    );
  }

  return (
    <Page wide title={t("orders.title")} intro={t("orders.intro")}>
      <ul className="space-y-3">
        {sampleOrders.map((order) => (
          <li key={order.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{order.number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.placedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {formatMoney(order.totalMinorUnits, order.currency)}
                </p>
              </div>
              <Badge variant="secondary">{orderStatusLabel(order.status)}</Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {order.items.map((item) => (
                <img
                  key={item.title}
                  src={item.thumbnail}
                  alt={item.title}
                  width={96}
                  height={96}
                  loading="lazy"
                  className="size-16 rounded-md object-cover"
                />
              ))}
              <p className="text-sm text-muted-foreground">{order.estimatedArrival}</p>
            </div>

            <Button asChild variant="outline" className="tap-safe mt-3">
              <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                {t("orders.viewOrder")}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </Page>
  );
}
