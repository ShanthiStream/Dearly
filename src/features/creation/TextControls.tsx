import { ChevronDown } from "lucide-react";
import { cardFonts } from "@/domain/content";
import type { CreationDraft, FontId } from "@/domain/entities/types";

/** Font picker as a simple dropdown; text placement is done by dragging on the card. */
export function TextControls({
  draft,
  update,
}: {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
}) {
  const selected = cardFonts.find((font) => font.id === draft.fontId) ?? cardFonts[0];

  return (
    <div>
      <label
        htmlFor="card-font-select"
        className="px-1 text-[13px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        Font
      </label>
      <div className="relative mt-2">
        <select
          id="card-font-select"
          value={draft.fontId}
          onChange={(event) => update({ fontId: event.target.value as FontId })}
          className="tap-safe h-12 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-[16px] text-foreground"
          style={{ fontFamily: selected?.family, fontWeight: selected?.weight }}
        >
          {cardFonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
