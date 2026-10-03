import { Globe } from "lucide-react";
import { locales, useI18n, type LocalePreference } from "@/i18n/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { preference, setLocale, t } = useI18n();

  return (
    <Select
      value={preference}
      onValueChange={(value) => setLocale(value as LocalePreference)}
    >
      <SelectTrigger
        className={className ?? "tap-safe h-10 w-auto gap-2"}
        aria-label={t("nav.language")}
      >
        <Globe className="size-4" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="system">{t("nav.languageAuto")}</SelectItem>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.nativeLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
