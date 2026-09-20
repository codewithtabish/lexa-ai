
import { Gem } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../../general/layouts/legal-page-layout";

export const metadata = {
  title: "Refund Policy — LEXA AI",
  description:
    "Our refund policy for subscriptions and credit purchases on LEXA AI.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <>
        <p>
          We want you to be completely satisfied with LEXA AI. This Refund
          Policy explains when and how you can request a refund for
          subscriptions and credit purchases.
        </p>
        <p>
          Our goal is to be fair and transparent — no hidden clauses, no
          confusing jargon.
        </p>
      </>
    ),
  },
  {
    id: "free-trial",
    title: "Free Trial",
    body: (
      <>
        <p>
          Every new LEXA account receives{" "}
          <strong className="text-foreground">4 free credits</strong> on
          signup. No payment information is required, so there&apos;s nothing
          to refund during the trial.
        </p>
        <p>
          Use your free credits to explore any feature — hairstyles, beards,
          outfits, age transformations, hair colors, or AI image generation.
        </p>
      </>
    ),
  },
  {
    id: "subscriptions",
    title: "Subscription Refunds",
    body: (
      <>
        <p>
          You may request a full refund within{" "}
          <strong className="text-foreground">7 days</strong> of your initial
          subscription purchase if:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>You haven&apos;t used any credits in the current billing cycle</li>
          <li>Technical issues prevented you from using the Service</li>
          <li>You were charged by mistake or without authorization</li>
        </ul>
        <p>
          Refunds for renewals are available within{" "}
          <strong className="text-foreground">48 hours</strong> of the charge
          if no credits have been used.
        </p>
      </>
    ),
  },
  {
    id: "credits",
    title: "Credit Purchase Refunds",
    body: (
      <>
        <p>
          Individual credit pack purchases (if available) may be refunded
          within{" "}
          <strong className="text-foreground">48 hours</strong> of purchase,
          provided the credits have not been used.
        </p>
        <p>
          Once credits are consumed on a transformation, that portion is
          non-refundable.
        </p>
      </>
    ),
  },
  {
    id: "how-to-request",
    title: "How to Request a Refund",
    body: (
      <>
        <p>
          To request a refund, email us at{" "}
          <a
            href="mailto:tabish@codewithtabish.com"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            tabish@codewithtabish.com
          </a>{" "}
          with:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Your account email</li>
          <li>Date of purchase</li>
          <li>Reason for the refund request</li>
          <li>Any relevant order ID or receipt</li>
        </ul>
        <p>
          We&apos;ll respond within 3 business days and process approved
          refunds within 5-10 business days.
        </p>
      </>
    ),
  },
  {
    id: "non-refundable",
    title: "Non-Refundable Cases",
    body: (
      <>
        <p>Refunds are NOT available for:</p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Credits that have already been used</li>
          <li>Subscription renewals beyond the 48-hour window</li>
          <li>Accounts terminated for violation of our Terms of Service</li>
          <li>Requests made more than 30 days after purchase</li>
          <li>
            Dissatisfaction with AI results when the Service worked as
            described
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "chargebacks",
    title: "Chargebacks",
    body: (
      <p>
        Please contact us before initiating a chargeback with your bank.
        Chargebacks initiated without contacting us first may result in
        immediate account suspension. We&apos;re always happy to resolve issues
        directly.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Questions?",
    body: (
      <p>
        If you have any questions about our refund policy, contact us at{" "}
        <a
          href="mailto:tabish@codewithtabish.com"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          tabish@codewithtabish.com
        </a>{" "}
        or visit our{" "}
        <a
          href="/contact"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Contact page
        </a>
        .
      </p>
    ),
  },
];

export default function RefundPage() {
  return (
    <LegalPageLayout
      badge="Refund Policy"
      title="Fair & Transparent Refunds"
      subtitle="Our promise: no hidden fees, no confusing clauses. Just clear rules that respect you."
      lastUpdated="September 17, 2026"
      readingTime="4 min"
      accentIcon={Gem}
      sections={SECTIONS}
    />
  );
}