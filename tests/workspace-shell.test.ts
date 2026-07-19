import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { detectDesktopPlatform } from "@/src/lib/desktop-platform";

test("desktop platform detection never guesses architecture", () => {
  assert.equal(detectDesktopPlatform("MacIntel"), "macos");
  assert.equal(detectDesktopPlatform("Win32"), "windows");
  assert.equal(detectDesktopPlatform("Linux x86_64"), "unknown");
  assert.equal(detectDesktopPlatform(null), "unknown");
});

test("verified users and signed-in users enter the authenticated workspace", async () => {
  const signIn = await readFile(new URL("../app/auth/sign-in/sign-in-client.tsx", import.meta.url), "utf8");
  const verification = await readFile(new URL("../app/auth/verify-email/verify-email-client.tsx", import.meta.url), "utf8");
  assert.match(signIn, /loginWithPassword/);
  assert.match(signIn, /safeAuthReturnTo/);
  assert.match(signIn, /router\.push\(returnTo\)/);
  assert.doesNotMatch(signIn, /requestEmailCode|verifyEmailCode|Send code|Email code|challengeId/);
  assert.match(verification, /router\.push\(query\.returnTo\)/);
});

test("authentication submissions expose visible in-progress labels", async () => {
  const authFiles = [
    "../app/auth/sign-in/sign-in-client.tsx",
    "../app/auth/sign-up/sign-up-client.tsx",
    "../app/auth/verify-email/verify-email-client.tsx",
    "../app/auth/resend-verification/resend-verification-client.tsx",
    "../app/auth/forgot-password/page.tsx",
    "../app/auth/reset-password/reset-password-client.tsx",
  ];
  const authSources = await Promise.all(authFiles.map((file) => readFile(new URL(file, import.meta.url), "utf8")));
  const source = authSources.join("\n");
  assert.match(source, /loadingLabel=/);
  assert.match(source, /Signing in…/);
  assert.match(source, /Creating account…/);
  assert.match(source, /Confirming code…/);
  assert.match(source, /Sending code…/);
  assert.match(source, /Sending reset code…/);
  assert.match(source, /Updating password…/);
});

test("Desktop portal fails closed without hardcoded release data", async () => {
  const portal = await readFile(new URL("../components/workspace/DesktopPortalHome.tsx", import.meta.url), "utf8");
  const components = await readFile(new URL("../components/workspace/DesktopPortalComponents.tsx", import.meta.url), "utf8");
  assert.equal(/https?:\/\//.test(portal), false);
  assert.match(portal, /ReleaseStatusMessage platform="macOS"/);
  assert.match(portal, /ReleaseStatusMessage platform="Windows"/);
  assert.match(components, /disabled aria-disabled="true"/);
  assert.match(components, /Explore the workflow/);
  assert.doesNotMatch(`${portal}\n${components}`, /Coming soon|placeholder|fake/i);
});

test("Desktop pairing UI preserves the browser-only security boundary", async () => {
  const pairing = await readFile(new URL("../app/desktop/pairing/pairing-client.tsx", import.meta.url), "utf8");
  const devices = await readFile(new URL("../app/settings/devices/page.tsx", import.meta.url), "utf8");
  const provider = await readFile(new URL("../src/providers/device-provider.tsx", import.meta.url), "utf8");

  assert.match(pairing, /Switch account/);
  assert.match(pairing, /Sign in to connect YDeck Desktop/);
  assert.match(pairing, /Sign in/);
  assert.match(pairing, /Sign up/);
  assert.match(pairing, /Browser session could not be restored/);
  assert.match(pairing, /Retry session/);
  assert.match(pairing, /Allow this Desktop app to connect to your YDeck account\?/);
  assert.match(pairing, />\s*Allow\s*</);
  assert.match(pairing, />\s*Deny\s*</);
  assert.match(pairing, /You can return to YDeck Desktop\./);
  assert.match(pairing, /Pairing was denied\. You can close this tab\./);
  assert.match(pairing, /router\.replace\("\/desktop\/pairing"\)/);
  assert.doesNotMatch(pairing, /pairingSecret|refreshToken|accessToken|postMessage|localStorage|pairing\/status/);
  assert.match(devices, /Type REVOKE to continue/);
  assert.match(devices, /Local presentation files will not be deleted/);
  assert.match(devices, /revokeReason/);
  assert.doesNotMatch(provider, /setPairingDecision\(\{ status: "approved", response \}\);\s*await refreshDevices/);
});

test("auth bootstrap limits refresh attempts without an access token", async () => {
  const provider = await readFile(new URL("../src/providers/auth-provider.tsx", import.meta.url), "utf8");
  const client = await readFile(new URL("../src/api/client.ts", import.meta.url), "utf8");

  assert.match(provider, /bootstrapSessionAttemptedWithoutToken/);
  assert.match(provider, /bootstrapSessionPromise/);
  assert.match(provider, /hasWebRefreshSessionHint/);
  assert.match(client, /includedAccessToken &&/);
  assert.doesNotMatch(client, /refreshWebAccessToken\(\);[\s\S]*Boolean\(token\)/);
});

test("settings shell avoids duplicate product navigation", async () => {
  const settingsUi = await readFile(new URL("../components/account/ui.tsx", import.meta.url), "utf8");
  assert.match(settingsUi, /<ProductTopBar \/>/);
  assert.doesNotMatch(settingsUi, /Account Center|YDeck account controls|Back to YDeck|settings-back-link/);
  assert.doesNotMatch(settingsUi, /className="settings-account"/);
  assert.doesNotMatch(settingsUi, /No workspace available/);
  assert.match(settingsUi, /WorkspaceSwitcher/);
  assert.match(settingsUi, /href: "\/settings\/access"/);
  assert.doesNotMatch(settingsUi, /<select[^>]*value=\{workspace\?\.id/);
});

test("settings pages present product language instead of raw backend data", async () => {
  const account = await readFile(new URL("../app/settings/account/page.tsx", import.meta.url), "utf8");
  const access = await readFile(new URL("../app/settings/access/page.tsx", import.meta.url), "utf8");
  const billing = await readFile(new URL("../app/settings/billing/page.tsx", import.meta.url), "utf8");
  const devices = await readFile(new URL("../app/settings/devices/page.tsx", import.meta.url), "utf8");
  const security = await readFile(new URL("../app/settings/security/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/settings/layout.tsx", import.meta.url), "utf8");

  assert.match(access, /permission-disclosure/);
  assert.doesNotMatch(access, /permissions\.join\(", "\)/);
  assert.doesNotMatch(account, /permission-disclosure/);
  assert.match(billing, /formatMetric\(item\.metric\)/);
  assert.match(devices, /Approve and return/);
  assert.doesNotMatch(devices, /<span>4<\/span>|<span>5<\/span>/);
  assert.match(security, /security-posture/);
  assert.match(security, /visibleSessions/);
  assert.doesNotMatch(security, /<StatusSummary>|Show password fields/);
  assert.match(layout, /settings-production\.css/);
});

test("workspace bootstrap trusts the backend current workspace", async () => {
  const provider = await readFile(new URL("../src/providers/workspace-provider.tsx", import.meta.url), "utf8");
  const api = await readFile(new URL("../src/api/workspace/index.ts", import.meta.url), "utf8");
  const devices = await readFile(new URL("../src/providers/device-provider.tsx", import.meta.url), "utf8");

  assert.ok(provider.indexOf("getAuthoritativeCurrentWorkspace") < provider.indexOf("listWorkspaces()"));
  assert.match(provider, /attempt < 2/);
  assert.match(provider, /mergeAuthoritativeWorkspace/);
  assert.doesNotMatch(provider, /list\.length === 0[\s\S]*setStatus\("empty"\)/);
  assert.match(api, /Array\.isArray|normalizeWorkspaceList/);
  assert.match(devices, /Promise\.allSettled\(\[refreshAccount\(\), refreshWorkspace\(\)\]\)/);
  assert.doesNotMatch(provider, /No workspace selected/);
});

test("profile failures use one contained recovery surface", async () => {
  const profile = await readFile(new URL("../app/settings/profile/page.tsx", import.meta.url), "utf8");
  const settingsUi = await readFile(new URL("../components/account/ui.tsx", import.meta.url), "utf8");
  assert.match(profile, /<RecoveryState/);
  assert.doesNotMatch(profile, /Approved avatar URL|Avatar source/);
  assert.doesNotMatch(profile, /avatarUrl:/);
  assert.doesNotMatch(profile, /Regional preferences|preferredLanguage|timeZone|localePreview/);
  assert.match(settingsUi, /settings-recovery__message/);
  assert.match(settingsUi, /<ErrorDetails/);
  assert.doesNotMatch(profile, /<Panel title="Profile unavailable"/);
});

test("Account Center data sources fail independently", async () => {
  const accountProvider = await readFile(new URL("../src/providers/account-provider.tsx", import.meta.url), "utf8");
  const billingProvider = await readFile(new URL("../src/providers/billing-provider.tsx", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/settings/profile/page.tsx", import.meta.url), "utf8");
  const security = await readFile(new URL("../app/settings/security/page.tsx", import.meta.url), "utf8");
  const plans = await readFile(new URL("../app/settings/plans/page.tsx", import.meta.url), "utf8");

  assert.match(accountProvider, /Promise\.allSettled/);
  assert.match(accountProvider, /setProfileStatus\("error"\)/);
  assert.match(accountProvider, /setSecurityStatus\("error"\)/);
  assert.match(accountProvider, /setSessionsStatus\("error"\)/);
  assert.match(profile, /profileStatus === "error"/);
  assert.match(security, /sessionsStatus === "error"/);

  assert.match(billingProvider, /plansStatus/);
  assert.match(billingProvider, /summaryStatus/);
  assert.match(billingProvider, /Promise\.allSettled\(\[refreshPlans\(\), refreshSummary\(\)\]\)/);
  assert.match(plans, /plansStatus === "error"/);
  assert.match(plans, /summaryStatus === "error"/);
});

test("Desktop pairing and session revocation require deliberate actions", async () => {
  const devices = await readFile(new URL("../app/settings/devices/page.tsx", import.meta.url), "utf8");
  const security = await readFile(new URL("../app/settings/security/page.tsx", import.meta.url), "utf8");
  const accountApi = await readFile(new URL("../src/api/account/index.ts", import.meta.url), "utf8");

  assert.match(devices, /const \[pairingOpen, setPairingOpen\] = useState\(false\)/);
  assert.match(devices, /Enter pairing code/);
  assert.match(devices, /pairingOpen \? <form/);
  assert.match(devices, /Revoked: \$\{device\.revokeReason/);

  assert.match(security, /Revoke other sessions/);
  assert.match(security, /This session remains active/);
  assert.match(accountApi, /\/sessions\/revoke-others/);
});

test("authenticated home keeps the account bar without side navigation", async () => {
  const portal = await readFile(new URL("../components/workspace/DesktopPortalHome.tsx", import.meta.url), "utf8");
  const portalComponents = await readFile(new URL("../components/workspace/DesktopPortalComponents.tsx", import.meta.url), "utf8");
  const workspace = await readFile(new URL("../components/workspace/ProductWorkspace.tsx", import.meta.url), "utf8");
  const topBar = await readFile(new URL("../components/workspace/ProductTopBar.tsx", import.meta.url), "utf8");
  assert.match(workspace, /ProductTopBar/);
  assert.doesNotMatch(workspace, /ProductRail|AppNavigationDrawer/);
  assert.match(topBar, /Profile/);
  assert.match(topBar, /Upgrade plan/);
  assert.match(topBar, /settings\/security/);
  assert.match(topBar, /settings\/devices/);
  assert.match(topBar, /settings\/billing/);
  assert.match(topBar, /settings\/account/);
  assert.match(topBar, /Sign out/);
  assert.doesNotMatch(topBar, /Language|Appearance/);
  assert.match(portalComponents, /Manage devices/);
  assert.match(portalComponents, /Billing and plan/);
});

test("main workspace is Desktop-first and contains no inactive Cloud controls", async () => {
  const portal = await readFile(new URL("../components/workspace/DesktopPortalHome.tsx", import.meta.url), "utf8");
  const portalComponents = await readFile(new URL("../components/workspace/DesktopPortalComponents.tsx", import.meta.url), "utf8");
  const workspace = await readFile(new URL("../components/workspace/ProductWorkspace.tsx", import.meta.url), "utf8");
  const portalSource = `${portal}\n${portalComponents}`;
  assert.match(workspace, /DesktopPortalHome/);
  assert.match(portalSource, /YDeck Desktop Beta/);
  assert.match(portalSource, /Download for macOS/);
  assert.match(portalSource, /Download for Windows/);
  assert.doesNotMatch(workspace, /GenerationComposer|TemplateDirectionCarousel|RecentPresentations/);
  assert.doesNotMatch(portalSource, /Cloud Mode|Create a presentation|Recent presentations|Starting prompts/);
});

test("public landing navigation exposes the waitlist without advertising authentication", async () => {
  const navbar = await readFile(
    new URL("../components/ydeck/components/Navbar.tsx", import.meta.url),
    "utf8",
  );

  assert.match(navbar, /localizedPath\('\/waitlist', locale\)/);
  assert.doesNotMatch(navbar, /localizedPath\('\/auth\/sign-(?:in|up)', locale\)/);
  assert.match(
    navbar,
    /className="inline-flex[^\"]*"\s+href=\{localizedPath\('\/waitlist', locale\)\}/,
  );
});
