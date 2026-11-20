# Marketing Product Hardening handover

## Verification on 20 November 2026

The current interactive map is `out/marketing-hardening.html`. The 12 in-scope Web Dash marketing modules, including Menu Boards, were reviewed against the local Zeus `internal` checkout at `02473c3bac9a5beabb21b3cc85d50032bb9de29d`. Source paths below start at the Zeus repository root. The earlier locally available production reference was `8a37d4f55b9`. Restaurant deployments, runtime flags and native device behaviour require separate evidence.

All 12 JSON maps passed `tools/validate.cjs` without warnings. The rebuilt HTML passed all 704 stub-DOM render checks. It contains **418 steps, 143 scenario paths, 1,136 potential failures and 73 distinct Jira tickets**. Steps marked **Internal** describe implementation verified on the branch whose production rollout is unconfirmed. The map uses upcoming labels for PRD-only steps and TBC for other unresolved behaviour. Content Calendar and design-only routes are outside scope.

| Module | What the source establishes | Source in Zeus |
|---|---|---|
| Overview | The Campaigns card uses the restaurant and selected dates. One guest reached through two delivered channels counts once. Recent independently shows the latest three launched message campaigns. Gift card figures use the restaurant closeout period. | `apps/portal/web-dash/src/legacy/components/Marketing/Overview/index.tsx`, `apps/backend/src/modules/marketing/campaign/campaign-metrics.service.ts` |
| Guest Book | Self-purchased cards belong to the purchaser. Gifted cards appear for the linked recipient. The drawer reads actual activity and available receipt details. An eligible points import can trigger a separate transactional welcome after the guest row commits. | `apps/portal/web-dash/src/modules/marketing/components/guestbook/overview/profile/GiftCardsDrawer.tsx`, `apps/cosmicjobs/src/jobs/guests/import-loyalty-sms.ts` |
| Review Management | Google, Yelp and Tripadvisor have different reply actions. Date selection persists locally, and the weekly summary uses the notification service. The missing mobile reviews in PROD-5032 still require an operational check. | `apps/backend/src/modules/review-management/review/review.service.ts`, `apps/portal/web-dash/src/modules/marketing/stores/review.store.ts` |
| Campaigns | Dedicated email and SMS creation go from type to content, audience and schedule. Multichannel has separate channel and preview steps. Direct launch, review, cancel to Draft, duplication, eligible deletion, ending placements and 30-day attribution are implemented. Attributed orders can appear on more than one campaign, but only once in the restaurant total. The inbound SMS worker records guest opt outs and restarts. | `apps/portal/web-dash/src/legacy/helpers/campaignFlows.ts`, `libs/shared/src/utils/campaignActions.utils.ts`, `apps/backend/src/modules/marketing/campaign/attribution/campaign-attribution.ts`, `apps/cosmicjobs/src/jobs/twilio/twilio.service.ts` |
| Journeys | The internal route opens the existing stages. The recurring loyalty-stage lookup returns no recipients. A transactional enrollment or import welcome can still send. The Journeys 2.0 canvas and PRD scenarios remain upcoming in this map. | `apps/portal/web-dash/src/routes/modules/marketing.ts`, `apps/cosmicjobs/src/jobs/journeys/journeys.service.ts`, `libs/milkomeda/src/module/journey/journey.service.ts` |
| Menu Boards | Canvas Save persists the design. Playlist Save publishes changes to mapped devices. The screen endpoint supports fresh reads. Autosave skips unchanged designs. Duplicated canvas items have separate identities. The deployed TV player and its offline or refresh behaviour need a device check. | `apps/portal/web-dash/src/components/CanvasEditor/index.tsx`, `apps/backend/src/modules/menu-management/menu-board/playlist/playlist.service.ts`, `apps/backend/src/modules/menu-management/menu-board/screen/screen.service.ts` |
| Website | Publishing an eligible custom domain can initiate branded email sender setup separately. Unpublishing disables that sender. The built site captures design and assets, while a published announcement fetches the active campaign and checks its dates. | `apps/backend/src/modules/web-builder/website/website.service.ts`, `libs/web-components/src/sections/AnnouncementPopup/index.tsx`, `libs/milkomeda/src/module/marketing-email/campaign-sender.ts` |
| Brand Book | Website Sync now copies brand changes to the draft. Campaign SMS generation also consumes active brand voices. The font save and website sync incidents are attached to their reported steps. | `apps/backend/src/modules/web-builder/brandBook/brandBook.service.ts`, `apps/portal/web-dash/src/legacy/components/Marketing/Campaign/CampaignForm/Content/Sms` |
| Deals | All campaigns linked to a deal must satisfy the Active or Sent rule. Ending a screen campaign leaves the underlying deal subject to its own dates and status. Online campaign audience matching omits spend. Native stacking and refund allocation still need a device check. | `apps/backend/src/modules/menu-management/deals/deal-campaigns.ts`, `apps/portal/online/utils/dealOrderSummary.ts` |
| Spotlights | Start campaign preselects the active spotlight. Inactivating a spotlight clears its reference in linked journeys. Check the refresh of an already published placement on that surface. | `apps/portal/web-dash/src/legacy/components/Marketing/Spotlights/index.tsx`, `apps/backend/src/modules/marketing/spotlight/spotlight.service.ts` |
| Loyalty | The settings form checks finite points limits against the highest active tier. Re-adding a removed item and size can restore its reward row. Reporting distinguishes returning guests from redemptions. The kiosk verification request belongs at ordering. The create and edit tier panel blocks the location switcher until the form closes. Offline POS reward display and redemption remain a device check. The server checks active items and guest points for post-payment redemption. | `apps/portal/web-dash/src/modules/marketing/features/loyalty/components/configure/GeneralSettings.tsx`, `apps/backend/src/modules/marketing/loyalty/loyalty.service.ts` |
| Gift Cards | Internal supports POS digital sales and reloads, balance merges and transfers, configurable Kiosk PIN, mixed-tender Kiosk checkout, online transaction history, and purchase-item refunds from supported POS or MoM flows. Reloads are ineligible for purchase refunds. Reconcile pending card refunds separately from completed refunds. | `apps/backend/src/modules/marketing/gift-card/gift-card-dashboard.service.ts`, `apps/backend/src/modules/user-management/user-gift-card/services`, `apps/backend/src/modules/payment-management/gift-card-refund/gift-card-refund.coordinator.ts` |

### Jira evidence

The source remains the supplied dashboard snapshot plus its two November gift card additions. Of 87 candidate tickets, 73 have a matching failure in the maps. The other 14 cover six infrastructure issues (4997 through 5002), three transactional order alerts (4721, 4745, 4949), one POS break reminder (4898), and four ordering or sales reporting issues (4768, 4816, 4847, 4860). The Jira status displayed in the HTML is historical. An unlinked failure is a QA scenario.

The full descriptions of PROD-4848, PROD-4680 and PROD-4651 were checked on 20 November. PROD-4848 asks to make the kiosk ordering verification code optional. PROD-4680 identifies missing brand swatches on media cards, a fixed email header colour and missing text hierarchy. PROD-4651 documents repeated email delivery after campaign approval. Its description does not identify the cause. Gift Cards and Website both retain PROD-4705 at the failing guest link.

### Outstanding verification

Restaurant deployment status, provider delivery or settlement, native screens, TV offline behaviour, and production worker schedules require operational evidence. Each module records its specific open questions in the map notes. The HTML can be opened directly. Publishing to Claude Artifacts remains pending because no Claude Artifact publisher is available in this session.

## Earlier handover (historical starting point)

You are picking up a half-finished task. Read this file first, then `BRIEF.md` in the same folder. Everything you need is in this folder: `c:\CODE\REPO\zeus\Marketing Product Hardening\`.

## 1. The task, in the user's words

The user is a PM on the AIO Marketing module (Web Dash, the restaurant dashboard). Paraphrased:

> We need to do a Product Hardening activity for the marketing module. The Online ordering and Catering team already did it (see their HTML). It is a step and problem analysis of every flow a person goes through in a product: each step of the flow in detail, what can go wrong at each step, what has already gone wrong at each step (Jira tickets), and what kind of problem each one is. Make a copy of their file and edit it to cover the marketing module: everything in the Web Dash marketing sidebar plus Menu Boards. This is a high-effort task; every flow must be thought through properly and every step detailed. Afterwards, use the Jira dashboard the scrum teams made to find tickets and attach them appropriately.

The marketing sidebar contains, in this order: Overview, Guest Book, Review Management, Campaigns, Journeys, Menu Boards, Content Calendar, Website, Brand Book, Deals, Spotlights, Loyalty, Gift Cards.

**User correction (later in the session): Content Calendar is not a live feature. Leave it out entirely.** That leaves 12 sub-modules.

The user cares about depth and accuracy over speed. They also follow these standing preferences:
- UI and document copy spells words out: "cannot", "does not", never contractions. No em or en dashes.
- Never commit to git unless told. Never run `graphify update`, vitest, tsc or the app. No Playwright or browser driving.
- For codebase questions in the repo, run `graphify query "<question>"` from `c:\CODE\REPO\zeus` before grepping (the repo's CLAUDE.md rule).
- Folders named `prototype` and anything behind a `?flow=` URL flag are design prototypes on sample data, not the live product.

## 2. Source material (in `src/`)

| File | What it is |
|---|---|
| `src/overview-product-hardening.pdf` | One-page overview of the exercise: Red to Yellow to Light Green to Green zones; a journey diagram of customer steps with potential errors under each node; per error: what goes wrong, source, frequency and severity, owner, fix status. Inputs: field (ops and care), NAT team, and new errors the PM thinks of. |
| `src/hardening-online-catering.html` | The Online ordering and Catering team's artifact. Our page copies its structure: lettered stages (A, B, C) holding numbered steps (A1, A2), each step with errors; a path picker that numbers the steps of one scenario; a detail drawer; an All errors table. |
| `src/jira-dashboard.html` | The scrum teams' "Production issues by workflow" Jira dashboard (snapshot 10 Nov 2026, PROD project). Its `DATA.rows` and `FD.sub` objects hold the tickets and the scrum team's per-area root-cause notes. |

## 3. What has been built (all in this folder)

| Path | Purpose |
|---|---|
| `BRIEF.md` | The full instructions given to each research agent: goal, whose journey (operator and guest), where to look in the code, the JSON schema, field rules, severity and bucket definitions, writing style, how to attach tickets. **Any new map must follow it.** Its paths already point at this folder. |
| `out/tickets.json`, `out/tickets.txt` | The 87 marketing-related PROD tickets (created 1 Sep to 16 Nov 2026) pulled from the dashboard snapshot plus two newer gift card tickets fetched live (5111, 5099). `tickets.txt` is the readable list with root-cause notes and the scrum team's sub-area notes at the bottom. |
| `tools/extract-tickets.cjs` | Regenerates the two ticket files from `src/jira-dashboard.html`. Only needed if tickets are refreshed. |
| `tools/validate.cjs` | Validates one sub-module JSON: schema, ids, kinds, severities, buckets, every edge and path step exists, every consecutive path pair is an edge, every ticket number exists in `out/tickets.json`, no contractions, no dashes. Run: `node tools/validate.cjs marketing/<key>.json` from this folder. Must print `OK`. |
| `tools/shell.html` | The page template (copy of the Online and Catering design, plus: sub-module switcher, an "Operator" step kind, Jira tickets with status under each error, a type-of-problem filter and a "Seen in Jira" filter, NOTES per map). Data is injected at `/*DATA*/`. |
| `tools/build.cjs` | Builds the single page from `tools/shell.html` + every `marketing/*.json` + `out/tickets.json`. Run: `node tools/build.cjs tools/shell.html marketing out/tickets.json out/marketing-hardening.html --smoke`. Prints totals, MISSING sub-modules, tickets not attached anywhere, and runs a stub-DOM smoke test of every path and step. Sidebar order is the `ORDER` array at the top (Content Calendar already removed). |
| `out/marketing-hardening.html` | Latest build (6 sub-modules). Not published yet. |
| `marketing/*.json` | One map per sub-module (see status below). |

## 4. Status of each sub-module

All six existing files pass `validate.cjs` with OK.

| Key | Status | Stages / steps / paths / errors (critical) | Tickets attached |
|---|---|---|---|
| `menuboards` | Done, reported | 10 / 43 / 14 / 141 (12) | 25: all Menu Boards tickets |
| `giftcards` | Done, reported | 11 / 58 / 15 / 193 (29) | 11: 4643 4705 4810 4869 4871 4938 4952 5017 5043 5099 5111 |
| `loyalty` | Done, reported | 11 / 41 / 15 / 125 (10) | 5: 4848 4888 4919 4966 4976 |
| `website` | Done, reported | 9 / 51 / 14 / 167 (13) | 26: all Website tickets |
| `brandbook` | Done, reported | 5 / 20 / 6 / 48 (0) | 2: 4781 4836 |
| `campaigns` | **Draft, needs review.** The agent wrote and validated it but was stopped before its final pass and report. Read it through against the code before treating it as done. | 9 / 51 / 16 / 171 (20) | 2: 4651 4680 |
| `journeys` | **Not started** (agent stopped before writing) | | none expected in the list |
| `deals` | **Not started** | | 4673 (maybe 4898) |
| `spotlights` | **Not started** | | none obvious |
| `guestbook` | **Not started** | | 5045 |
| `overview` | **Not started** | | none obvious |
| `reviews` | **Not started** (Review Management) | | 5032 |

Note: 4705 (Digital gift cards 404 on website) is attached in both `giftcards` and `website`, which is correct.

### Starting points for the unstarted ones (also in the agent prompts that were used)

- **Journeys** (large): UI `apps/portal/web-dash/src/legacy/containers/Marketing/Journeys`, `legacy/components/Marketing/Journey`; backend `apps/backend/src/modules/marketing/journey`, `ai-journey`, `track`, plus wherever journey steps are evaluated and sent (crons or queues in the other apps under `apps/`, notifications, Twilio and email clients in `libs/`). Trace triggers and entry rules, delays, branches, sends, consent, editing a live journey, analytics. `modules/marketing/features/journeys/prototype` is NOT live. Upcoming only: `PRD Journeys 2.0.md`, `Journeys changes.md` in the repo root.
- **Deals** (large, money): UI `legacy/containers/Marketing/Deals`, `legacy/components/Marketing/Deal`, `modules/marketing/features/deals` (ignore `prototype`). Backend: find the deal or discount entities in `libs/oriongrid/src/entities` and how `order-management` applies a deal. Guest side `apps/portal/online`. Trace deal types, scope (menu item limit: 4673), eligibility, auto-apply versus manual, stacking with loyalty and gift cards, tax and service charge maths, device sync, edits, expiry, refunds, reporting. Upcoming: `Menu and Category IDs PRD.md` (release 9.0).
- **Spotlights** (small): UI `legacy/containers/Marketing/Spotlights`, `legacy/components/Marketing/Spotlights`; backend `modules/marketing/spotlight`, `active-spotlights`, `active-announcement`, `featured-ad`. Trace types, creation (media, link, schedule, channels), where they show, expiry, broken links.
- **Guest Book** (large, the CRM every other module reads): UI `modules/marketing/features/guestbook`, `modules/marketing/components/guestbook` (`overview`, `segments`, `configure`), `legacy/containers/Marketing/GuestBook`, `legacy/components/Marketing/Guestbook`; backend `guest-management`, `customer-management`, entities. Trace every way a guest is created (online sign-up, POS or Kiosk phone capture, loyalty, gift cards, website forms, imports), duplicate matching, list and profile, segments and recalculation, consent and opt-out propagation, delete or anonymise (CCPA), the walk-in or dummy guest.
- **Overview** (small, reporting): `legacy/containers/Marketing/Overview`, `legacy/components/Marketing/Overview`, `modules/marketing/components/overview`; backend `modules/marketing/overview`, `marketing-dashboard`. Trace each card to its data and the page it links to; errors are mostly numbers not matching their source page, date ranges, time zones, multi-location, empty states.
- **Review Management** (small to medium, also called ARM): UI `modules/marketing/features/reviewManagement`, `modules/marketing/components/reviewManagement` (`armOnboarding`, `overview`, `insights`, `Filters`, `Card`), `legacy/.../ReviewManagement`; backend `apps/backend/src/modules/review-management`, the review entity, any sync cron, AI replies, MoM endpoints. Trace connecting Google Business Profile, token expiry and reconnect (5032), import and sync, list and filters, manual and AI replies, posting back, alerts, insights, MoM, disconnect.

## 5. What the finished maps found (useful context, and things to tell the user)

- **Menu Boards:** three different renderers (editor, preview, and a text layout measured in the operator's browser for the TV) explain the "looks different on the TV" and "prices cut off" tickets. Menu timings are copied into the board at design time; the TV hides items outside them but preview ignores them. The server keeps each TV's content up to 10 hours and saving a board does not refresh it. Schedules sit on each TV and playlist pair. The Screens page shows "Live" without checking the TV is online. If a saved board fails to load, the editor opens a blank one and the 30-second autosave can overwrite the real board. The TV app is not in the repo, so its behaviour is inferred.
- **Gift Cards:** an outside processor (eCard Systems) holds the real balance; AIO keeps a copy, and several money steps update the two separately, so they can disagree (charged with no card, debited with no payment). Possible security gaps for engineering: unauthenticated lookups that return full card numbers by phone and the PIN by card number, error messages that reveal which of number or PIN was wrong, a webhook signing secret written to logs. Migrated cards cannot be spent directly on POS. No operator tools to refund, deactivate, adjust, resend or view history. Overview totals cover the selected dates but all locations.
- **Loyalty:** earning is fixed at 100 points per dollar of the discounted subtotal before tax (tax-inclusive restaurants earn on the pre-discount price). No earn-rate setting, expiry, sign-up bonus, manual adjustment or liability report in live code. Rewards are free items in tiers (threshold at least 500, up to 25 items). The CFD balance check and deduction are not locked together (possible double redemption). Partial refunds remove points including tax and tip, floored at zero. Upcoming Loyalty 2.0 steps sit in the last stage.
- **Website:** the live site is a static build frozen at publish time (menu, deals, hours, fonts, tags need a republish). Custom domain go-live waits for domain and certificate verification. The sitemap URL only refreshes when the builder is opened (4793). The old Order Online link check rejected capitals, query strings and long domain endings (4841, 4923). No AI site generation in live code.
- **Brand Book:** fonts not marked Done are dropped on save; "Sync now" is a one-time copy into the website draft, not a live link. Saving updates or deletes items by id without checking ownership (possible security gap). Nothing reads brand voice yet.

## 6. How to finish

1. For each unstarted sub-module, read `BRIEF.md`, research the code (graphify first), and write `marketing/<key>.json`. Write a first full draft early, then refine. Validate until OK. Large ones aim for about 30 to 50 steps, small ones 12 to 25.
2. Review `marketing/campaigns.json` against the code (it never got its final pass). Upcoming items from `Campaigns Revamp PRD.md` (a stale 9 Oct copy; the current PRD is in Notion, page `e3b5b13baaa383af9adc810535192f84`) must be marked with `rel` and kept to a handful of steps.
3. Run the build with `--smoke`. Check the "unattached tickets" list it prints: every ticket that truly belongs to marketing should end up on an error. Infra items (Node.js CVE tickets 4997 to 5002) and non-marketing items stay unattached by design.
4. Publish `out/marketing-hardening.html` as a claude.ai Artifact (the page follows the artifact page contract: tokens on `:root`, dark mode blocks, title "Marketing Product Hardening", icon `map`). Give the user the link.
5. Tell the user what you found per sub-module and list the things that could not be confirmed (each map's `NOTES` array holds them).

## 7. Why the work stopped

The first attempt launched nine research agents in parallel and the account hit its usage limit twice. Running them in waves of three worked. The user then asked to stop and hand over. If you use sub-agents, run at most three at a time and tell each to save its draft early.
