import { Link } from "@tanstack/react-router";
import { Home, Images, Package, Plus, User } from "lucide-react";
import { useT } from "@/i18n/i18n";
import type { TranslationKey } from "@/i18n/dictionary";

const items = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/library", labelKey: "nav.library", icon: Images },
  { to: "/orders", labelKey: "nav.orders", icon: Package },
  { to: "/account", labelKey: "nav.account", icon: User },
] as const;

export function MobileNav() {
  const t = useT();
  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-1 pt-1">
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        <li className="flex justify-center">
          <Link
            to="/create"
            className="tap-safe -mt-5 flex size-14 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <Plus className="size-6" aria-hidden="true" />
            <span className="text-[10px] font-semibold">{t("nav.create")}</span>
          </Link>
        </li>
        {items.slice(2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({
  to,
  labelKey,
  icon: Icon,
}: {
  to: string;
  labelKey: TranslationKey;
  icon: typeof Home;
}) {
  const t = useT();
  return (
    <li>
      <Link
        to={to}
        className="tap-safe flex flex-col items-center gap-0.5 rounded-md px-1 py-2 text-[11px] text-muted-foreground"
        activeProps={{ className: "text-primary font-semibold" }}
        activeOptions={{ exact: to === "/" }}
      >
        <Icon className="size-5" aria-hidden="true" />
        {t(labelKey)}
      </Link>
    </li>
  );
}
