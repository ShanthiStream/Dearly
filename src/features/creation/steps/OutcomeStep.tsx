import { Gift, Image as ImageIcon, Send } from "lucide-react";
import type { Outcome } from "@/domain/entities/types";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/i18n";

const optionMeta: Array<{ id: Outcome; titleKey: string; blurbKey: string; icon: typeof Send }> = [
  { id: "card", titleKey: "step.outcome.card.title", blurbKey: "step.outcome.card.blurb", icon: Send },
  { id: "print", titleKey: "step.outcome.print.title", blurbKey: "step.outcome.print.blurb", icon: ImageIcon },
  { id: "both", titleKey: "step.outcome.both.title", blurbKey: "step.outcome.both.blurb", icon: Gift },
];

export function OutcomeStep({
  value,
  onChange,
}: {
  value: Outcome;
  onChange: (outcome: Outcome) => void;
}) {
  const t = useT();
  return (
    <fieldset>
      <legend className="text-xl font-semibold">{t("step.outcome.title")}</legend>
      <p className="mt-1 text-sm text-muted-foreground">{t("step.outcome.subtitle")}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {optionMeta.map((option) => {
          const Icon = option.icon;
          const selected = value === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "tap-safe flex cursor-pointer flex-col gap-2 rounded-xl border-2 bg-card p-4 transition-colors",
                selected ? "border-primary bg-accent/40" : "border-border hover:border-primary/40",
              )}
            >
              <input
                type="radio"
                name="outcome"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <span className="font-serif text-lg">{t(option.titleKey)}</span>
              <span className="text-sm text-muted-foreground">{t(option.blurbKey)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
