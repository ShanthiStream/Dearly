import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Prose } from "@/components/layout/Page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — Dearly Studio" },
      {
        name: "description",
        content:
          "The rules for using Dearly Studio: your photo rights, acceptable use, orders, cancellation and refunds.",
      },
      { property: "og:title", content: "Terms of use — Dearly Studio" },
      { property: "og:description", content: "Plain-language terms, including ordering and refunds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <Page title="Terms of use" intro="What you agree to when you use Dearly Studio.">
      <Alert className="mb-6">
        <AlertTitle>Pre-launch status</AlertTitle>
        <AlertDescription>
          These terms are a working draft written alongside the product. They are reviewed by legal
          counsel before launch and are not legal advice.
        </AlertDescription>
      </Alert>

      <Prose>
        <h2>Who can use this</h2>
        <p>
          You must be 13 or older to upload a photo, save work or place an order. Younger visitors
          may browse the samples and gallery only.
        </p>

        <h2>Your photos</h2>
        <p>
          You keep ownership of your photos and your words. Before the photo picker opens you
          confirm that you own the photo or have permission to use it, and that anyone you add to
          your card list is happy to be listed there. You give us permission to store and process
          the photo only to produce what you asked for.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Do not upload photos of other people without their permission.</li>
          <li>Do not upload unlawful, hateful, sexual or harassing content, or content that infringes someone else's rights.</li>
          <li>Do not use the service to impersonate someone or to harass a person pictured.</li>
          <li>We may refuse or stop a generation or an order that breaks these rules.</li>
        </ul>

        <h2>AI-written wording</h2>
        <p>
          Suggested wording is generated automatically and you are responsible for what you send.
          Always read it before sharing. We do not guarantee any particular result, and occasionally
          a suggestion fails — you can retry without losing what you typed.
        </p>

        <h2>Orders, delivery and cancellation</h2>
        <ul>
          <li>Prices, shipping and taxes are shown in full before payment.</li>
          <li>Printed items are made to order. Once production has started, we cannot change the delivery address or cancel the item.</li>
          <li>Digital downloads are delivered immediately and are separate from shipped products.</li>
          <li>Our final refund and cancellation rules are confirmed before launch and published here and on the refund page.</li>
        </ul>

        <h2>Privacy</h2>
        <p>
          How we handle your data is described in our{" "}
          <Link to="/privacy" className="underline">
            privacy notice
          </Link>
          . Deletion requests, including from people who do not use the service, go through{" "}
          <Link to="/privacy/request" className="underline">
            /privacy/request
          </Link>
          .
        </p>

        <h2>Changes</h2>
        <p>
          We record the version and time of the terms you accepted. If we change them materially, we
          ask you to accept the new version before you continue.
        </p>
      </Prose>
    </Page>
  );
}
