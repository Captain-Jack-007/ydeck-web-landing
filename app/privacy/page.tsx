import type { Metadata } from 'next';

import {
  LegalContactDetails,
  LegalDocument,
  LegalSection,
} from '@/components/ydeck/LegalDocument';
import { legalCompany, type LegalSectionLink } from '@/components/ydeck/data/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy | YDeck',
  description: 'Learn how YDeck collects, uses, protects and manages information.',
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy | YDeck',
    description: 'Learn how YDeck collects, uses, protects and manages information.',
    url: '/privacy',
    type: 'website',
  },
};

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use-information', label: 'How We Use Information' },
  { id: 'ai-processing', label: 'AI and Automated Processing' },
  { id: 'instagram-meta-data', label: 'Instagram and Meta Platform Data' },
  { id: 'sharing', label: 'Sharing of Information' },
  { id: 'retention', label: 'Data Retention' },
  { id: 'deletion', label: 'Data Deletion' },
  { id: 'security', label: 'Data Security' },
  { id: 'international', label: 'International Processing' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'third-parties', label: 'Third-Party Services' },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact' },
] as const satisfies readonly LegalSectionLink[];

export default function PrivacyPage() {
  return (
    <LegalDocument
      activePath="/privacy"
      description="How YDeck handles and protects information."
      sections={sections}
      title="Privacy Policy"
    >
      <LegalSection id="introduction" title="Introduction">
        <p>
          YDeck is operated by GLOBANCE GROUP LIMITED (&quot;Globance&quot;, &quot;YDeck&quot;,
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company established in Hong Kong. YDeck
          provides AI-powered business agents, productivity tools, integrations, and related
          services.
        </p>
        <p>
          This Privacy Policy describes how we collect, process, store, use, share, and delete
          personal and business information when you visit YDeck, create an account, use our
          services, join a pilot, or connect an authorized third-party service.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="Information We Collect">
        <p>
          The information we collect depends on the features you use, the information you choose
          to provide, and the integrations you authorize. We do not claim to collect every item
          below from every user.
        </p>

        <h3>Account and business information</h3>
        <p>When you create or manage a YDeck account or workspace, we may process:</p>
        <ul>
          <li>your name, display name, email address, and profile image;</li>
          <li>organization, workspace, membership, and role information;</li>
          <li>authentication method, account status, and session information; and</li>
          <li>preferences such as language, locale, and time zone.</li>
        </ul>
        <p>
          If you request a reporting audit, pilot, or other business contact, we may also collect
          the details submitted in that request, such as company, role, contact details, reporting
          workflow, preferred processing mode, expected volume, and requested output format.
        </p>

        <h3>Customer content</h3>
        <p>
          When a feature allows you to submit business materials, we may process the content you
          provide, such as report packs, source files, templates, instructions, comments, prompts,
          and generated outputs. The particular content processed depends on the YDeck service and
          configuration selected by the customer.
        </p>

        <h3>Integration information</h3>
        <p>
          If you voluntarily connect a third-party service, such as Instagram or another Meta
          service, YDeck may receive information that you authorize the third party to provide. For
          an Instagram Professional account, this may include, depending on the permissions granted:
        </p>
        <ul>
          <li>Instagram Professional account identifiers and account or profile information;</li>
          <li>conversation identifiers, incoming messages, and message metadata;</li>
          <li>messages sent through YDeck on behalf of the connected business; and</li>
          <li>information required to establish and maintain the authorized connection.</li>
        </ul>
        <p>
          YDeck only accesses information permitted by the user's authorization and the applicable
          Meta APIs.
        </p>

        <h3>OAuth and access credentials</h3>
        <p>
          Integrations may require OAuth access tokens or similar credentials. We use these
          credentials only to establish, maintain, and operate integrations authorized by the
          customer. We use reasonable technical and organizational safeguards designed to protect
          authentication credentials and access tokens.
        </p>

        <h3>Usage and technical information</h3>
        <p>
          When you use YDeck, we may process technical information generated by the service, such
          as browser or device information, IP address, session and security events, timestamps,
          feature usage, request identifiers, application logs, and error logs. YDeck also uses
          session technologies necessary to authenticate users, preserve session security, and
          operate selected features.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use-information" title="How We Use Information">
        <p>We may use information to:</p>
        <ul>
          <li>provide, maintain, and improve YDeck functionality;</li>
          <li>create accounts, authenticate users, and administer workspaces;</li>
          <li>operate AI agents and process customer-requested tasks;</li>
          <li>connect and maintain third-party services authorized by the customer;</li>
          <li>receive customer messages and enable businesses to respond to them;</li>
          <li>maintain conversation context and related business workflows;</li>
          <li>diagnose errors, monitor reliability, and provide customer support;</li>
          <li>protect accounts, detect abuse, and respond to security threats;</li>
          <li>manage plans, subscriptions, and service entitlements where applicable; and</li>
          <li>comply with applicable law and enforce our agreements.</li>
        </ul>
        <p>
          When a business connects an Instagram Professional account, YDeck may process incoming
          Instagram messages so that the business can view, manage, analyze, and respond to customer
          conversations through YDeck.
        </p>
      </LegalSection>

      <LegalSection id="ai-processing" title="AI and Automated Processing">
        <p>
          YDeck may use AI systems to assist with tasks such as classifying messages, generating
          suggested responses, summarizing conversations, identifying sales intent, qualifying
          leads, answering business questions, and preparing business content.
        </p>
        <p>
          Depending on the YDeck service, configuration, deployment environment, and features
          selected by the customer, AI processing may occur using local, private, hosted, or
          third-party AI infrastructure.
        </p>
        <p>
          AI outputs may be incomplete or incorrect. Businesses remain responsible for reviewing
          automated outputs where appropriate and for deciding how those outputs are used in their
          operations and communications.
        </p>
      </LegalSection>

      <LegalSection id="instagram-meta-data" title="Instagram and Meta Platform Data">
        <p>
          YDeck does not access an Instagram account unless the business explicitly chooses to
          connect its Instagram Professional account. Authorization occurs through Meta's official
          authentication and API mechanisms. YDeck requests only the permissions needed to provide
          the functionality selected by the business.
        </p>
        <p>
          We use authorized Instagram data to provide messaging and related Sales Agent
          functionality, including receiving, displaying, organizing, analyzing, and helping the
          business respond to customer conversations.
        </p>
        <p>
          <strong>YDeck does not sell Instagram message data.</strong> We do not use Meta Platform
          data to build unrelated advertising profiles, and we do not sell Instagram message
          content to advertisers or data brokers.
        </p>
        <p>
          A user may disconnect Instagram from YDeck where integration settings are available. The
          user may also revoke YDeck's authorization through Meta. Revocation prevents future access
          through that authorization, subject to Meta's platform behavior. Data associated with the
          integration may be deleted after disconnection or a valid deletion request, subject to
          legitimate legal, security, fraud-prevention, and technical retention requirements.
        </p>
        <p>Meta does not sponsor or endorse YDeck.</p>
      </LegalSection>

      <LegalSection id="sharing" title="Sharing of Information">
        <p>We may share information only as reasonably necessary with:</p>
        <ul>
          <li>infrastructure, hosting, communications, security, and other service providers;</li>
          <li>authorized AI service providers where applicable to the selected configuration;</li>
          <li>integrations and third-party services explicitly selected by the customer;</li>
          <li>professional advisers where disclosure is reasonably necessary; and</li>
          <li>courts, regulators, law enforcement, or other authorities where legally required.</li>
        </ul>
        <p>
          We may also disclose information in connection with a corporate transaction, subject to
          appropriate confidentiality and legal requirements.
        </p>
        <p>
          <strong>
            YDeck does not sell personal information or Instagram message content to advertisers or
            data brokers.
          </strong>
        </p>
      </LegalSection>

      <LegalSection id="retention" title="Data Retention">
        <p>
          We retain information only for as long as reasonably necessary to provide the service,
          maintain accounts and authorized integrations, protect security, satisfy legal
          obligations, resolve disputes, and enforce agreements. Retention may vary according to the
          type of information, the selected service, and the reason it is processed.
        </p>
        <p>
          After deletion, limited information may remain temporarily in backups, logs, or
          fraud-prevention and security records where technically necessary or legally required. We
          do not keep such information for unrelated purposes.
        </p>
      </LegalSection>

      <LegalSection id="deletion" title="Data Deletion">
        <p>
          You may request deletion of your personal information or data associated with an
          authorized integration by emailing{' '}
          <a href={`mailto:${legalCompany.email}`}>{legalCompany.email}</a>. Instructions specific
          to Meta and Instagram data are available on our{' '}
          <a href="/data-deletion">User Data Deletion page</a>.
        </p>
        <p>
          Signed-in YDeck users may also request deletion of their personal account through the
          account and data controls available in YDeck. To begin, use the{' '}
          <a href="/settings/account?action=delete-account">Delete your YDeck account</a> link. You
          will be asked to confirm the request and, when a password is configured for the account,
          enter the current password. Account deletion may require resolution of workspace ownership
          or active subscription obligations before it can be completed.
        </p>
        <p>
          Disconnecting an integration prevents future access through the revoked authorization,
          subject to the applicable platform's behavior. It does not necessarily remove every copy
          of information already processed where retention remains legally or technically necessary.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Data Security">
        <p>
          We use reasonable administrative, organizational, and technical safeguards designed to
          protect information against unauthorized access, alteration, disclosure, loss, or
          destruction. Safeguards are selected according to the service, configuration, and nature
          of the information involved.
        </p>
        <p>
          No method of electronic transmission or storage can be guaranteed to be completely
          secure. Users are responsible for protecting their own credentials and promptly notifying
          us of suspected unauthorized access.
        </p>
      </LegalSection>

      <LegalSection id="international" title="International Processing">
        <p>
          YDeck may serve users in multiple countries. Depending on the infrastructure, integration,
          deployment environment, and services selected, information may be processed in
          jurisdictions other than the one where the user is located. Where required by applicable
          law, we use appropriate safeguards for international processing and transfers.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your Rights">
        <p>
          Depending on where you live, applicable privacy law may provide you with certain rights,
          including access, correction, deletion, restriction, objection, withdrawal of consent
          where processing is based on consent, and data portability where legally applicable.
        </p>
        <p>
          To make a request, email <a href={`mailto:${legalCompany.email}`}>{legalCompany.email}</a>.
          We may need to verify your identity or authority before acting on a request. Some rights
          are subject to exceptions and may not apply in every jurisdiction or circumstance.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children's Privacy">
        <p>
          YDeck is primarily a business and productivity service. It is not intentionally designed
          to collect personal information from children where such collection is prohibited by law.
          If you believe a child has provided personal information to YDeck unlawfully, contact us
          so that we can review and address the matter.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Third-Party Services">
        <p>
          YDeck may connect to independent third-party services, including Meta and Instagram. Your
          use of those services remains governed by their own terms, privacy policies, permissions,
          and settings. We do not control and are not responsible for independent third-party privacy
          practices or changes to their platforms and APIs.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy to reflect changes to YDeck, applicable law, or our data
          practices. The revised policy will be posted on this page with an updated date. Where
          required, we will provide additional notice of material changes.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>For privacy questions, rights requests, or data deletion requests, contact:</p>
        <LegalContactDetails />
      </LegalSection>
    </LegalDocument>
  );
}
