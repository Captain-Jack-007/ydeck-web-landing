export type AuthenticationMethod =
  | "google_oauth"
  | "email_password"
  | "email_code";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
    retryable?: boolean;
  };
};

export type CurrentUser = {
  id: string;
  primaryEmail: string;
  displayName?: string;
  avatarUrl?: string | null;
  status: "pending_verification" | "active" | "suspended" | "restricted" | "deleted";
  emailVerified: boolean;
  authenticationMethods: AuthenticationMethod[];
  createdAt: string;
};

export type WebAuthenticationResponse = {
  user: CurrentUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  sessionId: string;
  clientType: "web";
};

export type EmailChallengeResponse = {
  challengeId: string;
  expiresAt: string;
  resendAfterSeconds: number;
};

export type RegistrationChallengeResponse = EmailChallengeResponse & {
  status: "verification_required";
};

export type PasswordResetChallengeResponse = EmailChallengeResponse & {
  status: "accepted";
};

export type EmailChallengePurpose =
  | "register"
  | "login"
  | "verify_email"
  | "reset_password"
  | "change_email";

export type SafeUserProfile = {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  preferredLanguage: "en" | "ru" | "uz-Latn" | "uz-Cyrl" | "zh" | string;
  timeZone: string | null;
  locale: string | null;
  accountStatus: "active" | "suspended" | "restricted" | "deletion_pending" | "deleted" | string;
  deletionRequestedAt: string | null;
  deletionScheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountSecuritySummary = {
  emailVerified?: boolean;
  authenticationMethods?: AuthenticationMethod[];
  passwordConfigured?: boolean;
  activeSessionCount?: number;
  desktopDeviceCount?: number;
  passwordChangedAt?: string | null;
  emailChangedAt?: string | null;
  deletionRequestedAt?: string | null;
  deletionScheduledFor?: string | null;
  accountStatus?: string;
  [key: string]: unknown;
};

export type AccountSession = {
  id: string;
  current?: boolean;
  clientType?: "web" | "desktop" | "mobile" | string;
  deviceName?: string | null;
  platform?: string | null;
  browser?: string | null;
  location?: string | null;
  createdAt?: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  [key: string]: unknown;
};

export type WorkspacePermission = string;

export type Workspace = {
  id: string;
  name: string;
  slug?: string | null;
  type?: "personal" | "organization" | string;
  status?: "active" | "suspended" | "archived" | string;
  role?: string;
  permissions?: WorkspacePermission[];
  isCurrent?: boolean;
  [key: string]: unknown;
};

export type WorkspaceMembership = {
  id?: string;
  role: "owner" | "admin" | "member" | "viewer" | string;
  status?: string;
  permissions?: WorkspacePermission[];
  [key: string]: unknown;
};

export type WorkspaceMember = {
  id?: string;
  userId?: string;
  displayName?: string | null;
  email?: string | null;
  role?: string;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
};

export type WorkspaceCurrentResponse = {
  workspace: Workspace;
  membership: WorkspaceMembership;
  permissions: WorkspacePermission[];
};

export type PlanOffer = {
  billingInterval: "monthly" | "annual" | "custom" | string;
  amountMinor: number;
  currency: string;
  label?: string | null;
  [key: string]: unknown;
};

export type PublicPlan = {
  key: string;
  name?: string;
  planName?: string;
  label?: string | null;
  purchaseMode: "free" | "self_service" | "contact_sales" | string;
  versionId?: string;
  offers?: PlanOffer[];
  entitlements?: EntitlementSummary;
  [key: string]: unknown;
};

export type SubscriptionStatus =
  | "free"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "active"
  | "past_due"
  | "unpaid"
  | "paused"
  | "cancelled"
  | "expired"
  | string;

export type SubscriptionSummary = {
  planKey: string;
  planVersionId?: string | null;
  planName?: string | null;
  billingInterval?: "monthly" | "annual" | "custom" | string | null;
  status: SubscriptionStatus;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancellationEffectiveAt?: string | null;
  providerManaged?: boolean;
  [key: string]: unknown;
};

export type PaymentSummary = {
  status?: "ok" | "failed" | "action_required" | "none" | string;
  currency?: string | null;
  amountDueMinor?: number | null;
  nextPaymentAt?: string | null;
  [key: string]: unknown;
};

export type EntitlementSummary = {
  booleans?: Record<string, boolean>;
  limits?: Record<string, number | null>;
  values?: Record<string, string | null>;
  resolvedAt?: string;
  expiresAt?: string | null;
  [key: string]: unknown;
};

export type UsageSummary = {
  metric: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  periodStart?: string;
  periodEnd?: string;
};

export type BillingActions = {
  canCheckout?: boolean;
  canUpgrade?: boolean;
  canDowngrade?: boolean;
  canCancel?: boolean;
  canReactivate?: boolean;
  canOpenPortal?: boolean;
  [key: string]: unknown;
};

export type WorkspaceBillingSummary = {
  workspaceId?: string;
  canManageBilling?: boolean;
  availableActions: BillingActions;
  subscription: SubscriptionSummary;
  payment?: PaymentSummary | null;
  entitlements?: EntitlementSummary | null;
  usage?: UsageSummary[];
  [key: string]: unknown;
};

export type PublicInvoice = {
  id: string;
  number?: string | null;
  status?: string;
  amountPaidMinor?: number | null;
  amountDueMinor?: number | null;
  currency?: string | null;
  createdAt?: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  [key: string]: unknown;
};

export type Page<T> = {
  items: T[];
  page: number;
  limit: number;
  total?: number;
  hasNextPage?: boolean;
};

export type AccountDesktopDevice = {
  id: string;
  publicId?: string | null;
  name?: string | null;
  platform?: "macos" | "windows" | "linux" | "unknown" | string;
  architecture?: "arm64" | "x64" | "unknown" | string;
  appVersion?: string | null;
  appBuild?: string | null;
  releaseChannel?: "stable" | "beta" | "alpha" | "nightly" | "internal" | string;
  status?: "pending" | "active" | "revoked" | "blocked" | "disabled" | string;
  trustLevel?: "standard" | "review_required" | "blocked" | string;
  current?: boolean;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  approvedAt?: string | null;
  revokedAt?: string | null;
  revokeReason?: string | null;
  [key: string]: unknown;
};

export type PairingApprovalResponse = {
  status: "approved";
  device: {
    name?: string;
    platform: "macos" | "windows" | "linux" | "unknown";
    architecture: "arm64" | "x64" | "unknown";
    appVersion: string;
    appBuild?: string;
    releaseChannel: "stable" | "beta" | "alpha" | "nightly" | "internal";
  };
};

export type PairingDenialResponse = {
  status: "denied";
};
