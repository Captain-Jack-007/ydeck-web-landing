# YDeck Landing Page Content And Positioning Audit

Date: 2026-07-22

Scope: Audit-only review of the current YDeck public landing-page content sources, live route behavior, dormant landing components, waitlist copy, legal copy, metadata, and repository evidence for implemented versus planned capabilities.

No production code, content, styles, routes, metadata, or assets were modified as part of this audit.

## A. Executive Summary

The current repository does not expose a public landing page at `/`. `app/page.tsx` renders `HomePageClient`, which renders `ProductWorkspace`. `ProductWorkspace` redirects unauthenticated visitors to `/auth/sign-in`. This means a first-time public visitor does not currently see a marketing landing page at the root route.

The repo contains two separate landing-content systems:

1. A live authenticated Desktop/account portal at `/`.
2. Dormant public landing content under `components/ydeck` plus older expo/waitlist content under `lib/i18n.ts`.

The live product experience currently communicates:

- YDeck Desktop Beta.
- Presentation workspace.
- Desktop pairing.
- macOS/Windows Desktop access, but download builds are unavailable.
- Editable PPTX and source-file support.
- Account, workspace, billing, device, and plan management.

The dormant landing page communicates:

- Private AI presentation agent.
- Turn any idea or file into a professional deck.
- Upload documents, books, notes, and business ideas.
- AI designs slides.
- Export editable PPTX.
- Use cases for founders, teachers, students, companies, investors, and government teams.
- Templates for many deck types.
- Privacy/local-first positioning.

The largest strategic mismatch is that the current content sells YDeck as a generic private/local AI PowerPoint or deck generator, while the new product direction is YDeck Private Reporting Agent: recurring enterprise reporting workflows converted into reusable company-specific reporting skills.

The strongest reusable content themes are:

- Sensitive-file/private workflow framing.
- Editable PowerPoint output.
- Source-material-to-structured-output transformation.
- Human review/quality review as an idea, though currently visual-only.
- Desktop/account security infrastructure.
- Pilot/waitlist collection mechanics.
- Cautious legal/security copy that avoids unearned certifications.

The most urgent content problem is that the current page does not explain the core strategic mechanism: previous report packs plus source data and company rules become a reviewed, reusable reporting skill. Skills Studio, Reporting Agent, verification, source traceability, deterministic calculations, human approval, PowerPoint/PDF reporting deliverables, and product maturity boundaries are absent or not meaningfully explained.

Overall audit verdict: severe strategic mismatch. The page must be repositioned before it can support enterprise customer discovery for mining, industrial, accounting, and enterprise finance prospects.

### Role-specific Findings

| Role | Finding |
| --- | --- |
| Senior Enterprise SaaS Product Strategist | The live root is an authenticated Desktop portal, not a public enterprise SaaS landing page. The dormant copy is still presentation-generator led, not reporting-agent led. |
| B2B Positioning and Messaging Expert | The dominant category is private/local AI presentation generator. The value proposition is broad, easy to understand, but not differentiated for enterprise recurring reporting. |
| Enterprise Landing Page Conversion Specialist | CTAs are inconsistent with enterprise design-partner recruitment: waitlist, disabled downloads, templates, pricing links, and sign-in flows compete with each other. |
| UX Content Auditor and Information Architect | Content is fragmented across route shell, authenticated portal, dormant landing dictionaries, waitlist dictionaries, legal dictionaries, and product docs. The actual visitor journey is not aligned with the intended page story. |
| Enterprise AI Product Marketing Lead | Reporting Agent, Skills Studio, private runtime, verification layer, source mapping, deterministic calculations, PowerPoint/PDF deliverable distinction, and approval workflow are missing. |
| Mining and Financial Reporting Domain Researcher | Mining and accounting segments are not named in current landing content. Current "business report" references are generic and do not validate any mining, industrial, accounting, or finance use case. |
| Technical Product Auditor | Repo evidence supports Desktop/account/web infrastructure and some Desktop capabilities. Contract docs mark agent studio/catalog/execution as planned, not production-ready. |
| Devil's Advocate and Claims-Risk Reviewer | Claims around Private Mode, no upload, local execution, cloud/social access, local-first readiness, provider integrations, PDF export, enterprise readiness, and visual QA need tighter evidence boundaries. |

## B. Current Page Inventory

### Live Root Route Inventory

Current route chain:

- `app/page.tsx` renders `HomePageClient`.
- `components/HomePageClient.tsx` renders `ProductWorkspace`.
- `components/workspace/ProductWorkspace.tsx` redirects unauthenticated users to `/auth/sign-in`.
- Authenticated users see `DesktopPortalHome`.

| Order | Section | Exact purpose | Current message | CTA | Audience implied |
| --- | --- | --- | --- | --- | --- |
| 1 | Loading/auth gate | Restore or check authenticated web session. | "Loading YDeck workspace." | None. | Existing account holder. |
| 2 | Public visitor redirect | Prevent unauthenticated root access. | Visitor is sent to sign in. | Sign in or sign up on auth page. | Registered or invited user. |
| 3 | Authenticated Desktop portal hero | Introduce Desktop beta. | "Create professional presentations with YDeck Desktop." | Download for macOS, Download for Windows, both unavailable. | Desktop beta user. |
| 4 | Product walkthrough card | Preview Desktop workflow. | "See YDeck Desktop in action" and "Turn source material into a structured, editable presentation." | Watch walkthrough if video URL exists; otherwise Explore the workflow. | Desktop evaluator. |
| 5 | Core capabilities | Summarize Desktop feature set. | Presentation studio, quality review, editable PPTX, source-file support, local workflows, connected providers. | None. | Existing user evaluating Desktop. |
| 6 | Getting started | Guide activation. | Install and connect, add source material, generate and review, export and edit. | Connect Desktop, View walkthrough. | Authenticated beta user. |
| 7 | Account summary | Show current account/workspace/device state. | Plan, registered devices, workspace, Desktop connection. | Manage devices, Billing and plan. | Existing customer/account holder. |

### Dormant `components/ydeck/YDeckPage` Inventory

This is landing-page content, but it is not currently mounted by the root page.

| Order | Section | Exact purpose | Current message | CTA | Audience implied |
| --- | --- | --- | --- | --- | --- |
| 1 | Navbar | Landing navigation and language selection. | Product, Templates, Use Cases, Privacy, Pricing. | Join waitlist. | Broad prospects. |
| 2 | Hero | Define product and promise. | "Private AI presentation agent" and "Turn any idea or file into a professional deck." | Create your first deck, Watch YDeck work. | Founders, teachers, students, companies, teams. |
| 3 | Agent mockup | Demonstrate AI deck generation. | Prompt plus files becomes a Web3 investor pitch deck. | None. | Pitch deck creator. |
| 4 | Product cards | Explain deck workflow. | Upload anything, AI designs the deck, export editable PPTX. | None. | Presentation creator. |
| 5 | Workflow | Explain process. | Input, understand, design, review, export. | None. | Broad user. |
| 6 | Use cases | Show possible audiences. | Founders, teachers, students, companies, investors, government teams. | None. | Everyone who makes presentations. |
| 7 | Privacy | Trust/security positioning. | Private by design, local-first ready, private document workflows. | None. | Sensitive-document user. |
| 8 | Templates | Visual proof/gallery. | Web3 pitch deck, sales proposal, startup pitch, business report, country overview, Globance pitch deck, investment app deck. | Template browsing via carousel. | Template shopper / presentation generator user. |
| 9 | Final CTA | Convert visitor. | "Your next presentation can start with one prompt." | Join waitlist, See templates. | Self-serve or pilot user. |
| 10 | Footer | Recap and navigation. | Private AI for turning notes, files, reports, and rough ideas into editable presentations. | Join waitlist, legal links, contact. | Broad user. |

### Waitlist Page Inventory

`/waitlist` is public and uses `lib/i18n.ts`.

| Order | Section | Exact purpose | Current message | CTA | Audience implied |
| --- | --- | --- | --- | --- | --- |
| 1 | Topbar | Return and language selection. | Back to landing page, language switcher. | Back link. | Waitlist applicant. |
| 2 | Waitlist hero | Explain early access. | Request early access to YDeck; private AI presentation agent before public launch. | None in copy block. | Founders, educators, consultants, companies, organizations. |
| 3 | Pilot highlight | Incentivize early signup. | Special lifetime discount after public launch. | None. | Early adopter. |
| 4 | Benefit cards | Explain pilot benefits. | Early access, private AI features, direct product access. | None. | Pilot user. |
| 5 | Trust line | Privacy reassurance. | Private Mode keeps files and prompts on your device. | None. | Sensitive-file user. |
| 6 | Form | Capture lead. | Name, email, company, role, contact, presentation type, preferred mode, decks per month. | Request Early Access. | Broad deck maker. |

## C. Positioning Diagnosis

### Current Category

The live root route currently places YDeck in the category of:

- Authenticated Desktop presentation workspace.
- Desktop beta portal.
- Account/device/billing management shell.

The dormant marketing copy places YDeck in the category of:

- Generic AI presentation generator.
- Private/local AI PowerPoint generator.
- Document-to-presentation converter.
- Desktop productivity tool.
- Template/gallery-driven deck generator.

The current content does not meaningfully position YDeck as:

- AI reporting agent.
- Reporting workflow automation platform.
- Private enterprise reporting platform.
- Company intelligence system.
- Reporting OS.

### Dominant Value Proposition

Dominant dormant value proposition:

Prompt or file -> AI agent -> designed editable deck/PPTX.

This is clear and simple, but it is strategically outdated. It competes directly with Gamma, Canva, Copilot, and generic presentation-generation tools.

New required value proposition:

Previous report packs plus verified internal data plus company reporting methodology -> company-specific reusable reporting skill -> verified PowerPoint and PDF reports prepared for human approval.

Current copy does not communicate this.

### Dominant Target User

Current dormant landing target is broad:

- Founders.
- Teachers.
- Students.
- Companies.
- Teams.
- Investors.
- Government teams.
- Institutions.
- Consultants.

This conflicts with the new discovery focus:

- Mining and industrial companies.
- Accounting companies.
- Enterprise finance teams.
- Report owners.
- CFOs.
- Operations leaders.
- Analysts.
- IT/security stakeholders.

### Product-led, Enterprise-led, or Mixed

Current experience is mixed:

- Live route is product/account-led.
- Dormant landing is consumer/prosumer/self-serve led.
- Waitlist is pilot-led but not enterprise-specific.
- Legal/security copy is cautious and directionally enterprise-aware but deck-centric.

It is not enterprise-led.

### Contradictory Messages

| Area | Contradiction |
| --- | --- |
| Public access | Root route is sign-in gated, while dormant content expects a public landing page. |
| Product maturity | Dormant copy says "Create your first deck," while live Desktop downloads are unavailable. |
| Audience | Broad personas dilute enterprise reporting focus. |
| Privacy | "Private Mode keeps files and prompts on your own device" is stronger than implementation evidence in the landing repo. |
| Pricing | Dormant navbar says Pricing but links to final CTA/waitlist. |
| Output | PPTX dominates; PDF appears as an export but is not positioned as an official reporting deliverable. |
| Reporting strategy | Current content discusses decks/templates, not reusable reporting skills. |

## D. Section-By-Section Audit

| Section | Current message | What works | Problem | Risk | Recommended action |
| --- | --- | --- | --- | --- | --- |
| Live `/` auth gate | YDeck is an authenticated workspace. | App behavior is clear for existing users. | Public prospects see sign-in instead of landing page. | Enterprise prospects bounce immediately. | Rewrite |
| Desktop portal hero | Create professional presentations with YDeck Desktop. | Honest Desktop-beta framing. | Does not explain Reporting Agent or recurring reports. | Anchors YDeck in old Desktop presentation category. | Keep but reposition |
| Disabled Desktop downloads | macOS/Windows builds unavailable. | Honest availability. | Dead-end conversion for prospects. | Makes product feel inaccessible, not consultative. | Rewrite |
| Walkthrough card | See YDeck Desktop in action. | Useful proof slot; can support future reporting demo. | Current proof is generic source-to-presentation. | Reinforces deck-generation story. | Keep but reposition |
| Core capabilities | Studio, quality review, editable PPTX, source-file support, local workflows, providers. | PPTX, source support, review, local/BYOK are useful foundations. | No reporting skill, no verification layer, no deterministic calculations. | Claims may imply broader readiness than evidence supports. | Keep but reposition |
| Getting started | Install, add source, generate/review, export/edit. | Simple workflow. | Too self-serve/Desktop; no enterprise pilot path. | Wrong buyer journey. | Rewrite |
| Account summary | Plan, devices, workspace. | Useful authenticated app UI. | Not public landing content. | Confuses public buyers if exposed. | Remove |
| Dormant navbar | Product, Templates, Use Cases, Privacy, Pricing. | Basic navigation exists. | Templates and Pricing conflict with current strategy/maturity. | Misframes product and buyer intent. | Rewrite |
| Dormant hero | Any idea/file to professional deck. | Clear within 5 seconds. | Wrong core category. | Actively damages new positioning. | Rewrite |
| Agent mockup | Startup idea plus files generates Web3 investor pitch deck. | Shows transformation visually. | Generic prompt-to-deck demo. | Makes YDeck look like Gamma/Canva/Copilot alternative only. | Rewrite |
| Product cards | Upload anything, AI designs deck, export PPTX. | Easy mechanism. | Does not explain report packs, source data, rules, skill reuse. | Hides main value. | Rewrite |
| Workflow | Input, understand, design, review, export. | Review/export concepts reusable. | Review means visual QA, not source verification or human approval. | Accuracy/trust ambiguity. | Keep but reposition |
| Use cases | One AI deck agent for every serious presentation. | Shows market breadth. | Too many unrelated personas; no mining/accounting focus. | Dilutes enterprise credibility. | Rewrite |
| Privacy | Private by design, local-first ready. | Trust theme is strategically important. | Vague and partly over-strong. | Security/privacy claim risk. | Keep but reposition |
| Templates | Templates for decks people need. | Visual assets exist. | Template-marketplace signal conflicts with reporting-agent positioning. | Actively damages new strategy if kept prominent. | Remove |
| Final CTA | Next presentation starts with one prompt. | Has conversion space. | Wrong action and promise. | Optimizes for self-serve deck generation. | Rewrite |
| Footer | Private AI deck workspace. | Reusable brand and legal links. | Repeats old category. | Reinforces PPTX-only product. | Rewrite |
| Waitlist page | Early access to private AI presentation agent. | Form infrastructure and pilot framing useful. | Fields and benefits are not reporting-discovery specific. | Captures poor-fit leads. | Keep but reposition |
| Legal/privacy pages | Pilot privacy, responsible rollout, no unearned certifications. | Good caution and honesty. | Deck-centric, not reporting-centric. | Needs updated scope before new launch. | Keep but reposition |
| Missing Reporting Agent section | None. | n/a | Core product is absent. | Fatal clarity gap. | Add later |
| Missing Skills Studio section | None. | n/a | No explanation of automatic skill extraction or human certification. | Visitors misunderstand product mechanism. | Add later |
| Missing verification section | None. | n/a | No source traceability, deterministic calculations, missing-data warnings, approval. | Enterprise trust gap. | Add later |
| Missing vertical discovery section | None. | n/a | Mining/accounting not addressed. | Poor segment relevance. | Add later |

## E. Claims And Evidence Audit

| Current claim | Location | Evidence found | Risk level | Recommendation |
| --- | --- | --- | --- | --- |
| "Create professional presentations with YDeck Desktop." | `components/workspace/DesktopPortalHome.tsx` | Desktop portal exists. | Low | Keep inside app/portal; do not lead new landing with it. |
| "Turn documents, research, and ideas into structured, visually refined, editable presentations on macOS and Windows." | `DesktopPortalHome.tsx` | Portal copy exists; downloads unavailable. | Medium | Limit to Beta/available capabilities. |
| macOS and Windows downloads. | `DesktopPortalHome.tsx`, `DesktopPortalComponents.tsx` | Buttons are hardcoded unavailable. | Low | Honest as-is; not suitable as main CTA. |
| "Beta channel." | `DesktopPortalHome.tsx` | Explicit label. | Low | Keep when discussing Desktop. |
| "Secure account pairing." | `DesktopPortalHome.tsx`; pairing tests/docs | Pairing approval/deny/device tests and docs support this. | Low | Preserve as infrastructure proof. |
| "Presentation studio." | `DesktopPortalHome.tsx`; `desktop-cloud-api-integration.md` | `presentation_studio` marked Ready. | Low | Reposition as app capability, not core landing promise. |
| "Quality review." | `DesktopPortalHome.tsx` | UI copy only; no detailed verifier evidence in landing repo. | Medium | Define review scope precisely. |
| "Editable PPTX." | `DesktopPortalHome.tsx`; desktop contract | `pptx_export` marked Ready with entitlement/permission rule. | Low | Keep and reposition as editable management-report deliverable. |
| "Source-file support." | `DesktopPortalHome.tsx` | Supported PDFs, PPTX, notes, documents in copy; no full parser evidence in landing repo. | Medium | Specify supported formats after verification. |
| "Local workflows." | `DesktopPortalHome.tsx`; desktop contract | `local_generation` marked Ready. | Medium | Avoid implying complete offline Reporting Agent. |
| "Connected providers and BYOK integrations." | `DesktopPortalHome.tsx`; desktop contract | `byok_generation` Ready; specific providers not evidenced in landing repo. | Medium | Name only verified providers or keep generic with caveat. |
| "Private AI presentation agent." | Dormant landing, `localeContent.tsx` and `lib/i18n.ts` | Agent execution features marked planned in desktop contract. | High | Avoid as current capability unless backed by implementation. |
| "Turn any idea or file into a professional deck." | Dormant hero | Broad claim; no universal file support evidence. | High | Replace with narrower reporting workflow claim. |
| "Upload anything." | Dormant product cards | No evidence for all file types. | High | Remove or narrow. |
| "YDeck reads documents, books, notes, and business ideas." | Dormant hero | No complete evidence in landing repo. | Medium | Narrow to verified inputs. |
| "AI designs the deck." | Dormant product cards | General product direction; implementation not shown in landing repo. | Medium | Reframe around report drafting if implemented. |
| "Visual QA checks density, alignment, consistency, readability." | Dormant workflow | Copy only. | Medium | Do not imply factual verification. |
| "Get editable PPTX, PDF, or shareable presentation." | Dormant workflow | PPTX supported by contract; PDF/shareable not evidenced as ready. | High | Split current vs beta/planned. |
| "Local-first architecture ready." | Dormant privacy | Local generation Ready; local agent execution Planned. | Medium | Define exact local boundary. |
| "Private Mode keeps your files and prompts on your own device." | `lib/i18n.ts`, waitlist | Stronger than repo evidence for all modes. | High | Soften or qualify by mode/capability. |
| "No upload required in Private Mode." | `lib/i18n.ts` | Not sufficiently verified in landing repo; local generation exists, agent execution planned. | High | Use only if fully verified. |
| "Cloud Agent accessible from web, WhatsApp, WeChat, Telegram, and Discord." | `lib/i18n.ts` | No implementation evidence found. | High | Remove until implemented. |
| "Pilot members will receive free pilot usage/lifetime discount." | `lib/i18n.ts` | Business offer copy only. | Medium | Keep only if business has committed. |
| "10+ deck formats." | Dormant footer | Template previews exist; capability breadth not proved. | Medium | Replace with concrete examples or remove. |
| "Designed for teams and institutions." | Dormant privacy | Workspace/account/billing infrastructure exists. | Medium | Avoid implying full enterprise readiness. |
| "Pricing." | Dormant nav | Links to final CTA, no pricing section. | High | Remove or add accurate pricing/contact-sales later. |
| "Security notes for private decks." | Legal pages | Cautious and explicit about no unearned certifications. | Low | Preserve tone, update scope to reporting. |
| "YDeck features, pricing, availability, and export options may change during pilot." | Legal terms | Appropriate maturity disclosure. | Low | Keep; adapt to Reporting Agent. |
| "Reporting Agent." | New strategy | No current landing copy found. | Fatal gap | Add later. |
| "Skills Studio." | New strategy | No current landing copy found; `agent_studio` marked Planned. | Fatal gap | Add later with maturity label. |
| "Reporting OS." | New strategy | No current landing copy found. | High if introduced prematurely | Mention only as long-term vision, not current product. |
| "Source verification / source mapping." | New strategy | No current landing copy found. | Fatal gap | Add later only if capability exists or is marked beta/planned. |
| "Deterministic calculations." | New strategy | No current landing copy found. | Fatal gap | Add later with implementation status. |
| "Mining/accounting workflows solved." | New strategy | No current landing evidence. | High | Frame as discovery/pilot targets only. |

### Current Versus Planned Capability Separation

Evidence from `desktop-cloud-api-integration.md`:

Ready:

- `presentation_studio`
- `local_generation`
- `byok_generation`
- `pptx_export`

Planned / not production-ready:

- `cloud_generation`
- `agent_studio`
- `agent_catalog`
- `local_agent_execution`
- `cloud_agent_execution`
- `local_model_management`
- `cloud_asset_sync`
- `cloud_project_sync`

Implication: the future landing page must not present Skills Studio, agent catalogs, local/cloud agent execution, or Reporting OS as generally available unless separate implementation evidence exists outside this audited repo.

## F. CTA And Conversion Audit

| CTA | Current location | Current behavior | Fit for new strategy | Later recommendation |
| --- | --- | --- | --- | --- |
| Create your first deck | Dormant hero | Links to waitlist. | Poor; implies self-serve deck generation. | Replace with request reporting-process audit or apply as design partner. |
| Watch YDeck work | Dormant hero | Anchors to templates. | Poor; not a demo of reporting workflow. | Replace with reporting workflow demo or "See reporting cycle." |
| Join waitlist | Dormant nav/footer/final CTA | Links to `/waitlist`. | Partly useful infrastructure, weak enterprise specificity. | Reposition as apply for pilot/design partner. |
| Pricing | Dormant nav | Links to final CTA. | Misleading. | Remove until pricing/contact-sales path is accurate. |
| See templates | Dormant final CTA | Anchors to template gallery. | Poor; template browsing damages reporting positioning. | Remove or replace with use-case examples. |
| Download for macOS | Live Desktop portal | Disabled/unavailable. | App-only, not enterprise landing CTA. | Keep in account portal, not public landing hero. |
| Download for Windows | Live Desktop portal | Disabled/unavailable. | App-only, not enterprise landing CTA. | Keep in account portal, not public landing hero. |
| Explore the workflow | Walkthrough card fallback | Anchors to getting-started. | Weak; app onboarding only. | Use for reporting process walkthrough after rewrite. |
| Connect Desktop | Live portal | Goes to settings/devices. | Existing user activation, not lead generation. | Keep in app only. |
| View walkthrough | Live portal | Anchors to walkthrough card. | Could be useful if replaced with reporting demo. | Reposition later. |
| Manage devices | Account summary | Goes to settings/devices. | Existing user only. | Keep in app only. |
| Billing and plan | Account summary/topbar | Goes to billing/settings. | Existing customer only. | Keep in app only. |
| Request Early Access | Waitlist form | Inserts into Supabase waitlist. | Useful mechanic, wrong fields. | Change later to pilot/design-partner application with reporting workflow fields. |
| Contact | Footer/legal | `mailto:founder@globance.co`. | Useful fallback. | Keep, possibly label Contact Sales or Pilot Inquiry. |

The future enterprise conversion path should prioritize:

- Request a reporting-process audit.
- Apply as a design partner.
- Start a pilot conversation.
- Contact sales.

It should not lead with:

- Desktop download.
- Template browsing.
- Self-serve "create deck" action.
- Generic waitlist.
- Account management.

## G. Missing-Content Map

The current page is missing the following strategic content:

| Missing content | Why it matters |
| --- | --- |
| Recurring reporting pain | The page does not explain repeated monthly/quarterly reporting, manual copy-paste, chart refresh, narrative drafting, revisions, checks, or deadline pressure. |
| Previous report packs to skill | The core transformation from past report packs and source data into a reusable company reporting skill is absent. |
| Skills Studio explanation | No section explains skill extraction, configuration, review, certification, versioning, or reuse. |
| Automatic extraction versus manual builder | Current copy implies prompt-based generation, not automatic skill mining from previous report packs. |
| Human review and certification | The page does not explain that extracted skills require human review before reuse. |
| Reporting cycle reuse | No explanation of how future reporting periods use the certified skill. |
| Required source data and rules | No explanation that prior reports alone may be insufficient without Excel/CSV/ERP exports, KPI definitions, formulas, and business rules. |
| Deterministic calculations | Current copy does not distinguish formulaic calculations from AI-generated narrative. |
| Source verification | No source traceability/source mapping claims are explained. |
| Missing-data warnings | No explanation of required inputs, validation, missing info, or anomaly warnings. |
| Human approval | No statement that YDeck prepares and structures reports for humans, not official management decisions. |
| PowerPoint/PDF distinction | PPTX is emphasized; PDF is only a generic export, not positioned as official stable report output. |
| Private runtime | Privacy is vague; no clear data boundary, deployment model, or runtime maturity. |
| Mining use cases | Mining/industrial reporting workflows are absent. |
| Accounting/finance use cases | Accounting/enterprise finance workflows are absent. |
| Before/after workflow | No comparison between manual reporting and reusable reporting skill workflow. |
| Pilot/design-partner CTA | Current waitlist does not invite reporting-process audit or design partner qualification. |
| Product maturity disclosure | No public matrix separates current, beta, planned, and long-term vision for Reporting Agent/OS. |
| Competitive differentiation | No answer to why not Copilot, Canva, Gamma, BI dashboards, manual analysts, or consulting firms. |
| Claims policy | No explicit guardrails around AI accuracy, privacy, security, integrations, and enterprise readiness on the landing page. |

## H. Recommended Future Information Architecture

Use this future section order. This is structure only, not replacement copy.

1. Hero - define YDeck Private Reporting Agent and the recurring reporting outcome.
2. Reporting pain - show manual monthly reporting workflow: data collection, copy-paste, chart updates, formatting, revisions, verification, deadlines.
3. From previous report packs to company skill - explain that prior PowerPoint/PDF reports plus source data, rules, templates, comments, and KPIs become a draft reporting skill.
4. Skills Studio - explain extraction, configuration, review, certification, reuse, and maturity boundaries.
5. Reporting cycle workflow - latest data enters, required inputs validated, calculations performed, changes/risks/missing info flagged, commentary drafted, outputs generated, human review requested.
6. Deliverables - distinguish editable PowerPoint for management collaboration from official PDF for stable distribution or archiving.
7. Verification layer - sources, deterministic formulas, source mapping, missing-data warnings, anomaly checks, and approval.
8. Initial discovery use cases - mining/industrial and accounting/enterprise finance, clearly framed as discovery/pilot targets.
9. Private runtime and controls - explain precise data boundaries, supported deployment/runtime status, and what is not yet certified.
10. Product maturity - available now, beta, near-term planned, long-term Reporting OS.
11. Design-partner CTA - request reporting-process audit, apply for pilot, or contact sales.
12. Footer/legal - concise navigation, contact, privacy, terms, security, no template marketplace emphasis.

## I. Source Map

| File path | Content controlled | Locale | Shared or page-specific |
| --- | --- | --- | --- |
| `app/page.tsx` | Root route shell. | n/a | Page-specific |
| `components/HomePageClient.tsx` | Root renders `ProductWorkspace`. | n/a | Page-specific |
| `components/workspace/ProductWorkspace.tsx` | Authenticated workspace gate and redirect behavior. | English | Shared app |
| `components/workspace/DesktopPortalHome.tsx` | Desktop portal hero, capabilities, workflow, account summary wiring. | English | App-specific |
| `components/workspace/DesktopPortalComponents.tsx` | Download button copy, release status, connection status, walkthrough card, account summary labels. | English | Shared app |
| `components/workspace/ProductTopBar.tsx` | Brand/account/plan menu, settings labels, sign-out copy. | English | Shared app |
| `app/layout.tsx` | Global metadata title, description, icons, HTML lang default. | English | Global |
| `components/ydeck/YDeckPage.tsx` | Dormant landing page structure and section order. | en/ru/uz via dictionary | Page-specific |
| `components/ydeck/i18n/localeContent.tsx` | Dormant landing page nav, hero, agent mockup, product, workflow, use cases, privacy, templates, CTA, footer copy. | en/ru/uz | Page-specific |
| `components/ydeck/components/Navbar.tsx` | Dormant landing navbar labels/actions/language switch rendering. | en/ru/uz | Shared landing |
| `components/ydeck/components/DeckCommandCenter.tsx` | Dormant hero product mockup content placement and slide alt usage. | en/ru/uz | Shared landing |
| `components/ydeck/sections/ProductSection.tsx` | Dormant product section rendering. | en/ru/uz | Shared landing |
| `components/ydeck/sections/WorkflowSection.tsx` | Dormant workflow rendering. | en/ru/uz | Shared landing |
| `components/ydeck/sections/UseCasesSection.tsx` | Dormant use-case rendering. | en/ru/uz | Shared landing |
| `components/ydeck/sections/PrivacySection.tsx` | Dormant privacy section rendering and visual labels. | en/ru/uz | Shared landing |
| `components/ydeck/sections/TemplatesSection.tsx` | Dormant template gallery rendering, preview labels, image alt usage. | en/ru/uz | Shared landing |
| `components/ydeck/sections/FinalCTA.tsx` | Dormant final CTA rendering. | en/ru/uz | Shared landing |
| `components/ydeck/sections/Footer.tsx` | Dormant footer navigation, stats, legal links, CTA. | en/ru/uz | Shared landing |
| `components/ydeck/data/templates.ts` | Template preview data and image paths. | n/a | Shared landing |
| `components/ydeck/utils/formatters.ts` | Slide count and preview alt text. | en/ru/uz | Shared landing |
| `components/ydeck/constants.ts` | Landing language options and animation ease. | en/ru/uz | Shared landing |
| `components/ydeck/utils/routes.ts` | Localized query parameter path builder. | n/a | Shared landing |
| `lib/i18n.ts` | Waitlist and older expo landing dictionary: nav, hero, proof, problem, solution, modes, workflow, pilot, FAQ, modal, waitlist page, form. | en/ru/uz selectable; zh copy present but not in selectable locales | Shared |
| `lib/locale.ts` | Client locale detection and preference keys. | en/ru/uz | Shared |
| `lib/server-locale.ts` | Server locale detection by headers/time zone. | en/ru/uz | Shared |
| `components/WaitlistPageClient.tsx` | Public waitlist page structure. | en/ru/uz | Page-specific |
| `components/WaitlistModal.tsx` | Waitlist modal copy rendering. | en/ru/uz | Shared |
| `components/WaitlistForm.tsx` | Waitlist fields, labels, options, success/error copy. | en/ru/uz | Shared |
| `app/waitlist/page.tsx` | Waitlist route locale resolution. | en/ru/uz | Page-specific |
| `components/ydeck/data/legalPages.ts` | Privacy, terms, security legal copy. | en/ru/uz | Legal shared |
| `components/ydeck/LegalPage.tsx` | Legal page rendering and legal navigation. | en/ru/uz | Legal shared |
| `app/privacy/page.tsx` | Privacy route metadata and legal page mount. | en/ru/uz | Page-specific |
| `app/terms/page.tsx` | Terms route metadata and legal page mount. | en/ru/uz | Page-specific |
| `app/security/page.tsx` | Security route metadata and legal page mount. | en/ru/uz | Page-specific |
| `PRODUCT.md` | Internal product/design context still describing private/local-first presentation generation. | English | Internal |
| `ydeck-landing.md` | Older landing-page/expo recommendation with Private AI Presentation Agent framing. | English | Internal planning |
| `desktop-cloud-api-integration.md` | Technical evidence for ready/planned Desktop capabilities. | English | Technical docs |
| `desktop-bootstrap-contract.md` | Technical evidence for Desktop bootstrap boundary. | English | Technical docs |
| `frontend-desktop-device-integration.md` | Technical evidence for web Desktop pairing/device management. | English | Technical docs |
| `tests/workspace-shell.test.ts` | Tests confirming Desktop-first home, unavailable downloads, public landing component expectations. | English | Test evidence |
| `tests/desktop-pairing.test.ts` | Tests for pairing code behavior and route delegation. | English | Test evidence |
| `tests/desktop-portal.test.ts` | Tests for connection summary and portal media safety. | English | Test evidence |
| `tests/device-billing.test.ts` | Tests for desktop devices, billing, workspace API behavior. | English | Test evidence |

## J. Final Audit Verdict

### How Much Can Remain

Directly reusable:

- About 10 to 15 percent.
- Includes privacy/security caution, editable PPTX as a deliverable, source-material framing, pilot/waitlist infrastructure, account/device trust mechanics, and cautious legal language.

Reusable after repositioning:

- About 35 to 45 percent.
- Includes workflow structure, review concept, Desktop/private infrastructure, waitlist flow, and some visual/product proof slots.

Requires complete replacement:

- About 45 to 55 percent.
- Includes hero, product promise, use cases, template gallery, generic prompt-to-deck workflow, final CTA, footer story, Pricing nav, and broad persona targeting.

### Top Five Later Implementation Changes

1. Restore or create a true public landing route instead of routing first-time visitors to sign-in.
2. Replace the above-the-fold category from "AI presentation generator" or "Desktop presentation workspace" to "YDeck Private Reporting Agent."
3. Add a clear Skills Studio mechanism section: prior reports plus source data and rules become a reviewed, reusable company reporting skill.
4. Replace broad personas/templates with mining/industrial and accounting/enterprise finance discovery use cases, explicitly framed as pilot targets rather than proven deployments.
5. Replace self-serve deck/template/download CTAs with enterprise pilot CTAs: request reporting-process audit, apply as design partner, start pilot, contact sales.

### Private Reporting Agent Versus Reporting OS

The future page should lead with "YDeck Private Reporting Agent."

Reason:

- It is concrete and easier to understand.
- It matches the near-term customer-discovery motion.
- It does not overclaim long-term platform scope.
- It avoids presenting unimplemented Reporting OS capabilities as live product.

"YDeck Private Reporting OS" should be reserved for long-term platform vision or a lower-page roadmap/maturity section, clearly labeled as future direction.

## Answers To Special Questions

1. What would a first-time visitor currently believe YDeck is?
   - At `/`, they would believe it is a sign-in-only product. If they encountered the dormant landing copy, they would believe it is a private AI presentation/deck generator.

2. What customer segment does the page currently appear to target?
   - Broad deck creators: founders, teachers, students, companies, investors, government teams, consultants, organizations, and Desktop beta users.

3. Does the current page still sell presentation generation rather than reporting automation?
   - Yes. The dominant copy is deck generation, template previews, and PPTX export.

4. Which current sections would actively damage the new positioning if kept?
   - Dormant hero, agent mockup, product cards, broad use cases, templates, final CTA, footer stats, Pricing nav, and generic waitlist framing.

5. Which existing product capabilities remain strategically valuable?
   - Editable PPTX, source-file support, local/private workflow direction, BYOK/local-generation foundation, account/workspace/device security, pairing flow, waitlist/pilot infrastructure, and cautious security/legal posture.

6. Does the page explain Skills Studio correctly?
   - No. Skills Studio is not explained.

7. Does the page imply users manually build skills while the intended model is automatic skill extraction from previous report packs?
   - It does not discuss skills. The current implication is prompt/upload-based deck generation.

8. Does the page explain that skill extraction still requires human review?
   - No.

9. Is "Reporting OS" currently credible, or should the page initially lead with "Private Reporting Agent"?
   - Lead with "Private Reporting Agent." "Reporting OS" is not credible as the primary current claim based on repository evidence.

10. Is PowerPoint overemphasized?
    - Yes. PowerPoint/PPTX is the dominant output and often appears as the entire product value.

11. Is PDF missing or positioned only as a basic export?
    - PDF appears only as a basic export in dormant copy. It is not positioned as an official, stable, distributable, or archival report deliverable.

12. Are privacy and security claims too vague?
    - Yes. Current copy uses broad phrases like Private Mode, local-first, private by design, and secure account pairing without enough public explanation of precise data boundaries.

13. Are there unsupported enterprise claims?
    - "Designed for teams and institutions," "Private AI features," "local-first ready," provider/BYOK language, and cloud/social-agent access require tighter evidence or maturity labeling.

14. Is the current CTA suitable for customer discovery and design-partner recruitment?
    - Not yet. The waitlist form is usable infrastructure, but the CTA and fields are optimized for broad deck-making, not enterprise reporting discovery.

15. What should be preserved from the current YDeck brand and product story?
    - The serious/private tone, editable PowerPoint output, source-material transformation, trust caution, Desktop/account infrastructure, and early pilot posture should be preserved and redirected toward reporting automation.

## Verification Performed

Repository inspection:

- Inspected route wiring, live root behavior, authenticated Desktop portal components, dormant landing components, waitlist components, legal pages, locale dictionaries, templates, metadata, internal product docs, Desktop contracts, and tests.

Command verification:

- Ran `npm test`.
- Result: 57 tests passed, 0 failed.

Worktree note:

- Pre-existing dirty files were present before this document was created: `src/api/client.ts`, `tests/security-hardening.test.ts`, and `tsconfig.tsbuildinfo`.
- This audit task did not modify those files.
