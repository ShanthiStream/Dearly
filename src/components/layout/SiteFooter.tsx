import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/layout/Logo";
import { useT } from "@/i18n/i18n";
import type { TranslationKey } from "@/i18n/dictionary";

const groups: Array<{
  titleKey: TranslationKey;
  links: Array<{ to: string; labelKey: TranslationKey }>;
}> = [
  {
    titleKey: "footer.make",
    links: [
      { to: "/create", labelKey: "cta.createFromPhoto" },
      { to: "/products", labelKey: "nav.products" },
      { to: "/gallery", labelKey: "nav.gallery" },
      { to: "/pricing", labelKey: "nav.pricing" },
    ],
  },
  {
    titleKey: "footer.yours",
    links: [
      { to: "/library", labelKey: "nav.library" },
      { to: "/orders", labelKey: "nav.orders" },
      { to: "/people", labelKey: "nav.people" },
      { to: "/account", labelKey: "nav.account" },
    ],
  },
  {
    titleKey: "footer.helpPrivacy",
    links: [
      { to: "/help", labelKey: "nav.help" },
      { to: "/privacy", labelKey: "nav.privacy" },
      { to: "/privacy/request", labelKey: "nav.privacyRequest" },
      { to: "/terms", labelKey: "nav.terms" },
    ],
  },
];

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-border bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Logo className="size-8 text-primary" />
              <p className="font-serif text-lg font-semibold">Dearly Studio</p>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
          {groups.map((group) => (
            <nav key={group.titleKey} aria-label={t(group.titleKey)}>
              <h2 className="text-sm font-semibold">{t(group.titleKey)}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Prices, sample photos and orders shown here are demo data for development. Payments run in
          Stripe test mode and printing uses a mock partner until production credentials are added.
        </p>
      </div>
    </footer>
  );
}
