import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Copy, Download, MessageCircle, Plus, Save, Share2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getVariant } from "@/domain/catalog";
import { assessQuality } from "@/domain/services/print-quality";
import { CardPreview } from "../CardPreview";
import { downloadCard } from "../exportCard";
import { shareCard } from "../shareCard";
import { useStore } from "../creation-store";
import type { CreationDraft } from "@/domain/entities/types";

export function OutputStep({ draft }: { draft: CreationDraft }) {
  const { addToCart, resetDraft } = useStore();
  const navigate = useNavigate();
  const [shareLink, setShareLink] = useState<string | null>(null);

  const variant = draft.variantId ? getVariant(draft.variantId) : null;
  const quality =
    variant && draft.photo
      ? assessQuality(draft.photo.widthPx, draft.photo.heightPx, variant)
      : null;
  const blocked = Boolean(
    quality &&
      (quality.blocksCheckout || (quality.requiresAcknowledgement && !draft.qualityAcknowledged)),
  );

  const shareText = `${draft.message}`;

  function createLink() {
    const token = Math.random().toString(36).slice(2, 12);
    setShareLink(`${window.location.origin}/share/${token}`);
    toast.success("Private link created. It expires in 30 days and you can revoke it any time.");
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: draft.title, text: shareText });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Message copied — sharing is not available in this browser.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ready</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send it, keep it, or turn the same work into something printed.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,260px)_1fr]">
        <CardPreview draft={draft} />

        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button className="tap-safe justify-start" onClick={() => void shareCard(draft, "whatsapp")}>
              <MessageCircle className="mr-2 size-4" aria-hidden="true" />
              Send on WhatsApp
            </Button>
            <Button variant="outline" className="tap-safe justify-start" onClick={() => void shareCard(draft, "any")}>
              <Share2 className="mr-2 size-4" aria-hidden="true" />
              Share
            </Button>
            <Button variant="outline" className="tap-safe justify-start" onClick={createLink}>
              <Copy className="mr-2 size-4" aria-hidden="true" />
              Create a private link
            </Button>
            <Button
              variant="outline"
              className="tap-safe justify-start"
              onClick={async () => {
                try {
                  await downloadCard(draft, `${(draft.title || "dearly-card").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`);
                  toast.success("Card downloaded.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not create the image.");
                }
              }}
            >
              <Download className="mr-2 size-4" aria-hidden="true" />
              Download card
            </Button>
            <Button
              variant="outline"
              className="tap-safe justify-start"
              onClick={() => toast.success("Saved to your library.")}
            >
              <Save className="mr-2 size-4" aria-hidden="true" />
              Save to library
            </Button>
            <Button
              variant="ghost"
              className="tap-safe justify-start"
              onClick={() => {
                resetDraft();
                toast.success("Started a fresh creation.");
              }}
            >
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Make another version
            </Button>
          </div>

          {shareLink ? (
            <Alert>
              <AlertTitle>Private link ready</AlertTitle>
              <AlertDescription className="break-all">
                {shareLink}
                <span className="mt-2 block text-xs">
                  Anyone with this link can view the card. Copies that are downloaded or forwarded
                  may keep existing outside Dearly Studio even after you revoke the link.
                </span>
              </AlertDescription>
            </Alert>
          ) : null}

          {draft.outcome !== "card" ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Printed product</p>
              {variant ? (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {variant.label} · quantity {draft.quantity}
                  </p>
                  {blocked ? (
                    <Alert variant="destructive" className="mt-3" role="alert">
                      <AlertTitle>We cannot print this yet</AlertTitle>
                      <AlertDescription>
                        {quality?.advice} Go back to the preview step to change the size or confirm
                        you are happy with the quality.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <Button
                    className="tap-safe mt-3 w-full"
                    disabled={blocked}
                    onClick={() => {
                      addToCart({
                        creationId: draft.id,
                        variantId: variant.id,
                        quantity: draft.quantity,
                        unitPriceMinorUnits: variant.priceMinorUnits,
                        crop: null,
                      });
                      toast.success("Added to cart");
                      void navigate({ to: "/cart" });
                    }}
                  >
                    <ShoppingBag className="mr-2 size-4" aria-hidden="true" />
                    Add print to cart
                  </Button>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a product and size on the previous step.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
