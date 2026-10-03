import type { LocaleCode } from "./dictionary";
import { locales } from "./dictionary";
import { libraryStrings } from "./pages/library";
import { marketingStrings } from "./pages/marketing";
import { legalStrings } from "./pages/legal";
import { accountStrings } from "./pages/account";
import { createStrings } from "./pages/create";
import { adminStrings } from "./pages/admin";

type Strings = Record<LocaleCode, Record<string, string>>;

const sources: Strings[] = [
  libraryStrings,
  marketingStrings,
  legalStrings,
  accountStrings,
  createStrings,
  adminStrings,
];

function merge(): Strings {
  const out = {} as Strings;
  for (const { code } of locales) {
    out[code] = Object.assign({}, ...sources.map((s) => s[code] ?? {}));
  }
  return out;
}

export const pageDictionaries: Strings = merge();
