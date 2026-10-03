import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore, emptyDraft } from "./creation-store";
import { OutcomeStep } from "./steps/OutcomeStep";
import { PhotoStep } from "./steps/PhotoStep";
import { MessageStep } from "./steps/MessageStep";
import { StyleStep } from "./steps/StyleStep";
import { DesignStep } from "./steps/DesignStep";
import { PreviewStep } from "./steps/PreviewStep";
import { OutputStep } from "./steps/OutputStep";
import type { Outcome } from "@/domain/entities/types";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/i18n";

const stepKeys = [
  "flow.step.outcome",
  "flow.step.photo",
  "flow.step.words",
  "flow.step.look",
  "flow.step.design",
  "flow.step.preview",
  "flow.step.ready",
] as const;

export function CreateFlow({ presetOutcome }: { presetOutcome?: Outcome }) {
  const { draft, updateDraft, resetDraft, hydrated } = useStore();
  const t = useT();
  const [step, setStep] = useState(presetOutcome ? 1 : 0);

  useEffect(() => {
    if (presetOutcome && hydrated && draft.outcome !== presetOutcome) {
      updateDraft({ outcome: presetOutcome });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetOutcome, hydrated]);

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(draft.photo);
    return true;
  }, [step, draft.photo]);

  const isLast = step === stepKeys.length - 1;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 pb-32 md:pb-10">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="tap-safe">
          <Link to="/">
            <X className="mr-2 size-4" aria-hidden="true" />
            {t("flow.exit")}
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {hydrated ? t("flow.saved") : t("flow.loading")}
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="tap-safe">
              <HelpCircle className="mr-2 size-4" aria-hidden="true" />
              {t("flow.help")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("flow.helpTitle")}</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <p>{t("flow.help1")}</p>
                  <p>{t("flow.help2")}</p>
                  <p>{t("flow.help3")}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <ol className="mt-4 flex flex-wrap items-center gap-1 text-xs" aria-label={t("flow.steps")}>
        {stepKeys.map((labelKey, index) => {
          const state = index === step ? "current" : index < step ? "done" : "todo";
          return (
            <li key={labelKey}>
              <button
                type="button"
                onClick={() => setStep(index)}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1.5",
                  state === "current" && "bg-primary text-primary-foreground",
                  state === "done" && "bg-secondary text-secondary-foreground",
                  state === "todo" && "text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="size-3" aria-hidden="true" /> : null}
                {t(labelKey)}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-2xl border border-border bg-card/70 p-4 sm:p-6">
        {step === 0 ? (
          <OutcomeStep value={draft.outcome} onChange={(outcome) => updateDraft({ outcome })} />
        ) : null}
        {step === 1 ? <PhotoStep draft={draft} update={updateDraft} /> : null}
        {step === 2 ? <MessageStep draft={draft} update={updateDraft} /> : null}
        {step === 3 ? <StyleStep draft={draft} update={updateDraft} /> : null}
        {step === 4 ? (
          <DesignStep
            draft={draft}
            update={updateDraft}
            onReset={() => {
              const fresh = emptyDraft();
              updateDraft({
                templateId: fresh.templateId,
                ratioId: fresh.ratioId,
                imageRotation: fresh.imageRotation,
                textCoordinates: fresh.textCoordinates,
                dedication: "",
              });
            }}
          />
        ) : null}
        {step === 5 ? <PreviewStep draft={draft} update={updateDraft} /> : null}
        {step === 6 ? <OutputStep draft={draft} /> : null}
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Button
            variant="outline"
            className="tap-safe"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
            {t("flow.back")}
          </Button>
          {!isLast ? (
            <Button
              className="tap-safe flex-1 md:flex-none"
              onClick={() => setStep((s) => Math.min(stepKeys.length - 1, s + 1))}
              disabled={!canContinue}
            >
              {t("flow.continue")}
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="tap-safe flex-1 md:flex-none"
              onClick={() => {
                resetDraft();
                setStep(0);
              }}
            >
              {t("flow.startNew")}
            </Button>
          )}
          {!canContinue ? (
            <p className="text-xs text-muted-foreground">{t("flow.needPhoto")}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
