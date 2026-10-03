import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Page } from "@/components/layout/Page";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/privacy/request")({
  head: () => ({
    meta: [
      { title: "Make a privacy request — Dearly Studio" },
      {
        name: "description",
        content:
          "Ask us to delete a photo, a card, or your details — whether or not you use Dearly Studio. No ID documents required.",
      },
      { property: "og:title", content: "Make a privacy request — Dearly Studio" },
      {
        property: "og:description",
        content: "Anyone named or pictured can ask us to delete their data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyRequest,
});

function PrivacyRequest() {
  const t = useT();
  const types = [
    { id: "delete", label: t("privacyRequest.type.delete") },
    { id: "access", label: t("privacyRequest.type.access") },
    { id: "correct", label: t("privacyRequest.type.correct") },
    { id: "object", label: t("privacyRequest.type.object") },
  ] as const;
  const [type, setType] = useState<(typeof types)[number]["id"]>("delete");
  const [reference, setReference] = useState("");
  const [detail, setDetail] = useState("");
  const [contact, setContact] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);

  if (ticket) {
    return (
      <Page title={t("privacyRequest.received.title")} intro={t("privacyRequest.received.intro")}>
        <Alert>
          <AlertTitle>{t("privacyRequest.received.referenceTitle", { ticket })}</AlertTitle>
          <AlertDescription>{t("privacyRequest.received.body")}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="tap-safe mt-6">
          <Link to="/">{t("privacyRequest.received.backHome")}</Link>
        </Button>
      </Page>
    );
  }

  return (
    <Page title={t("privacyRequest.title")} intro={t("privacyRequest.intro")}>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setTicket(`PR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
        }}
      >
        <fieldset>
          <legend className="text-sm font-semibold">{t("privacyRequest.form.typeLegend")}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {types.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "tap-safe cursor-pointer rounded-lg border-2 p-3 text-sm",
                  type === option.id
                    ? "border-primary bg-accent/40"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <input
                  type="radio"
                  name="request-type"
                  className="sr-only"
                  checked={type === option.id}
                  onChange={() => setType(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="reference">{t("privacyRequest.form.reference")}</Label>
          <Input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t("privacyRequest.form.referencePlaceholder")}
            className="tap-safe mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="detail">{t("privacyRequest.form.detail")}</Label>
          <Textarea
            id="detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
            required
            placeholder={t("privacyRequest.form.detailPlaceholder")}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="contact">{t("privacyRequest.form.contact")}</Label>
          <Input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            placeholder={t("privacyRequest.form.contactPlaceholder")}
            className="tap-safe mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("privacyRequest.form.contactNote")}</p>
        </div>

        <Button type="submit" size="lg" className="tap-safe">
          {t("privacyRequest.form.submit")}
        </Button>
      </form>
    </Page>
  );
}
