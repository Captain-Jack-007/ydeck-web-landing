import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function source(path: string) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("mobile waitlist validation keeps invalid required fields visible and focusable", async () => {
  const form = await source("../components/WaitlistForm.tsx");

  assert.match(form, /function validateRequiredFields\(form: HTMLFormElement\)/);
  assert.match(form, /setMobileStep\(1\);[\s\S]*invalidControl\.focus\(\);[\s\S]*invalidControl\.reportValidity\(\)/);
  assert.match(form, /function handleMobileContinue\(\)/);
  assert.match(form, /onClick=\{handleMobileContinue\}/);
  assert.match(form, /noValidate/);
  assert.match(form, /window\.matchMedia\("\(max-width: 760px\)"\)/);
  assert.doesNotMatch(form, /onClick=\{\(\) => setMobileStep\(2\)\}/);
});

test("final CTA decorations cannot intercept pointer input", async () => {
  const finalCta = await source("../components/ydeck/sections/FinalCTA.tsx");

  assert.match(finalCta, /noise-overlay pointer-events-none absolute inset-0/);
  assert.match(finalCta, /pointer-events-none absolute inset-0 bg-\[radial-gradient/);
  assert.match(finalCta, /relative z-10 mx-auto flex max-w-5xl/);
});

test("landing navigation exposes an accessible mobile disclosure", async () => {
  const page = await source("../components/ydeck/YDeckPage.tsx");

  assert.match(page, /Menu,/);
  assert.match(page, /X,/);
  assert.match(page, /aria-controls="agent-mobile-nav"/);
  assert.match(page, /aria-expanded=\{menuOpen\}/);
  assert.match(page, /id="agent-mobile-nav"/);
  assert.match(page, /event\.key !== "Escape"/);
  assert.match(page, /menuButtonRef\.current\?\.focus\(\)/);
  assert.match(page, /onClick=\{\(\) => setMenuOpen\(false\)\}/);
  assert.match(page, /openMenu: "Open navigation"/);
  assert.match(page, /openMenu: "Открыть навигацию"/);
  assert.match(page, /openMenu: "Navigatsiyani ochish"/);
});

test("landing navigation sends authenticated users to the console", async () => {
  const page = await source("../components/ydeck/YDeckPage.tsx");

  assert.match(page, /const \{ status: authStatus \} = useAuth\(\)/);
  assert.match(page, /authStatus === "authenticated"/);
  assert.match(page, /authStatus === "unauthenticated" \|\| authStatus === "error"/);
  assert.match(page, /href="\/workspace"/);
  assert.match(page, /goToConsole: "Go to console"/);
  assert.match(page, /goToConsole: "Перейти в консоль"/);
  assert.match(page, /goToConsole: "Konsolga o‘tish"/);
});

test("landing locale changes update the current URL before reload", async () => {
  const page = await source("../components/ydeck/YDeckPage.tsx");

  assert.match(page, /function handleLocaleChange\(nextLocale: Locale\)/);
  assert.match(page, /url\.searchParams\.set\("lang", nextLocale\)/);
  assert.match(page, /window\.history\.replaceState\(\{\}, "", url\)/);
  assert.match(page, /onClick=\{\(\) => handleLocaleChange\(option\.locale\)\}/);
});

test("public contact actions use the canonical Globance legal email identity", async () => {
  const constants = await source("../components/ydeck/constants.ts");
  const templates = await source("../components/ydeck/sections/TemplatesSection.tsx");
  const content = await source("../components/ydeck/i18n/localeContent.tsx");
  const legalPage = await source("../components/ydeck/LegalPage.tsx");
  const legalCopy = await source("../components/ydeck/data/legalPages.ts");

  assert.match(constants, /contactEmail = 'admin@globance\.co'/);
  assert.match(constants, /contactHref = `mailto:\$\{contactEmail\}`/);
  assert.match(templates, /if \(ctaType === 'contact_sales'\) return contactHref/);
  assert.equal((content.match(/\['(?:Contact|Контакт|Aloqa)', contactHref\]/g) ?? []).length, 3);
  assert.match(legalPage, /href=\{contactHref\}/);
  assert.equal((legalCopy.match(/\$\{contactEmail\}/g) ?? []).length, 6);

  for (const file of [constants, templates, content, legalPage, legalCopy]) {
    assert.doesNotMatch(file, /ydeck\.ai/);
  }
});

test("Meta legal pages expose canonical public routes and required disclosures", async () => {
  const privacy = await source("../app/privacy/page.tsx");
  const terms = await source("../app/terms/page.tsx");
  const deletion = await source("../app/data-deletion/page.tsx");
  const documentShell = await source("../components/ydeck/LegalDocument.tsx");
  const legalData = await source("../components/ydeck/data/legal.ts");
  const footer = await source("../components/ydeck/sections/Footer.tsx");
  const content = await source("../components/ydeck/i18n/localeContent.tsx");

  assert.match(privacy, /title: 'Privacy Policy \| YDeck'/);
  assert.match(privacy, /description: 'Learn how YDeck collects, uses, protects and manages information\.'/);
  assert.match(privacy, /canonical: '\/privacy'/);
  assert.match(privacy, /Instagram and Meta Platform Data/);
  assert.match(privacy, /YDeck does not sell Instagram message data/);
  assert.match(privacy, /AI and Automated Processing/);
  assert.match(privacy, /href="\/settings\/account\?action=delete-account"/);

  assert.match(terms, /title: 'Terms of Service \| YDeck'/);
  assert.match(terms, /canonical: '\/terms'/);
  assert.match(terms, /Instagram Sales Agent/);
  assert.match(terms, /AI-Generated Content/);
  assert.match(terms, /laws of Hong Kong/);

  assert.match(deletion, /title: 'User Data Deletion \| YDeck'/);
  assert.match(deletion, /canonical: '\/data-deletion'/);
  assert.match(deletion, /YDeck Data Deletion Request/);
  assert.match(deletion, /Do not email your password, API keys, access tokens/);
  assert.match(deletion, /Option 2: Revoke Meta Authorization/);

  for (const page of [privacy, terms, deletion]) {
    assert.match(page, /index: true/);
    assert.match(page, /follow: true/);
    assert.doesNotMatch(page, /RequireAuth|redirect\(|router\.replace/);
  }

  assert.match(documentShell, /<main id="legal-content"/);
  assert.match(documentShell, /aria-label="Legal page navigation"/);
  assert.match(legalData, /legalName: 'GLOBANCE GROUP LIMITED'/);
  assert.match(legalData, /email: 'admin@globance\.co'/);
  assert.match(legalData, /display: '14 August 2026'/);
  assert.match(footer, /'\/privacy', '\/terms', '\/security', '\/data-deletion'/);
  assert.match(content, /legal: \['Privacy', 'Terms', 'Security', 'Data Deletion'\]/);
});
