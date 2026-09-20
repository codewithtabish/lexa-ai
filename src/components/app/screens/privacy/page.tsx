
import { ShieldCheck } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../../general/layouts/legal-page-layout";

const SECTIONS: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <>
        <p>
          Welcome to LEXA AI (&ldquo;LEXA,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;). This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when
          you use our website, mobile applications, and AI-powered beauty
          transformation services (collectively, the &ldquo;Service&rdquo;).
        </p>
        <p>
          LEXA AI is operated by CodeWithTabish, founded by Talha Tabish, based
          in Mardan, Pakistan. By using our Service, you consent to the
          practices described in this Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We collect the following types of information:</p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>
            <strong className="text-foreground">Account Information:</strong>{" "}
            Name, email address, and profile picture when you sign up using
            Google or email.
          </li>
          <li>
            <strong className="text-foreground">Photo Data:</strong> Photos you
            upload for AI transformation. These are processed securely and
            automatically deleted within 24 hours.
          </li>
          <li>
            <strong className="text-foreground">Usage Data:</strong> Features
            used, credits consumed, transformations created, and device
            information.
          </li>
          <li>
            <strong className="text-foreground">Payment Information:</strong>{" "}
            Billing details processed securely through our payment partners.
            We never store full card numbers.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use your information to:</p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Provide, maintain, and improve the LEXA Service</li>
          <li>Process AI transformations and deliver results</li>
          <li>Manage your account and subscription</li>
          <li>Process payments and prevent fraud</li>
          <li>Send important service updates and notifications</li>
          <li>Respond to your questions and provide support</li>
        </ul>
        <p>
          We <strong className="text-foreground">never</strong> use your photos
          to train AI models and{" "}
          <strong className="text-foreground">never</strong> sell your personal
          data to third parties.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    body: (
      <>
        <p>
          <strong className="text-foreground">Photos:</strong> Uploaded photos
          are automatically deleted from our servers within 24 hours of
          processing.
        </p>
        <p>
          <strong className="text-foreground">AI-Generated Results:</strong>{" "}
          Stored in your account history for 30 days and can be deleted anytime
          from your account settings.
        </p>
        <p>
          <strong className="text-foreground">Account Data:</strong> Retained
          for as long as your account is active. Deleted within 30 days of
          account deletion.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    body: (
      <>
        <p>
          We implement industry-standard security measures to protect your
          information:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>End-to-end encryption for all data transmission</li>
          <li>Isolated processing environments for photo transformations</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Strict access controls for our internal team</li>
        </ul>
        <p>
          However, no method of transmission over the internet is 100% secure.
          While we strive to protect your data, we cannot guarantee absolute
          security.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: (
      <>
        <p>You have the right to:</p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Access and download your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Delete your account and all associated data</li>
          <li>Opt out of marketing communications</li>
          <li>Export your transformation history</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a
            href="mailto:tabish@codewithtabish.com"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            tabish@codewithtabish.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-Party Services",
    body: (
      <>
        <p>
          We work with trusted third-party partners to operate LEXA, including:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>
            <strong className="text-foreground">Clerk</strong> for
            authentication
          </li>
          <li>
            <strong className="text-foreground">Neon</strong> for database
            hosting
          </li>
          <li>
            <strong className="text-foreground">Safepay</strong> for payment
            processing
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> for hosting and
            infrastructure
          </li>
        </ul>
        <p>
          Each partner is contractually obligated to protect your data and use
          it only for the services they provide to us.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    body: (
      <p>
        LEXA is not intended for children under 13. We do not knowingly collect
        information from children. If you believe a child has provided us with
        personal information, contact us immediately so we can delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy periodically. We&apos;ll notify you
        of significant changes via email or through the Service. Continued use
        after changes means you accept the updated policy.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    body: (
      <p>
        For any privacy-related questions, contact us at{" "}
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

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      badge="Privacy Policy"
      title="Your Privacy, Our Priority"
      subtitle="Learn how LEXA AI collects, uses, and protects your personal information. We're committed to full transparency."
      lastUpdated="September 17, 2026"
      readingTime="5 min"
      accentIcon={ShieldCheck}
      sections={SECTIONS}
    />
  );
}