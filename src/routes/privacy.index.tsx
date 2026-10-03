import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Prose } from "@/components/layout/Page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/privacy/")({
  head: () => ({
    meta: [
      { title: "Privacy notice — Dearly Studio" },
      {
        name: "description",
        content:
          "What we collect, why, how long we keep it, where it is processed, and how you or anyone pictured can have it deleted.",
      },
      { property: "og:title", content: "Privacy notice — Dearly Studio" },
      {
        property: "og:description",
        content: "Plain-language privacy notice with a fixed deletion schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <Page
      title="Privacy notice"
      intro="Written in plain language. It describes how the product actually behaves today."
    >
      <Alert className="mb-6">
        <AlertTitle>Pre-launch status</AlertTitle>
        <AlertDescription>
          This notice describes the system as built. It has not yet been reviewed by legal counsel
          in Bahrain or Saudi Arabia, so it is not a compliance claim or legal advice. Statutory
          retention periods and transfer mechanisms are confirmed with counsel before launch.
        </AlertDescription>
      </Alert>

      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li>The photo you upload, and the image files we generate from it.</li>
          <li>The words you write or accept, and the optional details you give us: a nickname, relationship, occasion, mood, a memory, your own name and a language.</li>
          <li>Your card list: a nickname and a relationship only. Nothing else — no phone numbers, emails, addresses, dates of birth, ID numbers, social handles or free-form notes.</li>
          <li>If you order something: the contact and delivery details the carrier needs, and the order record itself.</li>
          <li>Basic account details if you sign in, plus your text-size preference and the version and time of the confirmations you accepted.</li>
        </ul>

        <h2>What we never collect or do</h2>
        <ul>
          <li>We never store card numbers, CVCs or bank details. Payment happens on Stripe's own hosted page; we keep only Stripe's reference IDs, payment status, amount, currency and receipt details.</li>
          <li>We never use face recognition or biometric identification, and we never collect ID documents or dates of birth.</li>
          <li>We never use your photos, messages or card list to train AI models.</li>
          <li>We never sell your data, build advertising audiences, or run third-party ad pixels or cross-site trackers.</li>
          <li>We never import, scrape or enrich contacts.</li>
        </ul>

        <h2>Why we hold each thing</h2>
        <ul>
          <li>Photos and generated images: to show you a preview and produce what you asked for.</li>
          <li>Wording details: to write and refine the message you asked for.</li>
          <li>Card list: so you do not have to retype a nickname next time.</li>
          <li>Order and delivery details: to take payment, print and ship, and handle returns, refunds and tax records.</li>
        </ul>

        <h2>How long we keep it</h2>
        <ul>
          <li>Guest uploads: 24 hours.</li>
          <li>Saved drafts: 30 days after you last touch them.</li>
          <li>Finished digital items: 90 days.</li>
          <li>Print files: 30 days after delivery, cancellation, or a final refund.</li>
          <li>Temporary AI inputs and outputs, and failed jobs: 24 hours.</li>
          <li>Card list entries: deleted the moment you remove them. We ask you to review after 12 months of inactivity and delete at 18 months unless you keep them.</li>
          <li>Order, invoice, refund and tax records: kept for the statutory period required in the relevant jurisdiction, confirmed with counsel. We do not state a number here before that confirmation.</li>
          <li>Backups rotate on a finite schedule (target 35 days), so deleted data ages out of them.</li>
        </ul>
        <p>These are upper limits. Nothing is kept indefinitely, and we do not keep hidden copies or indefinite “soft deleted” rows.</p>

        <h2>Where it is processed</h2>
        <p>
          Our hosting and database providers (Vercel and Supabase) and our AI, payment and print
          providers may process data outside Bahrain and Saudi Arabia. We choose regions
          deliberately, keep a register of these transfers, and put the required contracts and
          safeguards in place with each provider. Where a transfer is not permitted, we block the
          processing rather than proceed.
        </p>

        <h2>How it is protected</h2>
        <ul>
          <li>Private storage buckets with short-lived signed links. Raw file addresses are never public.</li>
          <li>Location and camera information (EXIF/GPS) is stripped from uploads.</li>
          <li>Encrypted in transit and at rest. Keys stay on our servers, are rotated, and never appear in the browser.</li>
          <li>Staff access is least-privilege, requires multi-factor sign-in, is logged and reviewed, and support sees only the minimum needed.</li>
          <li>Share pages are unlisted, tokenised, expiring, revocable and excluded from search engines.</li>
        </ul>

        <h2>Your choices</h2>
        <ul>
          <li>Delete any single photo, card or person from your library at any time.</li>
          <li>Delete your whole account: we cancel non-essential jobs, revoke sessions and share links, delete your content and card list, and ask our processors to delete their copies. Order records required by law are retained for that period only, and we explain which.</li>
          <li>Revoke or expire a share link at any time. Files already downloaded or forwarded by someone else may still exist outside our service.</li>
          <li>Anyone named or pictured — including people who have never used Dearly Studio — can ask us to delete at <Link to="/privacy/request" className="underline">/privacy/request</Link>. We verify proportionately and never ask for ID documents by default.</li>
        </ul>

        <h2>Children</h2>
        <p>
          You must be 13 or older to upload a photo or create an account. Under-13 visitors can look
          at the samples and the gallery only. We do not knowingly collect any data from a child
          under 13.
        </p>

        <h2>Contact</h2>
        <p>
          Our published contact point, the named controller, and the roles and locations of each
          processor are added here before launch, alongside legal review. We do not list a
          placeholder address.
        </p>
      </Prose>
    </Page>
  );
}
