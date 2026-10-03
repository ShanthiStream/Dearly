import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { moods, occasions, recipients, refinements, type Refinement } from "@/domain/content";
import { fallbackMessage, type MessageOption } from "@/domain/services/message-writer";
import { writeMessages } from "@/lib/message-ai";
import { toast } from "sonner";
import type { CreationDraft } from "@/domain/entities/types";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/i18n";

export function MessageStep({
  draft,
  update,
}: {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
}) {
  const t = useT();
  const [options, setOptions] = useState<MessageOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const request = {
    recipientNickname: draft.recipientNickname,
    relationship: draft.relationship,
    occasion: draft.occasion,
    mood: draft.mood,
    memory: draft.memory,
    senderName: draft.senderName,
    language: draft.language,
  };

  async function generate() {
    setBusy(true);
    setStatus(t("step.message.status.writing"));
    try {
      const texts = await writeMessages(request);
      const lengths = ["short", "medium", "long"] as const;
      const next: MessageOption[] = texts.map((text, i) => ({
        id: `opt-${i}`,
        length: lengths[i] ?? "medium",
        text,
      }));
      setOptions(next);
      update({ message: next[1]?.text ?? next[0]?.text ?? "" });
      setStatus(t("step.message.status.ready"));
    } catch (e) {
      if (!draft.message) update({ message: fallbackMessage(request) });
      toast.error(e instanceof Error ? e.message : "Couldn't write a message.");
      setStatus(t("step.message.status.fallback"));
    } finally {
      setBusy(false);
    }
  }

  async function applyRefinement(refinement: Refinement) {
    const base = draft.message || fallbackMessage(request);
    setBusy(true);
    try {
      const [text] =
        refinement === "Try again"
          ? (await writeMessages(request)).slice(1)
          : await writeMessages(request, { refinement, current: base });
      if (text) update({ message: text });
      setStatus(t("step.message.status.applied", { refinement }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't change the message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("step.message.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("step.message.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nickname">{t("step.message.nicknameLabel")}</Label>
          <Input
            id="nickname"
            value={draft.recipientNickname}
            onChange={(e) => update({ recipientNickname: e.target.value })}
            placeholder={t("step.message.nicknamePlaceholder")}
            className="tap-safe mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("step.message.nicknameHelp")}</p>
        </div>
        <div>
          <Label htmlFor="sender">{t("step.message.senderLabel")}</Label>
          <Input
            id="sender"
            value={draft.senderName}
            onChange={(e) => update({ senderName: e.target.value })}
            placeholder={t("step.message.senderPlaceholder")}
            className="tap-safe mt-1.5"
          />
        </div>
      </div>

      <ChoiceGroup
        legend={t("step.message.relationship")}
        value={draft.relationship}
        options={recipients.map((r) => ({ id: r.id, label: r.label }))}
        onChange={(id) => update({ relationship: id as CreationDraft["relationship"] })}
        youChoose={t("step.message.youChoose")}
      />
      <ChoiceGroup
        legend={t("step.message.occasion")}
        value={draft.occasion}
        options={occasions.map((o) => ({ id: o.id, label: o.label }))}
        onChange={(id) => update({ occasion: id as CreationDraft["occasion"] })}
        youChoose={t("step.message.youChoose")}
      />
      <ChoiceGroup
        legend={t("step.message.mood")}
        value={draft.mood}
        options={moods.map((m) => ({ id: m.id, label: m.label }))}
        onChange={(id) => update({ mood: id as CreationDraft["mood"] })}
        youChoose={t("step.message.youChoose")}
      />

      <div>
        <Label htmlFor="memory">{t("step.message.memoryLabel")}</Label>
        <Textarea
          id="memory"
          value={draft.memory}
          onChange={(e) => update({ memory: e.target.value })}
          placeholder={t("step.message.memoryPlaceholder")}
          className="mt-1.5 min-h-20"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={generate} disabled={busy} className="tap-safe">
            {busy ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="mr-2 size-4" aria-hidden="true" />
            )}
            {t("step.message.generate")}
          </Button>
          <span className="text-xs text-muted-foreground">{t("step.message.generateHint")}</span>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>

        {options.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => update({ message: option.text })}
                  className={cn(
                    "w-full rounded-lg border-2 p-3 text-left text-sm",
                    draft.message === option.text
                      ? "border-primary bg-accent/40"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <Badge variant="secondary" className="mb-2 capitalize">
                    {option.length}
                  </Badge>
                  <span className="block whitespace-pre-line">{option.text}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <Label htmlFor="message">{t("step.message.yourMessage")}</Label>
        <Textarea
          id="message"
          value={draft.message}
          onChange={(e) => update({ message: e.target.value })}
          placeholder={t("step.message.messagePlaceholder")}
          className="mt-1.5 min-h-32"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {refinements.map((refinement) => (
            <Button
              key={refinement}
              type="button"
              variant="outline"
              size="sm"
              className="tap-safe"
              onClick={() => applyRefinement(refinement)}
            >
              {refinement}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChoiceGroup({
  legend,
  value,
  options,
  onChange,
  youChoose,
}: {
  legend: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (id: string) => void;
  youChoose: string;
}) {
  const all = [{ id: "unspecified", label: youChoose }, ...options];
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {all.map((option) => {
          const selected = value === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "tap-safe inline-flex cursor-pointer items-center rounded-full border-2 px-4 py-2 text-sm",
                selected ? "border-primary bg-accent/50" : "border-border bg-card hover:border-primary/40",
              )}
            >
              <input
                type="radio"
                name={legend}
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
