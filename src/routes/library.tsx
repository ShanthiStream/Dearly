import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Page } from "@/components/layout/Page";
import { sampleLibrary, type LibraryItem } from "@/domain/samples";
import { useI18n } from "@/i18n/i18n";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Your library — Dearly Studio" },
      {
        name: "description",
        content: "Everything you have made: cards, prints, drafts and favourites, with what expires when.",
      },
      { property: "og:title", content: "Your library — Dearly Studio" },
      { property: "og:description", content: "Open, remix, reorder or delete anything you made." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Library,
});

const tabs = [
  { id: "all", labelKey: "library.tab.all" },
  { id: "card", labelKey: "library.tab.card" },
  { id: "print", labelKey: "library.tab.print" },
  { id: "draft", labelKey: "library.tab.draft" },
  { id: "favorite", labelKey: "library.tab.favorite" },
] as const;

function Library() {
  const [items, setItems] = useState<LibraryItem[]>(sampleLibrary);
  const { locale, t } = useI18n();

  function formatExpiry(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(parsed);
  }

  function filtered(tab: (typeof tabs)[number]["id"]) {
    if (tab === "all") return items;
    if (tab === "favorite") return items.filter((i) => i.favorite);
    return items.filter((i) => i.kind === tab);
  }

  return (
    <Page
      wide
      title={t("library.title")}
      intro={t("library.intro")}
    >
      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="tap-safe">
              {t(tab.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => {
          const list = filtered(tab.id);
          return (
            <TabsContent key={tab.id} value={tab.id}>
              {list.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="font-semibold">{t("library.empty")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tab.id === "favorite"
                      ? t("library.empty.favorite")
                      : t("library.empty.default")}
                  </p>
                  <Button asChild className="tap-safe mt-4">
                    <Link to="/create">{t("library.create")}</Link>
                  </Button>
                </div>
              ) : (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {list.map((item) => (
                    <li key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        width={1024}
                        height={1024}
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                      <div className="p-3 sm:p-4">
                        <p className="truncate text-sm font-semibold sm:text-base">{item.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {t(`library.kind.${item.kind}`)} ·{" "}
                          {t("library.expires", { date: formatExpiry(item.expiresOn) })}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild size="sm" className="tap-safe flex-1 sm:flex-none">
                            <Link to="/create">{t("library.open")}</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="tap-safe hidden sm:inline-flex"
                            onClick={() => toast.success(t("library.toast.duplicated"))}
                          >
                            {t("library.duplicate")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="tap-safe hidden sm:inline-flex"
                            onClick={() => toast.success(t("library.toast.revoked"))}
                          >
                            {t("library.revoke")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="tap-safe text-destructive"
                            onClick={() => {
                              setItems((current) => current.filter((i) => i.id !== item.id));
                              toast.success(t("library.toast.deleted"));
                            }}
                          >
                            {t("library.delete")}
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </Page>
  );
}
