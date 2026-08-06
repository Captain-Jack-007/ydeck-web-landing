# YDeck Landing Page Button Functionality Audit

Audit date: 2026-08-01  
Production URL: https://www.ydeck.app/  
Viewports: desktop 1440×900, tablet 768×1024, mobile 390×844  
Scope: public landing page plus the directly reached `/waitlist` conversion form. Legal routes were checked for reachability only. Authenticated product, desktop app, settings, editor, admin, and backend features were excluded.

## Executive Summary

- **Total interactive control instances tested:** 60 — 43 rendered landing-page anchors/buttons and 17 distinct responsive waitlist-form controls.
- **Working correctly across their required states:** 45.
- **Broken or behaviorally incorrect:** 15 control instances across 5 root-cause issues.
- **Severity:** P0: 1, P1: 2, P2: 2, P3: 0.
- **Production traffic readiness:** **No.** The primary mobile conversion form can fail silently, and both CTAs in the final conversion section are pointer-blocked at every tested viewport.
- **Landing runtime health:** No JavaScript exceptions, failed requests, or HTTP 4xx/5xx responses occurred during normal landing-page loading and working interactions. The only console errors were produced by the broken mobile form flow documented as YD-001.

The count treats repeated marquee CTAs as separate rendered controls because each instance is independently clickable. A control that works in one viewport but fails in another is counted as affected, not working.

## Remediation Update — 2026-08-04

The five findings in this report have been remediated in the current source. The public contact identity is now centralized as `hello@ydeck.app`; landing contact actions, template `Contact sales` actions, and EN/RU/UZ legal pages use that address. Browser verification covers desktop and mobile rendering with no console errors. The historical YD-005 evidence below describes the pre-remediation `ydeck.ai` destination; current DNS still needs an MX record before mailbox delivery can be considered operational.

## Broken Interaction Report

| ID | Classification | Element | Section | Desktop/Mobile | Expected Behavior | Actual Behavior | Root Cause | Severity | File | Line |
| -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |
| YD-001 | `MOBILE_ONLY_BUG`, `FORM_FAILURE`, `JAVASCRIPT_ERROR` | `Continue` and `Request Reporting Audit` | Waitlist form | Mobile ≤760px | Step 1 validates required name/email before advancing; submit returns the user to a visible invalid field or shows an error. | `Continue` hides empty required inputs. Submit then does nothing, shows no feedback, and logs two browser errors: `An invalid form control with name='name' is not focusable.` and the same for `email`. | `Continue` changes `mobileStep` without validating. Mobile CSS sets inactive steps to `display:none`, leaving invalid required controls unfocusable during native submit validation. | **P0 Critical** | `components/WaitlistForm.tsx`; `app/globals.css` | 99; 708 |
| YD-002 | `BLOCKED_ELEMENT` | `Request a Reporting Process Audit`; `View Pilot Use Cases` | Final CTA | Desktop, tablet, mobile | Primary CTA opens `/waitlist?lang=en`; secondary CTA navigates to `#use-cases`. | Normal pointer clicks time out and do not navigate. Hit testing lands on the decorative overlay; Playwright repeatedly reports that the absolute radial-gradient layer intercepts pointer events. | The full-section absolute decoration has no `pointer-events-none`, while the content wrapper has no positioned stacking layer above it. | **P1 High** | `components/ydeck/sections/FinalCTA.tsx` | 28 |
| YD-003 | `MOBILE_ONLY_BUG` | `Product`, `How It Works`, `Reporting Skills`, `Use Cases`, `Trust` | Header navigation | Tablet and mobile | Primary landing navigation remains available through visible links or a mobile menu. | All five links are `display:none` at 768px and 390px, and no replacement menu/control exists. They cannot be clicked or reached by keyboard at those viewports. | The navigation container uses `hidden ... xl:flex`, so links appear only at ≥1280px. | **P1 High** | `components/ydeck/components/Navbar.tsx` | 47 |
| YD-004 | `WRONG_DESTINATION` | `EN`, `RU`, `UZ` language selector | Header navigation | Desktop, tablet, mobile | Selected language and URL remain consistent after selection and reload. | From `/?lang=en`, clicking `RU` changes content and stores `ru`, but the URL stays `?lang=en`; reload restores English even though local storage remains `ru`. | The selector only updates React state. Locale detection gives the unchanged URL parameter precedence over the saved preference. | **P2 Medium** | `components/ydeck/components/Navbar.tsx`; `components/ydeck/utils/locale.ts` | 68; 6 |
| YD-005 | `EXTERNAL_LINK_FAILURE` | Two `Contact sales` marquee links; footer `Contact` | Reporting Skills; footer | Desktop, tablet, mobile | Open a deliverable contact email address. | The links resolve to `mailto:hello@ydeck.ai`, but `ydeck.ai` has no DNS A, MX, or NS answer. The browser can invoke a mail client, but delivery to the destination cannot succeed while the domain is unresolved. | Contact destinations are hardcoded to the unresolved `ydeck.ai` domain while the public site is served from `ydeck.app`. | **P2 Medium** | `components/ydeck/sections/TemplatesSection.tsx`; `components/ydeck/i18n/localeContent.tsx` | 364; 245 |

## Working Interaction Inventory

### Landing page

| Area | Tested interactions | Result |
| -- | -- | -- |
| Header | YDeck logo/home; `Request audit` | Clickable at all three viewports; both routes return HTTP 200. |
| Header desktop navigation | `Product`, `How It Works`, `Reporting Skills`, `Use Cases`, `Trust` | Each navigates to an existing section on desktop. Their tablet/mobile absence is reported as YD-003. |
| Header language behavior | `EN`, `RU`, `UZ` | Immediate locale switching, `aria-pressed`, and Space-key activation work. Reload/URL consistency is reported as YD-004. |
| Hero | `Request a Reporting Process Audit`; `See How It Works` | Primary route returns HTTP 200; secondary navigates to the existing `#workflow` target. Enter-key activation works for the native anchor pattern. |
| Reporting Skills marquee | Six `Request audit` instances; four `Apply as a Design Partner` instances | All ten link to `/waitlist?lang=en`, which returns HTTP 200. The two separate `Contact sales` instances are reported as YD-005. |
| Final CTA | None | Both rendered CTA controls are affected by YD-002. |
| Footer brand/actions | YDeck home; standalone `Request audit` | Clickable at all viewports; destinations return HTTP 200. |
| Footer product and pilot links | `Private Reporting Agent`, `Skills Studio`, `Reporting Skills`, `Trust Model`, `Mining operations`, `Industrial reporting`, `Accounting firms`, `Enterprise finance` | All eight navigate to existing landing-page section IDs. |
| Footer company links | `Request audit`; `Design partner pilot`; `Security notes` | Waitlist and security destinations return HTTP 200. `Contact` is reported as YD-005. |
| Footer legal links | `Privacy policy`; `Terms`; `Security` | `/privacy?lang=en`, `/terms?lang=en`, and `/security?lang=en` all return HTTP 200 without 404s. |

### Direct waitlist conversion form

| Area | Tested interactions | Result |
| -- | -- | -- |
| Locale controls | `EN`, `RU`, `UZ` | Click, keyboard activation, URL replacement, and visible copy changes work. |
| Fields | Name, email, company, role, preferred contact | Labels and inputs work; desktop empty submit focuses the required name field and exposes native validation. |
| Selectors | Report workflow; reporting frequency | Both selectors accept values at all responsive states. |
| Mode control | PowerPoint; PDF; PowerPoint and PDF | Native radio inputs update the selected value. |
| Responsive form controls | Desktop/tablet submit; mobile `Back` | Controls are clickable and keyboard-operable. The mobile invalid `Continue`/submit sequence is reported as YD-001. |
| Valid submission client path | Submit request | A production-shaped POST to the configured `/rest/v1/waitlist` endpoint was intercepted before leaving the browser and answered with a diagnostic HTTP 201; the success message appeared and submit disabled as intended. No real waitlist record was created. |

No Sign In, Sign Up, Download YDeck, pricing, demo/video, FAQ accordion, carousel-control, dropdown-menu, or social-media controls are rendered on the current landing page, so there were no such controls to test. The report-template strip is automatic and has no user-facing carousel controls.

## Recommended Fix Order

1. **YD-001 — P0:** Validate step 1 before advancing, or return to and focus the first invalid field before submit. Add a mobile regression test for empty and invalid required fields.
2. **YD-002 — P1:** Make decorative final-CTA layers ignore pointer events and place interactive content in an explicit foreground stacking layer. Test both CTAs at all three viewports.
3. **YD-003 — P1:** Provide an accessible tablet/mobile navigation control or retain a compact visible section-navigation path. Verify focus order, Escape behavior if a menu is used, and 390px/768px layouts.
4. **YD-004 — P2:** Update the landing URL when locale changes, or remove the stale `lang` parameter before relying on local storage. Test deep links and reload persistence for all three locales.
5. **YD-005 — P2 (historical):** Configure DNS/mail for the canonical `ydeck.app` contact address, then test the exact address externally.

## Evidence

### YD-001 — Mobile waitlist form silently fails

- **Page URL:** https://www.ydeck.app/waitlist?lang=en
- **Visible controls:** `Continue`, then `Request Reporting Audit`.
- **Source:** `components/WaitlistForm.tsx:74`, `components/WaitlistForm.tsx:99`, `components/WaitlistForm.tsx:147`, `app/globals.css:708`.
- **Console errors:**
  - `An invalid form control with name='name' is not focusable.`
  - `An invalid form control with name='email' is not focusable.`
- **Failed network request:** None; native validation prevents the submit handler and request from running.
- **Screenshot:** [Mobile step 2 after silent submit](artifacts/landing-button-audit/waitlist-mobile-empty-submit.png)
- **Reproduction:** Open the URL at 390×844; leave name and email empty; click `Continue`; click `Request Reporting Audit`; observe no visible response and the two console errors.

### YD-002 — Final CTA overlay blocks clicks

- **Page URL:** https://www.ydeck.app/?lang=en#final-cta
- **Visible controls:** `Request a Reporting Process Audit`, `View Pilot Use Cases`.
- **Source:** `components/ydeck/sections/FinalCTA.tsx:27`, `components/ydeck/sections/FinalCTA.tsx:28`, `components/ydeck/sections/FinalCTA.tsx:41`, `components/ydeck/sections/FinalCTA.tsx:48`.
- **Console error:** None.
- **Failed network request:** None; the click never reaches the anchor.
- **Automation evidence:** Playwright actionability checks report the `absolute inset-0` radial-gradient `div` intercepting pointer events at 1440×900, 768×1024, and 390×844.
- **Keyboard evidence:** Enter activates both native anchors successfully, confirming the failure is pointer-specific: the primary reaches `/waitlist?lang=en` and the secondary sets `#use-cases`.
- **Screenshot:** [Final CTA desktop](artifacts/landing-button-audit/final-cta-desktop.png), [Final CTA mobile](artifacts/landing-button-audit/final-cta-mobile.png)
- **Reproduction:** Open the URL; scroll to the design-partner CTA; click either button; observe no navigation. Browser hit testing resolves to the decorative layer rather than the anchor.

### YD-003 — Header navigation absent below `xl`

- **Page URL:** https://www.ydeck.app/?lang=en
- **Visible link text on desktop:** `Product`, `How It Works`, `Reporting Skills`, `Use Cases`, `Trust`.
- **Source:** `components/ydeck/components/Navbar.tsx:47`.
- **Console error:** None.
- **Failed network request:** None.
- **Automation evidence:** Each link has a 0×0 box and computed `display:none` at 768×1024 and 390×844; no menu button or equivalent navigation control exists.
- **Screenshot:** [Landing tablet](artifacts/landing-button-audit/landing-tablet.png), [Landing mobile](artifacts/landing-button-audit/landing-mobile.png)
- **Reproduction:** Open the page at 768px or 390px wide; inspect the header; only home, language controls, and `Request audit` remain.

### YD-004 — Landing language selection is overwritten on reload

- **Page URL:** https://www.ydeck.app/?lang=en
- **Visible controls:** `EN`, `RU`, `UZ`.
- **Source:** `components/ydeck/components/Navbar.tsx:68`, `components/ydeck/YDeckPage.tsx:60`, `components/ydeck/utils/locale.ts:6`.
- **Console error:** None.
- **Failed network request:** None.
- **Automation evidence:** After `RU`: `<html lang="ru">`, local storage `ru`, URL still `?lang=en`. After reload: `<html lang="en">`, local storage still `ru`.
- **Reproduction:** Open the URL; click `RU`; reload; observe that the page returns to English.

### YD-005 — Contact email domain has no DNS

- **Page URL:** https://www.ydeck.app/?lang=en#reporting-skills and the footer on the same page.
- **Visible link text:** `Contact sales`, `Contact`.
- **Source:** `components/ydeck/sections/TemplatesSection.tsx:364`, `components/ydeck/i18n/localeContent.tsx:245`.
- **Console error:** None.
- **Failed network request:** Not applicable to `mailto:` activation.
- **External validation:** `dig ydeck.ai A` and `dig ydeck.ai MX` returned `NXDOMAIN`; the domain also has no NS answer. `ydeck.app` resolves successfully and serves the audited site.
- **Reproduction:** Inspect either link destination (`mailto:hello@ydeck.ai`), then resolve the domain or attempt delivery from a mail system.

## Raw Audit Artifacts

- [Landing/browser viewport and route results](artifacts/landing-button-audit/browser-results.partial.json)
- [Language and waitlist form results](artifacts/landing-button-audit/secondary-results.json)
- [Explicit field, selector, radio, responsive-control, and keyboard coverage](artifacts/landing-button-audit/control-coverage.json)
- [Desktop landing screenshot](artifacts/landing-button-audit/landing-desktop.png)
- [Tablet landing screenshot](artifacts/landing-button-audit/landing-tablet.png)
- [Mobile landing screenshot](artifacts/landing-button-audit/landing-mobile.png)
- [Desktop simulated form success](artifacts/landing-button-audit/waitlist-desktop-simulated-success.png)
- [Tablet simulated form success](artifacts/landing-button-audit/waitlist-tablet-simulated-success.png)
- [Mobile simulated form success](artifacts/landing-button-audit/waitlist-mobile-simulated-success.png)

The live waitlist backend was not allowed to create a real production record. The browser confirmed that a valid form builds the configured POST request and handles an HTTP 201 response, but end-to-end production persistence and downstream notification delivery remain unverified.

## Verdict

**REJECTED — One or more essential landing-page interactions are broken**
