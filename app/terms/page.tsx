import type { Metadata } from 'next';

import {
  LegalContactDetails,
  LegalDocument,
  LegalSection,
} from '@/components/ydeck/LegalDocument';
import { type LegalSectionLink } from '@/components/ydeck/data/legal';

export const metadata: Metadata = {
  title: 'Terms of Service | YDeck',
  description: 'Terms governing the use of YDeck services, AI agents and integrations.',
  alternates: {
    canonical: '/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms of Service | YDeck',
    description: 'Terms governing the use of YDeck services, AI agents and integrations.',
    url: '/terms',
    type: 'website',
  },
};

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'about', label: 'About YDeck' },
  { id: 'accounts', label: 'Account Responsibilities' },
  { id: 'authorized-use', label: 'Business and Authorized Use' },
  { id: 'integrations', label: 'Third-Party Integrations' },
  { id: 'instagram-sales-agent', label: 'Instagram Sales Agent' },
  { id: 'ai-content', label: 'AI-Generated Content' },
  { id: 'prohibited-uses', label: 'Prohibited Uses' },
  { id: 'customer-content', label: 'Customer Content and Data' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'availability', label: 'Availability and Changes' },
  { id: 'fees', label: 'Fees' },
  { id: 'termination', label: 'Suspension and Termination' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'indemnity', label: 'Indemnity' },
  { id: 'law', label: 'Governing Law' },
  { id: 'changes', label: 'Changes to These Terms' },
  { id: 'contact', label: 'Contact' },
] as const satisfies readonly LegalSectionLink[];

export default function TermsPage() {
  return (
    <LegalDocument
      activePath="/terms"
      description="The terms governing access to and use of YDeck."
      sections={sections}
      title="Terms of Service"
    >
      <LegalSection id="acceptance" title="Acceptance of Terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) are an agreement between you and GLOBANCE GROUP
          LIMITED (&quot;Globance&quot;, &quot;YDeck&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company
          established in Hong Kong. By accessing or using YDeck, you agree to these Terms. If you use
          YDeck for an organization, you represent that you have authority to accept these Terms on
          its behalf.
        </p>
        <p>
          If you do not agree to these Terms, do not access or use the service. Additional written
          terms may apply to a pilot, enterprise deployment, paid plan, or particular integration. If
          those terms conflict with these Terms, the more specific written terms control for that
          service.
        </p>
      </LegalSection>

      <LegalSection id="about" title="About YDeck">
        <p>
          YDeck is an AI-powered business productivity platform operated by GLOBANCE GROUP LIMITED.
          YDeck may provide features including AI agents, reporting, presentations, business
          intelligence, messaging integrations, sales automation, and third-party integrations.
        </p>
        <p>
          Features may be available only in selected plans, pilots, deployments, or regions. Product
          descriptions do not guarantee that every feature is available to every user.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="Account Responsibilities">
        <p>You are responsible for:</p>
        <ul>
          <li>providing accurate and current account and organization information;</li>
          <li>protecting passwords, authentication methods, access tokens, and devices;</li>
          <li>all activity performed through your account, except where caused by our breach;</li>
          <li>promptly notifying us of suspected unauthorized use or security incidents; and</li>
          <li>ensuring that employees, contractors, and other authorized users comply with these Terms.</li>
        </ul>
        <p>
          You must not share credentials in a way that defeats account controls or permit an
          unauthorized person to use your account.
        </p>
      </LegalSection>

      <LegalSection id="authorized-use" title="Business and Authorized Use">
        <p>
          You may connect or submit only systems, accounts, content, and data that you are authorized
          to use for the intended purpose. You must have all permissions and lawful grounds required
          to direct YDeck to process information on behalf of your organization.
        </p>
        <p>You must not connect:</p>
        <ul>
          <li>another person's Instagram or other account without authorization;</li>
          <li>company systems or business data without permission; or</li>
          <li>confidential systems or information that you are not authorized to access or process.</li>
        </ul>
      </LegalSection>

      <LegalSection id="integrations" title="Third-Party Integrations">
        <p>
          YDeck may connect with Instagram, Meta platforms, and other business systems or APIs that
          you select. Your use of those services remains subject to the applicable third party's
          terms, policies, permissions, and technical restrictions.
        </p>
        <p>
          We do not control third-party availability, approval decisions, API behavior, or policy
          changes. An integration may be limited, interrupted, or discontinued if a third party
          changes or withdraws access. YDeck is not endorsed by Meta or other integration providers
          merely because an integration is available.
        </p>
      </LegalSection>

      <LegalSection id="instagram-sales-agent" title="Instagram Sales Agent">
        <p>
          When a business connects an Instagram Professional account, it authorizes YDeck through
          Meta's official authentication and APIs. YDeck may assist the business with receiving,
          organizing, analyzing, and responding to customer messages through Sales Agent features.
        </p>
        <p>
          The business remains responsible for its customer communications, response approvals,
          disclosures, recordkeeping, and compliance with applicable law and Meta policies. Users
          should review AI-generated responses where appropriate before they are sent or relied on.
        </p>
        <p>
          You must not use YDeck to send spam, harass users, conduct unauthorized automated messaging,
          evade platform restrictions, or otherwise violate Meta's terms or policies.
        </p>
      </LegalSection>

      <LegalSection id="ai-content" title="AI-Generated Content">
        <p>
          AI-generated content can contain mistakes, omissions, or outdated information. YDeck does
          not guarantee that every output will be accurate, complete, unique, or suitable for every
          business, legal, financial, compliance, or operational purpose.
        </p>
        <p>
          You are responsible for applying appropriate human review, checking important facts and
          source material, and deciding whether and how to use an output. These review obligations do
          not prevent YDeck from being used for ordinary automation; they reflect the practical limits
          of automated systems and the customer's control over its own business decisions.
        </p>
      </LegalSection>

      <LegalSection id="prohibited-uses" title="Prohibited Uses">
        <p>You must not use YDeck to:</p>
        <ul>
          <li>engage in illegal activity or violate another person's rights;</li>
          <li>gain unauthorized access to an account, network, system, or confidential information;</li>
          <li>send spam, phishing messages, malware, or other harmful content;</li>
          <li>steal credentials, impersonate others deceptively, or facilitate fraud;</li>
          <li>harass, threaten, exploit, or unlawfully discriminate against another person;</li>
          <li>infringe intellectual property, privacy, publicity, or other legal rights;</li>
          <li>evade technical controls, rate limits, safety measures, or platform restrictions;</li>
          <li>scrape data without authorization or a lawful basis;</li>
          <li>violate Meta, Instagram, or another connected platform's terms or policies;</li>
          <li>probe, disrupt, overload, or compromise YDeck or its supporting infrastructure; or</li>
          <li>help another person carry out any prohibited activity.</li>
        </ul>
      </LegalSection>

      <LegalSection id="customer-content" title="Customer Content and Data">
        <p>
          As between you and YDeck, you retain your rights in the business data, messages, files,
          instructions, and other content you submit or connect to the service (&quot;Customer Content&quot;).
          We do not claim ownership of your customer messages or uploaded business information.
        </p>
        <p>
          You grant YDeck and its service providers a limited right to host, copy, transmit, process,
          display, and otherwise use Customer Content only as reasonably necessary to provide,
          secure, support, and improve the services you request, and to comply with law. You represent
          that you have the rights and permissions needed to provide Customer Content for those uses.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Intellectual Property">
        <p>
          YDeck's software, branding, interface, technology, documentation, and original platform
          content are owned by GLOBANCE GROUP LIMITED or its licensors and are protected by
          intellectual property and other laws. Except for the limited right to use YDeck under these
          Terms, no ownership right is transferred to you.
        </p>
        <p>
          You may provide feedback about YDeck. We may use that feedback without restriction or
          payment, provided we do not publicly identify you as its source without permission.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="Availability and Changes">
        <p>
          YDeck services and features may evolve. We may perform maintenance, add or remove features,
          change technical requirements, or modify or discontinue functionality. Integrations may
          also change because of third-party API and policy decisions.
        </p>
        <p>
          We aim to operate YDeck reliably but do not promise uninterrupted or error-free access or
          guarantee that a particular integration will remain available.
        </p>
      </LegalSection>

      <LegalSection id="fees" title="Fees">
        <p>
          Certain YDeck features may be offered under free, paid, pilot, enterprise, or other
          commercial plans. Applicable pricing and commercial terms will be presented before
          purchase or agreed separately with the customer.
        </p>
        <p>
          Where fees apply, you are responsible for authorized charges and applicable taxes under
          the purchasing terms presented to you. Plan features, usage limits, renewal, cancellation,
          and refund terms may be described in the applicable order, checkout, or customer agreement.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Suspension and Termination">
        <p>
          We may restrict, suspend, or terminate access where reasonably necessary because of a
          violation of these Terms, a security threat, suspected fraud, unlawful use, abuse of an
          integration, nonpayment where applicable, or a legal or platform requirement. Where
          appropriate, we will consider the nature and severity of the issue and whether it can be
          resolved without termination.
        </p>
        <p>
          You may discontinue using YDeck at any time and may use available account controls to
          request account deletion. Provisions that by their nature should continue after termination,
          including ownership, disclaimers, liability limits, and payment obligations already
          incurred, will survive.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="Disclaimers">
        <p>
          To the maximum extent permitted by law, YDeck is provided on an &quot;as is&quot; and &quot;as available&quot;
          basis. We disclaim implied warranties of merchantability, fitness for a particular purpose,
          and non-infringement where those disclaimers are permitted.
        </p>
        <p>
          We do not warrant that the service, AI outputs, or third-party integrations will always be
          uninterrupted, error-free, secure, or suitable for every use. Nothing in these Terms limits
          a warranty or right that cannot lawfully be excluded.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, GLOBANCE GROUP LIMITED and its affiliates,
          directors, officers, employees, and licensors will not be liable for indirect, incidental,
          special, consequential, exemplary, or punitive damages, or for loss of profits, revenue,
          business opportunity, goodwill, or data, arising from or related to YDeck.
        </p>
        <p>
          Our aggregate liability will be limited to the extent reasonably permitted under applicable
          law and any controlling written commercial agreement. These limitations do not apply to
          liability that cannot legally be limited, including mandatory consumer rights where
          applicable.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="Indemnity">
        <p>
          To the extent permitted by law, if you use YDeck on behalf of a business, you agree to
          indemnify GLOBANCE GROUP LIMITED against third-party claims, losses, and reasonable costs
          arising from your unlawful misuse of YDeck, your Customer Content, your violation of these
          Terms, or your infringement of another person's rights. We will provide reasonable notice
          of a covered claim and allow reasonable participation in its defense.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Governing Law">
        <p>
          These Terms are governed by the laws of Hong Kong, without regard to conflict-of-law rules.
          The courts of Hong Kong will have jurisdiction over disputes arising from these Terms,
          subject to any mandatory applicable consumer protections or rights to bring a claim in
          another forum that cannot lawfully be waived.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to These Terms">
        <p>
          We may update these Terms as YDeck, applicable law, or third-party requirements change. The
          revised Terms will be posted on this page with an updated effective date. Where required,
          we will provide additional notice of material changes. Continued use after updated Terms
          take effect constitutes acceptance to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>Questions about these Terms may be sent to:</p>
        <LegalContactDetails />
      </LegalSection>
    </LegalDocument>
  );
}
