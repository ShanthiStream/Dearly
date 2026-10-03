import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Page } from "@/components/layout/Page";
import { useStore } from "@/features/creation/creation-store";
import { getProduct, getVariant } from "@/domain/catalog";
import { formatMoney, priceCart, promoCodes } from "@/domain/services/pricing";
import { describeSize } from "@/domain/services/print-quality";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Dearly Studio" },
      {
        name: "description",
        content:
          "Review your prints, discounts, shipping and tax in full before any payment is taken.",
      },
      { property: "og:title", content: "Your cart — Dearly Studio" },
      { property: "og:description", content: "Everything priced clearly before you pay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const t = useT();
  const { cart, removeFromCart, setQuantity, promoCode, setPromoCode } = useStore();
  const [codeInput, setCodeInput] = useState(promoCode ?? "");
  const breakdown = priceCart(cart, promoCode);

  if (cart.length === 0) {
    return (
      <Page title={t("cart.title")} intro={t("cart.empty.intro")}>
        <p className="text-muted-foreground">{t("cart.empty.body")}</p>
        <Button asChild className="tap-safe mt-4">
          <Link to="/create">{t("cart.empty.cta")}</Link>
        </Button>
      </Page>
    );
  }

  return (
    <Page title={t("cart.title")} intro={t("cart.intro")}>
      <ul className="space-y-3">
        {cart.map((item) => {
          const variant = getVariant(item.variantId);
          const product = variant ? getProduct(variant.productId) : null;
          return (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <p className="font-semibold">{product?.name ?? t("cart.item.fallbackName")}</p>
                <p className="text-sm text-muted-foreground">
                  {variant?.label}
                  {variant ? ` · ${describeSize(variant)} · ${variant.finish}` : ""}
                  {variant?.frame ? ` · ${t("cart.item.frame", { frame: variant.frame })}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.crop ? t("cart.item.customCrop") : t("cart.item.centredCrop")} ·{" "}
                  {t("cart.item.deliveryEstimate")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor={`qty-${item.id}`} className="text-xs">
                  {t("cart.qty")}
                </Label>
                <Input
                  id={`qty-${item.id}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.id, Number(e.target.value) || 1)}
                  className="tap-safe w-20"
                />
                <p className="w-20 text-right font-semibold">
                  {formatMoney(item.unitPriceMinorUnits * item.quantity)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="tap-safe"
                  aria-label={t("cart.removeAria", { name: product?.name ?? t("cart.item.fallbackName") })}
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <Label htmlFor="promo">{t("cart.promo.label")}</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="promo"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={t("cart.promo.placeholder")}
                className="tap-safe"
              />
              <Button
                variant="outline"
                className="tap-safe"
                onClick={() => {
                  const code = codeInput.trim().toUpperCase();
                  if (promoCodes[code]) {
                    setPromoCode(code);
                    toast.success(t("cart.promo.applied", { label: promoCodes[code]!.label }));
                  } else {
                    toast.error(t("cart.promo.notRecognised"));
                  }
                }}
              >
                {t("cart.promo.apply")}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertTitle>{t("cart.checkoutInfo.title")}</AlertTitle>
            <AlertDescription>{t("cart.checkoutInfo.body")}</AlertDescription>
          </Alert>
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg">{t("cart.summary.title")}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={t("cart.summary.subtotal")} value={formatMoney(breakdown.subtotal)} />
            {breakdown.discount > 0 ? (
              <Row label={t("cart.summary.discount")} value={`−${formatMoney(breakdown.discount)}`} />
            ) : null}
            <Row
              label={t("cart.summary.shipping")}
              value={breakdown.shipping === 0 ? t("cart.summary.noDeliveryNeeded") : formatMoney(breakdown.shipping)}
            />
            <Row label={t("cart.summary.tax")} value={formatMoney(breakdown.tax)} />
            <div className="border-t border-border pt-2">
              <Row label={t("cart.summary.total")} value={formatMoney(breakdown.total)} strong />
            </div>
          </dl>
          <Button
            className="tap-safe mt-4 w-full"
            onClick={() => toast.info(t("cart.checkout.toast"))}
          >
            {t("cart.checkout.cta")}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{t("cart.checkout.note")}</p>
        </div>
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
