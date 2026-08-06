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
  const navbar = await source("../components/ydeck/components/Navbar.tsx");
  const content = await source("../components/ydeck/i18n/localeContent.tsx");

  assert.match(navbar, /Menu, X/);
  assert.match(navbar, /aria-controls="ydeck-mobile-navigation"/);
  assert.match(navbar, /aria-expanded=\{mobileMenuOpen\}/);
  assert.match(navbar, /id="ydeck-mobile-navigation"/);
  assert.match(navbar, /xl:hidden/);
  assert.match(navbar, /event\.key !== 'Escape'/);
  assert.match(navbar, /menuButtonRef\.current\?\.focus\(\)/);
  assert.match(navbar, /onClick=\{\(\) => setMobileMenuOpen\(false\)\}/);
  assert.match(content, /openMenuLabel: 'Open navigation'/);
  assert.match(content, /openMenuLabel: 'Открыть навигацию'/);
  assert.match(content, /openMenuLabel: 'Navigatsiyani ochish'/);
});

test("landing locale changes update the current URL before reload", async () => {
  const page = await source("../components/ydeck/YDeckPage.tsx");

  assert.match(page, /function handleLocaleChange\(nextLocale: Locale\)/);
  assert.match(page, /url\.searchParams\.set\('lang', nextLocale\)/);
  assert.match(page, /window\.history\.replaceState\(\{\}, '', url\)/);
  assert.match(page, /onLocaleChange=\{handleLocaleChange\}/);
});

test("public contact actions use the canonical ydeck.app email identity", async () => {
  const constants = await source("../components/ydeck/constants.ts");
  const templates = await source("../components/ydeck/sections/TemplatesSection.tsx");
  const content = await source("../components/ydeck/i18n/localeContent.tsx");
  const legalPage = await source("../components/ydeck/LegalPage.tsx");
  const legalCopy = await source("../components/ydeck/data/legalPages.ts");

  assert.match(constants, /contactEmail = 'hello@ydeck\.app'/);
  assert.match(constants, /contactHref = `mailto:\$\{contactEmail\}`/);
  assert.match(templates, /if \(ctaType === 'contact_sales'\) return contactHref/);
  assert.equal((content.match(/\['(?:Contact|Контакт|Aloqa)', contactHref\]/g) ?? []).length, 3);
  assert.match(legalPage, /href=\{contactHref\}/);
  assert.equal((legalCopy.match(/\$\{contactEmail\}/g) ?? []).length, 6);

  for (const file of [constants, templates, content, legalPage, legalCopy]) {
    assert.doesNotMatch(file, /ydeck\.ai/);
  }
});
