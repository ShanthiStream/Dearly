import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ratios, templates } from "@/domain/content";
import { CardPreview } from "../CardPreview";
import { TextControls } from "../TextControls";
import type { CreationDraft, RatioId, TemplateId } from "@/domain/entities/types";
import { cn } from "@/lib/utils";

export function DesignStep({
  draft,
  update,
  onReset,
}: {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Pick a design</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Templates keep text readable and inside the safe area, so nothing gets cut off.
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">Template</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {templates.map((template) => (
              <label
                key={template.id}
                className={cn(
                  "tap-safe cursor-pointer rounded-lg border-2 p-3 text-center text-sm",
                  draft.templateId === template.id
                    ? "border-primary bg-accent/40"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <input
                  type="radio"
                  name="template"
                  className="sr-only"
                  checked={draft.templateId === template.id}
                  onChange={() => update({ templateId: template.id as TemplateId })}
                />
                <span className="block font-semibold">{template.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {template.description}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold">Shape</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ratios.map((ratio) => (
              <label
                key={ratio.id}
                className={cn(
                  "tap-safe cursor-pointer rounded-full border-2 px-4 py-2 text-sm",
                  draft.ratioId === ratio.id
                    ? "border-primary bg-accent/50"
                    : "border-border bg-card hover:border-primary/40",
                )}
                title={ratio.note}
              >
                <input
                  type="radio"
                  name="ratio"
                  className="sr-only"
                  checked={draft.ratioId === ratio.id}
                  onChange={() => update({ ratioId: ratio.id as RatioId })}
                />
                {ratio.label}
              </label>
            ))}
          </div>
        </fieldset>

        <TextControls draft={draft} update={update} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Name this creation</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              className="tap-safe mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="dedication">Dedication (printed on the back, optional)</Label>
            <Input
              id="dedication"
              value={draft.dedication}
              onChange={(e) => update({ dedication: e.target.value })}
              placeholder="For Mum, September 2026"
              className="tap-safe mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="design-message">Message on the card</Label>
          <Textarea
            id="design-message"
            value={draft.message}
            onChange={(e) => update({ message: e.target.value })}
            className="mt-1.5 min-h-24"
          />
        </div>

        <Button type="button" variant="ghost" onClick={onReset} className="tap-safe">
          Reset design choices
        </Button>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 text-sm font-semibold">Live preview</p>
        <CardPreview draft={draft} />
      </div>
    </div>
  );
}
