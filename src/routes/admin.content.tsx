import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/layout/Page";
import { occasions, templates, visualStyles } from "@/domain/content";
import { galleryItems } from "@/domain/samples";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Content (staff) — Dearly Studio" },
      { name: "description", content: "Staff view of occasions, styles, templates and gallery samples." },
      { property: "og:title", content: "Content (staff) — Dearly Studio" },
      { property: "og:description", content: "Internal staff tooling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminContent,
});

function AdminContent() {
  const t = useT();

  const groups = [
    { title: t("admin.content.group.occasions"), items: occasions.map((o) => o.label) },
    { title: t("admin.content.group.styles"), items: visualStyles.map((s) => s.label) },
    { title: t("admin.content.group.templates"), items: templates.map((t) => t.label) },
    { title: t("admin.content.group.gallerySamples"), items: galleryItems.map((g) => g.label) },
  ];

  return (
    <Page
      wide
      title={t("admin.content.title")}
      intro={t("admin.content.intro")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title} className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg">{group.title}</h2>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Page>
  );
}
