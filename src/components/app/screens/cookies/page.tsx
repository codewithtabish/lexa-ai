
import { Cookie } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../../general/layouts/legal-page-layout";

export const metadata = {
  title: "Cookie Policy — LEXA AI",
  description:
    "How LEXA AI uses cookies and similar technologies on our website and app.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies?",
    body: (
      <>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help websites remember your preferences and improve
          your browsing experience.
        </p>
        <p>
          LEXA uses cookies and similar technologies (like local storage) to
          make our Service faster, safer, and more personalized.
        </p>
      </>
    ),
  },
  {
    id: "types-of-cookies",
    title: "Types of Cookies We Use",
    body: (
      <>
        <p>We use the following categories of cookies:</p>

        <div className="mt-2 flex flex-col gap-3.5">
          <div>
            <h4 className="mb-1 text-[13px] font-bold text-foreground sm:text-sm">
              🔒 Strictly Necessary Cookies
            </h4>
            <p>
              Required for the Service to function. These handle
              authentication, session management, and security. You cannot
              disable these.
            </p>
          </div>

          <div>
            <h4 className="mb-1 text-[13px] font-bold text-foreground sm:text-sm">
              ⚙️ Functional Cookies
            </h4>
            <p>
              Remember your preferences like theme (light/dark mode), language,
              and recently used features. Disabling these may affect your
              experience.
            </p>
          </div>

          <div>
            <h4 className="mb-1 text-[13px] font-bold text-foreground sm:text-sm">
              📊 Analytics Cookies
            </h4>
            <p>
              Help us understand how users interact with LEXA — which features
              are popular, where users get stuck, and how we can improve. Data
              is anonymized.
            </p>
          </div>

          <div>
            <h4 className="mb-1 text-[13px] font-bold text-foreground sm:text-sm">
              🎯 Marketing Cookies
            </h4>
            <p>
              Used to show relevant ads on third-party platforms and measure
              marketing campaign effectiveness. Only set with your consent.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Cookies",
    body: (
      <>
        <p>
          Some cookies are set by trusted third-party services we use to
          operate LEXA:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>
            <strong className="text-foreground">Clerk</strong> — Authentication
            and session management
          </li>
          <li>
            <strong className="text-foreground">Vercel Analytics</strong> —
            Anonymized usage analytics
          </li>
          <li>
            <strong className="text-foreground">Google Analytics</strong> —
            Understanding traffic patterns
          </li>
          <li>
            <strong className="text-foreground">Safepay</strong> — Secure
            payment processing
          </li>
        </ul>
        <p>
          Each of these partners has their own privacy and cookie policies,
          which we recommend reviewing.
        </p>
      </>
    ),
  },
  {
    id: "your-choices",
    title: "Your Choices",
    body: (
      <>
        <p>You have full control over cookies:</p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>
            <strong className="text-foreground">Browser settings:</strong> Most
            browsers let you block or delete cookies. Check your browser&apos;s
            help section.
          </li>
          <li>
            <strong className="text-foreground">Opt-out of analytics:</strong>{" "}
            Use browser extensions like uBlock Origin or privacy-focused
            browsers.
          </li>
          <li>
            <strong className="text-foreground">Do Not Track:</strong> We
            respect your browser&apos;s Do Not Track signal.
          </li>
        </ul>
        <p>
          Note: Disabling certain cookies may limit functionality of the
          Service.
        </p>
      </>
    ),
  },
  {
    id: "local-storage",
    title: "Local Storage & Similar Tech",
    body: (
      <>
        <p>
          In addition to cookies, LEXA uses browser local storage to save:
        </p>
        <ul className="ml-4 flex list-disc flex-col gap-1.5 pl-2">
          <li>Your theme preference (light/dark mode)</li>
          <li>Recently viewed transformations</li>
          <li>Client-side caching for faster loading</li>
        </ul>
        <p>
          Local storage data stays on your device and isn&apos;t transmitted to
          our servers.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    body: (
      <p>
        We may update this Cookie Policy as we add new features or as laws
        change. Any significant changes will be communicated via email or
        through a notice on our Service.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    body: (
      <p>
        For cookie-related questions, contact us at{" "}
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

export default function CookiesPage() {
  return (
    <LegalPageLayout
      badge="Cookie Policy"
      title="Cookies & How We Use Them"
      subtitle="A transparent look at the cookies and similar technologies LEXA uses to improve your experience."
      lastUpdated="September 17, 2026"
      readingTime="4 min"
      accentIcon={Cookie}
      sections={SECTIONS}
    />
  );
}