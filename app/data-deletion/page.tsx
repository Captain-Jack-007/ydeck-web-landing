import type { Metadata } from 'next';

import {
  LegalContactDetails,
  LegalDocument,
  LegalSection,
} from '@/components/ydeck/LegalDocument';
import { legalCompany, type LegalSectionLink } from '@/components/ydeck/data/legal';

export const metadata: Metadata = {
  title: 'User Data Deletion | YDeck',
  description: 'Instructions for requesting deletion of data associated with YDeck.',
  alternates: {
    canonical: '/data-deletion',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'User Data Deletion | YDeck',
    description: 'Instructions for requesting deletion of data associated with YDeck.',
    url: '/data-deletion',
    type: 'website',
  },
};

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'disconnect', label: 'Option 1: Disconnect Instagram' },
  { id: 'revoke', label: 'Option 2: Revoke Meta Authorization' },
  { id: 'request', label: 'Option 3: Request Deletion' },
  { id: 'account-deletion', label: 'Delete a YDeck Account' },
  { id: 'what-happens', label: 'What Happens Next' },
  { id: 'contact', label: 'Contact' },
] as const satisfies readonly LegalSectionLink[];

export default function DataDeletionPage() {
  return (
    <LegalDocument
      activePath="/data-deletion"
      description="How to disconnect Instagram and request deletion of data associated with YDeck."
      sections={sections}
      title="User Data Deletion"
    >
      <LegalSection id="overview" title="Overview">
        <p>
          YDeck is operated by GLOBANCE GROUP LIMITED (&quot;Globance&quot;, &quot;YDeck&quot;, &quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;). This page explains how a user or authorized business
          representative can disconnect an Instagram integration, revoke Meta authorization, or
          request deletion of information associated with YDeck.
        </p>
        <p>
          You may use any of the options below. Disconnecting or revoking an integration stops future
          access through that authorization, subject to Meta's platform behavior. A separate deletion
          request can be used when you also want previously processed integration data reviewed for
          deletion.
        </p>
      </LegalSection>

      <LegalSection id="disconnect" title="Option 1: Disconnect Instagram">
        <p>
          You may disconnect the integration from the applicable YDeck integration or channel
          settings when this functionality is available. Disconnecting prevents YDeck from using the
          revoked authorization to retrieve new Instagram data, subject to Meta's platform behavior.
        </p>
        <p>
          Because integration controls may vary by account, deployment, and product release, this
          page does not provide a navigation path that may be unavailable or become outdated. If you
          cannot find a disconnect control, use Option 2 or Option 3 below.
        </p>
      </LegalSection>

      <LegalSection id="revoke" title="Option 2: Revoke Meta Authorization">
        <p>
          You can remove or revoke YDeck's access through the settings made available by Meta or
          Instagram for connected apps and business integrations. Meta controls the location and
          operation of those settings, so the available labels and navigation may change.
        </p>
        <p>
          Revoking authorization prevents future access through the revoked Meta authorization,
          subject to Meta's platform behavior. It does not by itself guarantee immediate deletion of
          information already processed by YDeck. Use Option 3 to request deletion of that data.
        </p>
      </LegalSection>

      <LegalSection id="request" title="Option 3: Request Deletion">
        <p>
          Send an email to <a href={`mailto:${legalCompany.email}`}>{legalCompany.email}</a> with the
          subject <strong>YDeck Data Deletion Request</strong>.
        </p>
        <p>Include enough information for us to identify the relevant account and data, such as:</p>
        <ul>
          <li>the email address associated with the YDeck account;</li>
          <li>the organization or workspace name, if applicable;</li>
          <li>the connected Instagram Professional account name or identifier, if known; and</li>
          <li>whether you want integration data, the YDeck account, or both reviewed for deletion.</li>
        </ul>
        <p>
          <strong>
            Do not email your password, API keys, access tokens, verification codes, or other secrets.
          </strong>{' '}
          We may ask for additional non-secret information to verify your identity or authority over
          the relevant business account.
        </p>
      </LegalSection>

      <LegalSection id="account-deletion" title="Delete a YDeck Account">
        <p>
          Signed-in users may also request deletion of their personal YDeck account through the
          account and data controls available in YDeck. To begin, use the{' '}
          <a href="/settings/account?action=delete-account">Delete your YDeck account</a> link. To
          protect against accidental or unauthorized deletion, the confirmation dialog requires the
          user to type <strong>DELETE</strong> and, when a password is configured for the account,
          enter the current password.
        </p>
        <p>
          Workspace ownership or an active subscription may need to be resolved before account
          deletion can be completed. Shared workspace content owned by other members may remain with
          that workspace. Email us if you need help identifying the correct deletion path.
        </p>
      </LegalSection>

      <LegalSection id="what-happens" title="What Happens Next">
        <p>
          We will review and process valid deletion requests in accordance with applicable law. We
          may first verify the requester's identity, authority, and the data associated with the
          request. Where deletion applies, we will remove or de-identify the relevant information
          from active systems as reasonably appropriate.
        </p>
        <p>
          Limited information may remain temporarily in backups, security logs, fraud-prevention
          records, or records required for legal obligations, dispute resolution, and enforcement.
          Such retained information will not be used for unrelated purposes and will be handled in
          accordance with our <a href="/privacy">Privacy Policy</a>.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>Data deletion requests and questions may be sent to:</p>
        <LegalContactDetails />
      </LegalSection>
    </LegalDocument>
  );
}
