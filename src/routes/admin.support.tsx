import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/layout/Page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useT } from "@/i18n/i18n";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Support queue (staff) — Dearly Studio" },
      { name: "description", content: "Staff view of support and privacy request queues." },
      { property: "og:title", content: "Support queue (staff) — Dearly Studio" },
      { property: "og:description", content: "Internal staff tooling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSupport,
});

const queue = [
  {
    ref: "PR-8F3K2A",
    typeKey: "admin.support.data.deletionPictured",
    stateKey: "admin.support.data.verifying",
    openedKey: "admin.support.data.daysAgo",
    openedValue: 2,
  },
  {
    ref: "PR-2LM90X",
    typeKey: "admin.support.data.accessRequest",
    stateKey: "admin.support.data.awaitingReply",
    openedKey: "admin.support.data.daysAgo",
    openedValue: 5,
  },
  {
    ref: "SUP-1042",
    typeKey: "admin.support.data.orderQuery",
    stateKey: "admin.support.data.open",
    openedKey: "admin.support.data.today",
  },
];

function AdminSupport() {
  const t = useT();

  return (
    <Page wide title={t("admin.support.title")} intro={t("admin.support.intro")}>
      <Alert className="mb-6">
        <AlertTitle>{t("admin.support.alert.title")}</AlertTitle>
        <AlertDescription>{t("admin.support.alert.description")}</AlertDescription>
      </Alert>

      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">{t("admin.support.table.caption")}</caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-2">{t("admin.support.table.reference")}</th>
            <th scope="col" className="py-2">{t("admin.support.table.type")}</th>
            <th scope="col" className="py-2">{t("admin.support.table.state")}</th>
            <th scope="col" className="py-2">{t("admin.support.table.opened")}</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((row) => (
            <tr key={row.ref} className="border-b border-border/60">
              <td className="py-2">{row.ref}</td>
              <td className="py-2">
                {t(row.typeKey, { ref: row.ref.split("-")[1] || row.ref })}
              </td>
              <td className="py-2">{t(row.stateKey)}</td>
              <td className="py-2">
                {t(row.openedKey, row.openedValue !== undefined ? { count: row.openedValue } : undefined)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}
