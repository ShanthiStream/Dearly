import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, en, locales, type LocaleCode, type TranslationKey } from "./dictionary";
import { pageDictionaries } from "./page-dictionary";

const LOCALE_KEY = "dearly.locale.v1";

/** "system" follows the device/browser language; anything else is an explicit choice. */
export type LocalePreference = "system" | LocaleCode;

interface I18nValue {
  /** The language actually being shown. */
  locale: LocaleCode;
  /** What the user picked: "system" or a specific language. */
  preference: LocalePreference;
  /** The language the device asks for. */
  systemLocale: LocaleCode;
  dir: "ltr" | "rtl";
  setLocale: (pref: LocalePreference) => void;
  t: (key: TranslationKey | string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function dirFor(code: LocaleCode): "ltr" | "rtl" {
  return locales.find((l) => l.code === code)?.dir === "rtl" ? "rtl" : "ltr";
}

function isLocale(value: string): value is LocaleCode {
  return locales.some((l) => l.code === value);
}

/** Best supported match for the device languages, e.g. "zh-CN" -> "zh". */
function detectSystemLocale(): LocaleCode {
  try {
    const nav = window.navigator;
    const tags = [...(nav.languages ?? []), nav.language].filter(Boolean);
    for (const tag of tags) {
      const base = tag.toLowerCase().split(/[-_]/)[0];
      if (base && isLocale(base)) return base;
    }
  } catch {
    /* no navigator — fall through */
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<LocalePreference>("system");
  const [systemLocale, setSystemLocale] = useState<LocaleCode>("en");

  // Hydrate after mount so SSR and client markup match.
  useEffect(() => {
    const syncSystemLocale = () => setSystemLocale(detectSystemLocale());
    syncSystemLocale();
    try {
      const stored = window.localStorage.getItem(LOCALE_KEY);
      if (stored && isLocale(stored)) setPreference(stored);
    } catch {
      /* storage blocked — follow the device */
    }
    window.addEventListener("languagechange", syncSystemLocale);
    return () => window.removeEventListener("languagechange", syncSystemLocale);
  }, []);

  const locale: LocaleCode = preference === "system" ? systemLocale : preference;

  useEffect(() => {
    const dir = dirFor(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((pref: LocalePreference) => {
    setPreference(pref);
    try {
      if (pref === "system") window.localStorage.removeItem(LOCALE_KEY);
      else window.localStorage.setItem(LOCALE_KEY, pref);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      preference,
      systemLocale,
      dir: dirFor(locale),
      setLocale,
      t: (key, values) => {
        const englishPages = pageDictionaries.en;
        const translatedPages = pageDictionaries[locale];
        let text = translatedPages[key] ?? dict[key as TranslationKey] ?? englishPages[key] ?? en[key as TranslationKey] ?? key;
        if (values) {
          for (const [name, value] of Object.entries(values)) {
            text = text.replaceAll(`{${name}}`, String(value));
          }
        }
        return text;
      },
    };
  }, [locale, preference, systemLocale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const fallbackValue: I18nValue = {
  locale: "en",
  preference: "system",
  systemLocale: "en",
  dir: "ltr",
  setLocale: () => {},
  t: (key, values) => {
    let text = pageDictionaries.en[key] ?? en[key as TranslationKey] ?? String(key);
    if (values) {
      for (const [name, value] of Object.entries(values)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  },
};

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  // Without a provider (e.g. an isolated render), fall back to English instead of crashing.
  return ctx ?? fallbackValue;
}

export function useT() {
  return useI18n().t;
}

export { locales };
export type { LocaleCode, TranslationKey };
