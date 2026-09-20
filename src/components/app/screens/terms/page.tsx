
import { FileText } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../../general/layouts/legal-page-layout";

export const metadata = {
  title: "Terms of Service — LEXA AI",
  description:
    "The terms and conditions governing your use of LEXA AI services.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: (
      <>
        <p>
          By accessing or using LEXA AI (&ldquo;the Service&rdquo;), you agree
          to be bound by these Terms of Service. If you do not agree to these
          terms, you may not use the Service.
        </p>
        <p>
          LEXA AI is operated by CodeWithTabish, based in Mardan, Pakistan.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    body: (
      <>
        <p>To use LEXA, you must:</p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Be at least 13 years of age</li>
          <li>Provide accurate account information</li>
          <li>Not use the Service for any unlawful purpose</li>
          <li>Comply with all applicable local, national, and international laws</li>
        </ul>
      </>
    ),
  },
  {
    id: "account",
    title: "Account & Credentials",
    body: (
      <>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials. Notify us immediately if you suspect unauthorized
          access.
        </p>
        <p>
          You may not share your account with others or use it for commercial
          purposes unless you have a Pro subscription with commercial usage
          rights.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    body: (
      <>
        <p>You agree NOT to use LEXA to:</p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>
            Create non-consensual, explicit, or harmful imagery of any person
          </li>
          <li>Impersonate others or misrepresent your identity</li>
          <li>Upload photos of individuals without their consent</li>
          <li>Violate any intellectual property rights</li>
          <li>Attempt to reverse-engineer or hack the Service</li>
          <li>Use automated scripts or bots to access the Service</li>
          <li>Generate content that violates Google Play, Apple, or any platform policies</li>
        </ul>
        <p>
          Violation of these rules may result in immediate account termination.
        </p>
      </>
    ),
  },
  {
    id: "credits-payments",
    title: "Credits & Payments",
    body: (
      <>
        <p>
          LEXA operates on a credit system. New users receive 4 free credits
          upon signup. Credits can be purchased or earned through subscription
          plans (Basic or Pro).
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Credits do not roll over between billing cycles</li>
          <li>All purchases are final unless covered by our Refund Policy</li>
          <li>Prices are subject to change with advance notice</li>
          <li>
            Payments are processed securely through our payment partners
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-content",
    title: "AI-Generated Content",
    body: (
      <>
        <p>
          LEXA uses advanced AI to generate transformations of your photos.
          You retain ownership of your original photos and the generated
          results.
        </p>
        <p>
          However, you acknowledge that:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>AI results are simulations, not guarantees of real-world outcomes</li>
          <li>Results may vary based on photo quality and other factors</li>
          <li>
            Commercial use of transformations requires a Pro subscription
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual Property",
    body: (
      <>
        <p>
          The LEXA name, logo, design, code, and all related materials are the
          property of CodeWithTabish and protected by international copyright
          and trademark laws.
        </p>
        <p>
          You may not copy, modify, distribute, or create derivative works from
          our Service without express written permission.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    body: (
      <>
        <p>
          We reserve the right to suspend or terminate your account at any time
          for:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Violation of these Terms</li>
          <li>Fraudulent or abusive behavior</li>
          <li>Non-payment of subscription fees</li>
          <li>Any activity that harms LEXA or other users</li>
        </ul>
        <p>
          You may delete your account anytime from your account settings.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: (
      <p>
        LEXA is provided &ldquo;as is&rdquo; without warranties of any kind. We
        are not liable for any indirect, incidental, or consequential damages
        arising from your use of the Service, including but not limited to lost
        revenue, lost data, or business interruption.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to Terms",
    body: (
      <p>
        We may update these Terms periodically. Continued use of the Service
        after changes means you accept the updated Terms. We&apos;ll notify you
        of significant changes via email.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        For any questions about these Terms, contact us at{" "}
        <a
          href="mailto:tabish@codewithtabish.com"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          tabish@codewithtabish.com
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      badge="Terms of Service"
      title="Rules of the Road"
      subtitle="Clear, fair terms that govern your use of LEXA AI. We keep it simple and human-readable."
      lastUpdated="September 17, 2026"
      readingTime="6 min"
      accentIcon={FileText}
      sections={SECTIONS}
    />
  );
}