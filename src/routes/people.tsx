import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Page } from "@/components/layout/Page";
import { samplePeople } from "@/domain/samples";
import { recipients } from "@/domain/content";
import type { Person } from "@/domain/entities/types";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "Your card list — Dearly Studio" },
      {
        name: "description",
        content:
          "A nickname and a relationship. Nothing else is stored — no numbers, emails or addresses.",
      },
      { property: "og:title", content: "Your card list — Dearly Studio" },
      { property: "og:description", content: "Deliberately the smallest possible contact list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: People,
});

function People() {
  const t = useT();
  const [people, setPeople] = useState<Person[]>(samplePeople);
  const [nickname, setNickname] = useState("");
  const [relationship, setRelationship] = useState("friend");

  return (
    <Page title={t("people.title")} intro={t("people.intro")}>
      <Alert className="mb-6">
        <AlertTitle>{t("people.notice.title")}</AlertTitle>
        <AlertDescription>{t("people.notice.body")}</AlertDescription>
      </Alert>

      <form
        className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!nickname.trim()) return;
          setPeople((current) => [
            ...current,
            {
              id: `person_${Math.random().toString(36).slice(2, 8)}`,
              nickname: nickname.trim(),
              relationship,
              createdAt: new Date().toISOString(),
              retentionExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 548).toISOString(),
            } as Person,
          ]);
          setNickname("");
          toast.success(t("people.added.toast"));
        }}
      >
        <div>
          <Label htmlFor="nickname">{t("people.form.nickname")}</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t("people.form.nicknamePlaceholder")}
            className="tap-safe mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="relationship">{t("people.form.relationship")}</Label>
          <select
            id="relationship"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="tap-safe mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {recipients.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="tap-safe">
          {t("people.form.add")}
        </Button>
      </form>

      {people.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t("people.empty")}</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-semibold">{person.nickname}</p>
                <p className="text-sm text-muted-foreground">
                  {recipients.find((r) => r.id === person.relationship)?.label ?? person.relationship}
                </p>
              </div>
              <Button
                variant="ghost"
                className="tap-safe text-destructive"
                onClick={() => {
                  setPeople((current) => current.filter((p) => p.id !== person.id));
                  toast.success(t("people.deleted.toast", { name: person.nickname }));
                }}
              >
                {t("people.delete")}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-muted-foreground">{t("people.retentionNote")}</p>
    </Page>
  );
}
