import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Page } from "@/components/layout/Page";
import { sampleOrders } from "@/domain/samples";
import { formatMoney } from "@/domain/services/pricing";
import { cancellationExplanation, orderStatusLabel } from "@/domain/services/orders";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order details — Dearly Studio" },
      {
        name: "description",
        content: "What was printed, what it cost, where it is now, and what you can still change.",
      },
      { property: "og:title", content: "Order details — Dearly Studio" },
      { property: "og:description", content: "Full order timeline and delivery status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderDetail,
  notFoundComponent: () => {
    const t = useT();
    return (
      <Page title={t("orders.detail.notFound.title")} intro={t("orders.detail.notFound.intro")}>
        <Button asChild className="tap-safe">
          <Link to="/orders">{t("orders.detail.notFound.cta")}</Link>
        </Button>
      </Page>
    );
  },
});

function OrderDetail() {
  const t = useT();
  const { orderId } = Route.useParams();
  const order = sampleOrders.find((o) => o.id === orderId);
  if (!order) throw notFound();

  return (
    <Page
      wide
      title={t("orders.detail.title", { number: order.number })}
      intro={t("orders.detail.intro", {
        date: new Date(order.placedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      })}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{orderStatusLabel(order.status)}</Badge>
            <p className="text-sm text-muted-foreground">{order.estimatedArrival}</p>
          </div>

          <ul className="space-y-3">
            {order.items.map((item) => (
              <li
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  width={96}
                  height={96}
                  className="size-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.variantLabel} · {t("orders.detail.qty", { count: item.quantity })}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatMoney(item.unitPriceMinorUnits * item.quantity, order.currency)}
                </p>
              </li>
            ))}
          </ul>

          <section>
            <h2 className="text-lg">{t("orders.detail.progress")}</h2>
            <ol className="mt-3 space-y-3 border-l border-border pl-4">
              {order.timeline.map((entry) => (
                <li key={entry.at}>
                  <p className="text-sm font-semibold">{orderStatusLabel(entry.status)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.at).toLocaleString("en-GB")} · {entry.note}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <Alert>
            <AlertTitle>{t("orders.detail.changes.title")}</AlertTitle>
            <AlertDescription>{cancellationExplanation(order.status)}</AlertDescription>
          </Alert>
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="text-lg">{t("orders.detail.payment.title")}</h2>
            <dl className="mt-2 space-y-1">
              <Row label={t("orders.detail.subtotal")} value={formatMoney(order.subtotalMinorUnits, order.currency)} />
              <Row label={t("orders.detail.shipping")} value={formatMoney(order.shippingMinorUnits, order.currency)} />
              <Row label={t("orders.detail.tax")} value={formatMoney(order.taxMinorUnits, order.currency)} />
              <Row label={t("orders.detail.total")} value={formatMoney(order.totalMinorUnits, order.currency)} strong />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">{t("orders.detail.paymentNote")}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="text-lg">{t("orders.detail.delivery.title")}</h2>
            <p className="mt-1 text-muted-foreground">{order.shippingSummary}</p>
            {order.trackingUrl ? (
              <Button asChild variant="outline" className="tap-safe mt-3 w-full">
                <a href={order.trackingUrl} target="_blank" rel="noreferrer">
                  {t("orders.detail.trackOrder")}
                </a>
              </Button>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{t("orders.detail.noTracking")}</p>
            )}
          </div>

          <Button asChild className="tap-safe w-full">
            <Link to="/create/print">{t("orders.detail.orderAgain")}</Link>
          </Button>
          <Button asChild variant="outline" className="tap-safe w-full">
            <Link to="/help">{t("orders.detail.getHelp")}</Link>
          </Button>
        </aside>
      </div>
    </Page>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold" : ""}>{value}</dd>
    </div>
  );
}
