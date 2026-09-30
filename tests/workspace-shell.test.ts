import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { legalCopy } from "@/components/ydeck/data/legalPages";
import { web3TemplateSlides } from "@/components/ydeck/data/templates";
import { localeContent } from "@/components/ydeck/i18n/localeContent";
import { formatMiniSlideAlt } from "@/components/ydeck/utils/formatters";
import { translations } from "@/lib/i18n";
import { detectDesktopPlatform } from "@/src/lib/desktop-platform";

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

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

test("primary navigation only links to routes that exist", async () => {
  const nav = await readFile(new URL("../components/console/ConsoleNav.tsx", import.meta.url), "utf8");
  const routed = [...nav.matchAll(/href:\s*"([^"]+)"/g)].map((match) => match[1]);

  // Every href in the primary nav must resolve to a real app route.
  assert.ok(routed.length > 0, "expected the primary nav to declare routes");
  for (const href of routed) {
    const segment = href.split("/").filter(Boolean)[0];
    await readFile(new URL(`../app/${segment}/page.tsx`, import.meta.url), "utf8");
  }

  // Unbuilt destinations must be inert and labelled, never links.
  assert.match(nav, /console-nav__link--soon/);
  assert.match(nav, /aria-disabled="true"/);
  assert.doesNotMatch(nav, /href:\s*"\/knowledge"/);
  assert.doesNotMatch(nav, /href:\s*"\/activity"/);

  // Settings belongs to the account menu, not the product nav.
  assert.doesNotMatch(nav, /href:\s*"\/settings/);
});

test("agent catalogue never presents unbuilt agents as usable", async () => {
  const agents = await readFile(new URL("../src/lib/agents.ts", import.meta.url), "utf8");
  const blocks = agents.split(/\{\s*\n\s*id:/).slice(1);

  assert.ok(blocks.length >= 4, "expected several agents in the catalogue");
  for (const block of blocks) {
    if (/availability:\s*"coming_soon"/.test(block)) {
      // A coming-soon agent must not carry a destination.
      assert.doesNotMatch(block, /href:/);
    }
  }
});

test("settings shell avoids duplicate product navigation", async () => {
  const settingsUi = await readFile(new URL("../components/account/ui.tsx", import.meta.url), "utf8");
  // Settings mounts no top bar of its own; it inherits the one ConsoleShell owns.
  assert.match(settingsUi, /ConsoleShell/);
  assert.doesNotMatch(settingsUi, /<ProductTopBar \/>/);
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
  assert.match(account, /searchParams\.get\("action"\) !== "delete-account"/);
  assert.match(account, /setDeleteDialogOpen\(true\)/);
  assert.match(account, /securityStatus !== "ready" \|\|/);
  assert.match(account, /security\.passwordConfigured && !currentPassword/);
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

test("authenticated workspace keeps the account bar without side navigation", async () => {
  const portal = await readFile(new URL("../components/workspace/DesktopPortalHome.tsx", import.meta.url), "utf8");
  const portalComponents = await readFile(new URL("../components/workspace/DesktopPortalComponents.tsx", import.meta.url), "utf8");
  const workspace = await readFile(new URL("../components/workspace/ProductWorkspace.tsx", import.meta.url), "utf8");
  const workspaceRoute = await readFile(new URL("../app/workspace/page.tsx", import.meta.url), "utf8");
  const topBar = await readFile(new URL("../components/workspace/ProductTopBar.tsx", import.meta.url), "utf8");
  assert.match(workspaceRoute, /ProductWorkspace/);
  // The workspace renders inside the shared shell but passes no sidebar: the
  // Desktop portal stays chrome-light. Global nav lives in the shell top bar.
  assert.match(workspace, /ConsoleShell/);
  assert.doesNotMatch(workspace, /ProductRail|AppNavigationDrawer|sidebar=/);
  // The avatar menu is account-scoped. Product destinations belong to
  // ConsoleNav and the section sidebars, not to a second navigation system.
  assert.match(topBar, /ConsoleNav/);
  assert.match(topBar, /Profile/);
  assert.match(topBar, /Upgrade plan/);
  assert.match(topBar, /settings\/billing/);
  assert.match(topBar, /Sign out/);
  // Settings is reachable from the account menu so it does not compete with
  // the product nav, but its individual pages are not relisted here.
  assert.match(topBar, /settings\/account/);
  assert.doesNotMatch(topBar, /settings\/security/);
  assert.doesNotMatch(topBar, /settings\/devices/);
  assert.doesNotMatch(topBar, /Sales Operator channels/);
  assert.doesNotMatch(topBar, /Language|Appearance/);
  assert.match(portalComponents, /Manage devices/);
  assert.match(portalComponents, /Billing and plan/);
});

test("main workspace leads with workspace state, not the Desktop product", async () => {
  const portal = await readFile(new URL("../components/workspace/DesktopPortalHome.tsx", import.meta.url), "utf8");
  const portalComponents = await readFile(new URL("../components/workspace/DesktopPortalComponents.tsx", import.meta.url), "utf8");
  const workspace = await readFile(new URL("../components/workspace/ProductWorkspace.tsx", import.meta.url), "utf8");
  const portalRoute = await readFile(new URL("../app/desktop-portal/page.tsx", import.meta.url), "utf8");
  const portalSource = `${portal}\n${portalComponents}`;

  // Home is the workspace dashboard; the Desktop product moved to its own route.
  assert.match(workspace, /WorkspaceDashboard/);
  assert.doesNotMatch(workspace, /DesktopPortalHome/);
  assert.match(portalRoute, /DesktopPortalHome/);

  // Desktop capabilities must survive the move intact.
  assert.match(portalSource, /YDeck Desktop Beta/);
  assert.match(portalSource, /Download for macOS/);
  assert.match(portalSource, /Download for Windows/);

  assert.doesNotMatch(workspace, /GenerationComposer|TemplateDirectionCarousel|RecentPresentations/);
  assert.doesNotMatch(portalSource, /Cloud Mode|Create a presentation|Recent presentations|Starting prompts/);
});

test("workspace dashboard reports real state and never invents activity", async () => {
  const dashboard = await readFile(new URL("../components/workspace/WorkspaceDashboard.tsx", import.meta.url), "utf8");
  const attention = await readFile(new URL("../src/lib/workspace-attention.ts", import.meta.url), "utf8");

  // Figures come from providers, not literals.
  assert.match(dashboard, /useSalesOperatorChannels/);
  assert.match(dashboard, /useDevices/);
  assert.match(dashboard, /useBilling/);

  // No activity endpoint exists, so the section must be an empty state.
  assert.match(dashboard, /EmptyState/);
  assert.doesNotMatch(dashboard, /\b\d{2,}\s*(runs|conversations|tokens|messages)\b/i);
  assert.doesNotMatch(dashboard, /1\.8M|142 runs/);

  // Routine setup must not be dressed up as a fault.
  assert.match(attention, /tone: "info"/);
  assert.doesNotMatch(attention, /could not be completed safely/);
});

test("root route renders the public landing instead of the protected workspace", async () => {
  const home = await readFile(new URL("../components/HomePageClient.tsx", import.meta.url), "utf8");
  const rootPage = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const authReturn = await readFile(new URL("../src/lib/auth-return.ts", import.meta.url), "utf8");

  assert.match(rootPage, /HomePageClient/);
  assert.match(rootPage, /detectServerLocale/);
  assert.match(rootPage, /searchParams/);
  assert.match(home, /YDeckPage/);
  assert.doesNotMatch(home, /initialLocale="en"/);
  assert.doesNotMatch(home, /ProductWorkspace/);
  assert.match(authReturn, /DEFAULT_AUTH_RETURN_TO = "\/workspace"/);
});

test("public landing navigation exposes authentication and the working Sales Operator entry point", async () => {
  const landing = await readFile(
    new URL("../components/ydeck/YDeckPage.tsx", import.meta.url),
    "utf8",
  );

  assert.match(landing, /href="\/auth\/sign-in"/);
  assert.match(landing, /href="\/sales-operator\/channels"/);
  assert.match(landing, /tryYDeck: "Try YDeck"/);
  assert.match(landing, /primary: "Try Sales Agent"/);
});

test("waitlist intake stays focused and fixes the initial locale before hydration", async () => {
  const waitlistPage = await readFile(new URL("../app/waitlist/page.tsx", import.meta.url), "utf8");
  const waitlistClient = await readFile(new URL("../components/WaitlistPageClient.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(waitlistPage, /document\.documentElement\.lang/);
  assert.doesNotMatch(waitlistClient, /Back to landing|back-link|waitlistPage\.back/);
  assert.match(styles, /@media \(min-width: 1121px\)[\s\S]*\.waitlist-page \{[\s\S]*overflow: hidden;/);
  assert.match(styles, /\.dedicated \{[\s\S]*overflow: auto;/);
});

test("Uzbek landing, waitlist, and legal copy avoid old English fallback phrases", () => {
  const uzbekCopy = collectStrings([
    localeContent.uz,
    translations.uz,
    legalCopy.uz,
  ]).join("\n");
  const forbiddenPhrases = [
    "Reporting Skills",
    "Use cases",
    "Pilot workflow",
    "Approved report packs",
    "Mining Monthly Operations Review",
    "Previous Ops Reports",
    "Production Export",
    "Downtime + Safety",
    "Corporate Template",
    "Structure detected",
    "KPI mapping",
    "Input check",
    "Draft reporting skill",
    "Human review required",
    "Human review kerak",
    "Draft skill tayyor",
    "PPTX output beta",
    "PDF planned",
    "Reporting Audit so‘rash",
    "recurring reporting process",
    "source materials",
    "Reporting workflow review",
    "Draft skill assessment",
    "recurring report workflow",
    "Reporting frequency",
    "dostup",
    "public launch",
    "generated reporting draft",
    "sensitive source materials supported",
  ];

  for (const phrase of forbiddenPhrases) {
    assert.doesNotMatch(uzbekCopy, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.equal(localeContent.uz.nav.links[2][0], "Hisobot skill’lari");
  assert.equal(localeContent.uz.nav.links[3][0], "Qo‘llanish sohalari");
  assert.equal(localeContent.uz.hero.title, "Takroriy hisobotlarni kompaniyangizning ishchi xotirasiga aylantiring.");
  assert.equal(localeContent.uz.agent.status, "Design partner piloti");
  assert.equal(translations.uz.waitlistForm.submit, "Hisobot auditini so‘rash");
  assert.equal(legalCopy.uz.pages.terms.title, "Pilotga kirish shartlari.");
});

test("Russian landing, waitlist, metadata, and legal copy avoid mixed English fallback phrases", async () => {
  const rootPage = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const russianMetadataSource = rootPage.match(/ru: \{[\s\S]*?\n  \},\n  uz:/)?.[0] ?? "";
  const russianCopy = collectStrings([
    localeContent.ru,
    translations.ru,
    legalCopy.ru,
  ]).join("\n");
  const forbiddenPhrases = [
    "Приватный AI",
    "приватный AI",
    "Reporting Skills",
    "Пилотный workflow",
    "пилотных workflow",
    "Approved report packs",
    "Mining Monthly Operations Review",
    "Previous Ops Reports",
    "Production Export",
    "Downtime + Safety",
    "Corporate Template",
    "KPI mapping",
    "Draft reporting skill",
    "Draft skill готов",
    "PPTX output beta",
    "PDF planned",
    "review перед повтором",
    "Source checks",
    "одному prompt",
    "Риски review",
    "company reporting skill",
    "report packs",
    "company skill",
    "generic no-code",
    "human review",
    "Review draft skill",
    "narrative patterns",
    "planned PDF",
    "human approval",
    "mining, industrial reporting, accounting",
    "Пилотный workflow",
    "Discovery workflow",
    "bottlenecks",
    "safety summaries",
    "incident follow-up",
    "corrective actions",
    "cash flow",
    "budget-versus-actual",
    "source-backed commentary",
    "executive reporting packs",
    "Private execution",
    "human control",
    "Desktop beta foundation",
    "private/local generation",
    "BYOK-style",
    "Reporting runtime",
    "source mapping",
    "PDF delivery",
    "source materials",
    "Verification direction",
    "Human control",
    "Long-term vision",
    "Report pack",
    "Source data",
    "Skill draft",
    "reporting workflows",
    "marketplace шаблонов",
    "design partners",
    "production skills",
    "Pilot example",
    "Inputs:",
    "Outputs:",
    "Mining pilot",
    "Industrial workflow",
    "Finance pilot",
    "Executive reporting",
    "Accounting workflow",
    "recurring reporting workflows",
    "review draft reporting skill",
    "monthly operations reports",
    "Excel exports",
    "1C data",
    "manager comments",
    "PowerPoint template",
    "company method",
    "reviewed output",
    "pilot intake",
    "monthly reports",
    "source files",
    "KPI definitions",
    "reviewed reporting skill",
    "AI reporting product",
    "reusable reporting skills",
    "planned direction",
    "PDF reports",
    "editable beta output",
    "planned report engine",
    "approval required",
    "Trust Model",
    "Mining operations",
    "Accounting firms",
    "Enterprise finance",
    "Design partner pilot",
    "evidence, consistency",
    "reporting drafts",
    "reusable skills",
    "Editable PPTX",
    "reporting audit",
    "recurring report workflow",
    "generated reporting draft",
    "private reporting pilots",
    "reporting workflows",
    "certification claims",
    "report packs",
  ];

  for (const phrase of forbiddenPhrases) {
    assert.doesNotMatch(russianCopy, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.equal(localeContent.ru.nav.links[2][0], "Отчетные навыки");
  assert.equal(localeContent.ru.nav.join, "Пилот");
  assert.equal(localeContent.ru.hero.title, "Превратите повторяющиеся отчеты в рабочую память компании.");
  assert.equal(localeContent.ru.agent.status, "Пилот с дизайн-партнером");
  assert.equal(translations.ru.waitlistForm.fields.presentationType, "Регулярный отчетный процесс");
  assert.equal(legalCopy.ru.pages.terms.title, "Условия пилотного доступа.");
  assert.doesNotMatch(formatMiniSlideAlt(web3TemplateSlides[0], "ru"), /reporting workflow/);
  assert.match(russianMetadataSource, /YDeck — рабочее пространство ИИ-агентов/);
  assert.doesNotMatch(russianMetadataSource, /приватный AI/);
  assert.doesNotMatch(russianMetadataSource, /report packs, исходные данные/);
  assert.doesNotMatch(russianMetadataSource, /reporting skills/);
});
