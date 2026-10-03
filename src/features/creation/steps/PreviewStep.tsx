import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { products, shippableVariants, getProduct, getVariant } from "@/domain/catalog";
import { assessQuality, describeSize, safeAreaInsetPercent } from "@/domain/services/print-quality";
import { formatMoney } from "@/domain/services/pricing";
import { CardPreview } from "../CardPreview";
import { draftImageSrc } from "../CardPreview";
import type { CreationDraft } from "@/domain/entities/types";
import { cn } from "@/lib/utils";

export function PreviewStep({
  draft,
  update,
}: {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
}) {
  const wantsPrint = draft.outcome !== "card";
  const variant = draft.variantId ? getVariant(draft.variantId) : null;
  const photo = draft.photo;

  const quality =
    variant && photo ? assessQuality(photo.widthPx, photo.heightPx, variant) : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Check it before you commit</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nothing is ordered or charged from this screen.
        </p>
      </div>

      <section aria-labelledby="digital-preview-heading" className="space-y-3">
        <h3 id="digital-preview-heading" className="text-sm font-semibold">
          Digital card — exactly what gets shared
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <CardPreview draft={draft} className="max-w-xs" />
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="font-semibold">On a phone</p>
            <p className="mt-1 text-muted-foreground">
              Shared as an image, so it opens anywhere without an app or account.
            </p>
            <p className="mt-4 font-semibold">Private link preview</p>
            <p className="mt-1 text-muted-foreground">
              Anyone with the link can view the card. Links are unlisted, expiring and can be
              revoked at any time.
            </p>
          </div>
        </div>
      </section>

      {wantsPrint ? (
        <section aria-labelledby="print-preview-heading" className="space-y-4">
          <h3 id="print-preview-heading" className="text-sm font-semibold">
            Printed product
          </h3>

          <fieldset>
            <legend className="sr-only">Choose a product and size</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {shippableVariants().map((v) => {
                const product = getProduct(v.productId);
                const selected = draft.variantId === v.id;
                return (
                  <label
                    key={v.id}
                    className={cn(
                      "tap-safe flex cursor-pointer items-start justify-between gap-3 rounded-lg border-2 p-3 text-sm",
                      selected ? "border-primary bg-accent/40" : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span>
                      <input
                        type="radio"
                        name="variant"
                        className="sr-only"
                        checked={selected}
                        onChange={() => update({ variantId: v.id, qualityAcknowledged: false })}
                      />
                      <span className="block font-semibold">{product?.name}</span>
                      <span className="block text-xs text-muted-foreground">{v.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {describeSize(v)} · {v.finish}
                        {v.frame ? ` · ${v.frame} frame` : ""}
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-semibold">
                      {formatMoney(v.priceMinorUnits, v.currency)}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Demo prices for development. A print-ready download is a separate, non-shipped
              product — see{" "}
              {formatMoney(
                getVariant("var_download_print_ready")?.priceMinorUnits ?? 0,
                "USD",
              )}{" "}
              on the pricing page.
            </p>
          </fieldset>

          {variant ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-xl border border-border bg-paper p-4">
                <p className="text-sm font-semibold">Crop, bleed and safe area</p>
                <div
                  className="relative mx-auto mt-3 w-full max-w-sm overflow-hidden rounded-md border border-border"
                  style={{ aspectRatio: `${variant.widthMm} / ${variant.heightMm}` }}
                >
                  {draftImageSrc(draft) ? (
                    <img
                      src={draftImageSrc(draft) ?? ""}
                      alt="Print crop preview"
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-muted text-xs text-muted-foreground">
                      Add a photo
                    </div>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 border-2 border-dashed border-destructive/70"
                    aria-hidden="true"
                    style={{ margin: `${(variant.bleedMm / variant.heightMm) * 100}%` }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 border-2 border-dotted border-sage"
                    aria-hidden="true"
                    style={{ margin: `${safeAreaInsetPercent(variant)}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <li className="list-none">
                    Dashed line: trim/bleed edge ({variant.bleedMm} mm) — anything outside may be
                    cut.
                  </li>
                  <li className="list-none">Dotted line: safe area — keep faces and text inside.</li>
                  <li className="list-none">Size: {describeSize(variant)}</li>
                </ul>
              </div>

              <div className="space-y-3">
                {quality ? (
                  <Alert
                    variant={quality.level === "too-low" ? "destructive" : "default"}
                    role={quality.level === "good" ? undefined : "alert"}
                  >
                    {quality.level === "good" ? (
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                    ) : quality.level === "acceptable" ? (
                      <Info className="size-4" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="size-4" aria-hidden="true" />
                    )}
                    <AlertTitle>{quality.label}</AlertTitle>
                    <AlertDescription>
                      {quality.advice} ({quality.effectiveDpi} dpi at this size; {quality.requiredDpi}{" "}
                      recommended.)
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Info className="size-4" aria-hidden="true" />
                    <AlertTitle>Add a photo to check quality</AlertTitle>
                    <AlertDescription>
                      We check the exact pixel size against the product before you can order.
                    </AlertDescription>
                  </Alert>
                )}

                {quality?.requiresAcknowledgement ? (
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                    <Checkbox
                      checked={draft.qualityAcknowledged}
                      onCheckedChange={(v) => update({ qualityAcknowledged: v === true })}
                      className="mt-0.5"
                    />
                    <span>I understand this print may look a little soft and want to continue.</span>
                  </label>
                ) : null}

                <div className="rounded-lg border border-border bg-card p-3 text-sm">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={50}
                    value={draft.quantity}
                    onChange={(e) => update({ quantity: Math.max(1, Number(e.target.value) || 1) })}
                    className="tap-safe mt-1.5 w-28"
                  />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Production takes about 2 working days. Delivery estimate and shipping cost are
                    shown in the cart before payment.
                  </p>
                  <Badge variant="secondary" className="mt-3">
                    Mock print partner (test mode)
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
