# Brief: Product Hardening map for one AIO marketing sub-module

## What we are making

AIO (restaurant platform: POS, mPOS, Kiosk, KDS, Online ordering, MoM mobile app, Web Dash) is running a "Product Hardening" exercise. For every product, a PM writes one map: **every step a person goes through in the product, in order, and under each step everything that can go wrong there**, plus the production tickets that already went wrong there, plus what kind of problem each one is. The goal is to move products from "errors keep surfacing in the field" to "known errors mapped and fixed".

The Online ordering and Catering team has already made theirs. We are making the same thing for the **Marketing module** of Web Dash, which has 13 sub-modules: Overview, Guest Book, Review Management, Campaigns, Journeys, Menu Boards, Content Calendar, Website, Brand Book, Deals, Spotlights, Loyalty, Gift Cards. Each sub-module gets its own map ("channel"). **You own one or two of them**, named in your task prompt.

You do two things: (1) read the code until you really understand how that sub-module works end to end, (2) write the map as a JSON file in the exact schema below. Depth and accuracy matter more than speed: every flow thought through, every step detailed, errors specific to how this product actually works.

## How the map is structured

- **Stages** (`BANDS`): lettered A, B, C... in journey order. A stage is a phase of the journey, for example "A. Enablement and setup", "C. Build the email", "F. Guest redeems at POS".
- **Steps** (`NODES`): numbered inside their stage: A1, A2, B1... One step is one thing a person does, one thing the software does, one hand-off to another system, or one decision. Roughly one screen, one action or one system event per step.
- **Errors**: listed under each step. Each has what goes wrong, the impact, a severity, the type of problem, and the Jira tickets that evidence it.
- **Edges**: which step leads to which, with a label when it is a branch.
- **Paths**: named end-to-end walks through the steps, one per realistic scenario (the baseline happy path, then each variant and each recovery or exit path). The viewer lets a reader pick a path and see only its steps numbered in order.

## Whose journey

Marketing has two people in it, and the map must follow both, plus the systems between them:

1. **The operator** (restaurant owner, manager, or AIO Ops/onboarding staff) who sets things up in Super Admin, Web Dash, MoM or on the POS. Kind `op`.
2. **The guest** (the restaurant's customer) who receives the email or text, sees the deal, earns and redeems points, buys or spends the gift card, leaves the review, looks at the menu board or the website. Kind `cust`.

A complete map of a sub-module normally runs through these phases. Use them as a checklist and adapt the stages to your sub-module; do not copy the list blindly:

1. Enablement and setup: module switched on for the restaurant (Super Admin or Ops dashboard), roles and permissions, prerequisites and integrations (Twilio, SendGrid or the email service, Google, Meta, Adyen, domains, devices), first-time onboarding.
2. Operator creates or configures: every screen, tab, wizard step, required field, validation and decision in Web Dash.
3. Review, save, approve, publish, schedule, activate.
4. What the system then does: jobs, queues, crons, sends, syncs to devices, webhooks, AI generation.
5. Where the guest meets it, on **every** channel it reaches: POS, mPOS, Kiosk, CFD, Online ordering, email, SMS, the restaurant website, the TV, Google.
6. After: edit, pause, duplicate, delete, expire, refund, void, cancel, unsubscribe, offboarding.
7. Measuring: dashboards, reports, analytics, exports, reconciliation with sales and accounting.

Also think about: multi-location tenants, time zones, permissions, concurrency (two managers, two devices), empty and first-run states, limits, what happens when a referenced thing (menu item, segment, template, guest) is later changed or deleted, and offline devices.

## Where to look

Repo root: `c:\CODE\REPO\zeus` (NestJS backend, React Web Dash, Next.js online ordering).

- Web Dash marketing UI (live): `apps/portal/web-dash/src/legacy/containers/Marketing/*`, `apps/portal/web-dash/src/legacy/components/Marketing/*`, `apps/portal/web-dash/src/modules/marketing/*`. Some sub-modules live elsewhere in `apps/portal/web-dash/src/legacy/` (Website builder, Menu Boards, Content Calendar); find them.
- Backend: `apps/backend/src/modules/marketing/*`, `web-builder/*`, `review-management`, `guest-management`, `customer-management`, `order-management`, `payment-management`, `notifications-management`, `devices-management`, `menu-management`; entities in `libs/oriongrid/src/entities`; shared types in `libs/shared`.
- Online ordering (guest side): `apps/portal/online`. Ops / Super Admin dashboard: `apps/portal/dashboard`.
- The POS, mPOS, Kiosk, KDS, MoM and menu board TV apps are **not** in this repo. Work out what they do from the backend endpoints, DTOs, MQTT topics and webhooks they consume.
- PRDs and QA notes sit as `.md` files in the repo root; your task prompt names the relevant ones.

**Start with the knowledge graph.** The project rule is: run `graphify query "<question>"` from the repo root before grepping raw files (also `graphify explain "<concept>"`, `graphify path "<A>" "<B>"`). It returns a scoped subgraph with file paths and line numbers. Then read the files it points to. Never run `graphify update`.

**Live versus not live.** Map the product as it is in production. Folders named `prototype` under `apps/portal/web-dash/src/modules/marketing/features/*/` and anything gated behind a `?flow=` URL flag are design prototypes on sample data, not the product: do not map them as live. If a PRD in the repo root clearly describes an upcoming change that alters the journey, you may add a small number of steps for it, marked with `rel` (see below). Everything else is `rel: "L"`.

**Hard rules.** Read-only on the repository: do not create, edit, format or delete any file under `c:\CODE\REPO\zeus` other than your own output JSON in `Marketing Product Hardening\marketing`, do not run git commands that change anything, do not start the app, do not use a browser. The only file you write is your output JSON.

## Output

Write one file per sub-module to:

`c:\CODE\REPO\zeus\Marketing Product Hardening\marketing\<key>.json`

(the `<key>` for each of your sub-modules is in your task prompt). Then validate it and fix every ERROR line (and the warnings that are fair) until it prints OK:

`node "c:\CODE\REPO\zeus\Marketing Product Hardening\tools\validate.cjs" "<your file>"`

### Schema

```json
{
  "key": "campaigns",
  "name": "Campaigns",
  "title": "Campaigns: operator and guest paths and what can go wrong",
  "BANDS": [
    { "id": "A", "t": "Enablement and setup", "s": "One line on what this stage covers" }
  ],
  "NODES": [
    {
      "id": "A1", "b": "A", "k": "op", "rel": "L",
      "t": "Short step title",
      "d": "One or two sentences on what happens here, naming the real screen, setting, field, job or endpoint behaviour.",
      "sys": ["Web Dash: Campaigns", "SendGrid"],
      "e": [
        ["What goes wrong, specific and observable", "Impact in a few words", "H", "CN,CX", []],
        ["Another failure", "Its impact", "C", "L", ["4651"]]
      ]
    }
  ],
  "EDGES": [["A1", "A2", ""], ["A2", "B1", "Label for a branch"], ["A2", "C4", "Optional or background link", 1]],
  "PATH_GROUPS": ["Core", "Scheduling", "After sending"],
  "PATHS": [
    { "id": "P01", "g": 0, "t": "Path title", "n": "One line on what makes this path different.", "s": "A1 A2 B1 B2", "side": "D3" }
  ],
  "NOTES": ["Assumptions you made and things you could not confirm from the code, one per line"]
}
```

Field rules:

- `BANDS[].id`: one capital letter, in journey order. Typically 6 to 12 stages for a large sub-module, 4 to 7 for a small one.
- `NODES[].id`: stage letter + number, unique. List nodes in the order they should be read inside their stage.
- `k` (kind): `op` operator action, `cust` guest action, `soft` software action (AIO does something by itself), `int` hand-off to or from another product or third party (POS, Kiosk, KDS, Twilio, SendGrid, Google, Adyen...), `dec` decision or branch (title is a question), `term` start or end of a journey.
- `rel`: `L` live today. `R8`, `R9`, `R10` only when a PRD names that release. `NEXT` upcoming per a PRD but release not named. `TBC` you could not confirm the behaviour from the code and it needs checking with engineering.
- `t`: short, sentence case, ideally 2 to 6 words. Decisions are questions.
- `d`: what happens, in plain words, with the real names of settings and fields. Mention limits and rules you found in the code (max lengths, caps, statuses, cron timings).
- `sys`: the AIO products and third parties involved at this step. Use these names where they apply: "Super Admin", "Ops dashboard", "Web Dash: <page>", "POS", "mPOS", "Kiosk", "CFD", "KDS", "MoM", "Online ordering", "Menu Manager", "Guestbook / CRM", "Marketing Loyalty", "Marketing Deals", "Marketing Gift cards", "Marketing Campaigns", "Marketing Journeys", "Website builder", "Brand Book", "Twilio", "SendGrid", "Email service", "Adyen", "Google Business Profile", "Meta", "OpenAI" (or whichever AI provider the code uses), "S3 / CDN". Empty array if none.
- `e` (errors): each is exactly `[what, impact, severity, buckets, tickets]`.
  - `what`: one specific, observable failure at **this** step. Not "validation fails" but "End date before start date accepted, deal never becomes active". Ground it in how the code works: a missing validation you saw, a race, a cache, a cron boundary, a time zone conversion, a webhook that can be lost, a setting one product writes and another reads, a rounding rule, a permission check on the client only. Also include the failures a seasoned restaurant-tech PM would expect at this step even if the code handles them today (the map is a checklist for QA), but never invent product behaviour that does not exist.
  - `impact`: the consequence for the guest, the restaurant or AIO, a few words.
  - `severity`: `C` critical: money charged or given away wrongly, legal or compliance exposure (TCPA, CAN-SPAM, CCPA, ADA, PCI, tax), privacy or security breach, data loss, or the feature is completely unusable for the restaurant. `H` high: wrong outcome for a guest or operator, contained or with a workaround. `M` medium: friction, confusion, extra work. `L` low: cosmetic or minor.
  - `buckets`: comma-separated, one to three of: `M` Math / Accounting (amounts, points, balances, discounts, tax, rounding). `L` Legal, Compliance. `S` Platform security (auth, permissions, tenant isolation, abuse, fraud). `OB` Onboarding, Offboarding (enablement, setup, migration, device mapping, churn). `D` Data storage (lost, duplicated, stale or mismatched records). `B` Billing (what AIO or a provider charges the restaurant: SMS credits, plan limits, fees). `R` Reports (dashboards, analytics, exports, reconciliation). `CN` Consumptions (something set up or recorded in one AIO product is not picked up correctly by another: POS, mPOS, Kiosk, Online ordering, KDS, MoM, Menu Manager, Guestbook, website, TV). `CX` Customer experience (guest or operator facing usability and messaging). `T` Tech debt (performance, crashes, stale caches, race conditions, missing retries, brittle integrations).
  - `tickets`: array of Jira PROD ticket numbers as 4-digit strings, `[]` when none. See below.
  - Aim for 2 to 7 errors per step, more on the steps where money, consent, points, publishing or cross-product sync happens. Order does not matter (the viewer sorts by severity).
- `EDGES`: `[from, to, label]` plus an optional 4th element `1` for a dashed, optional or background link (side effects such as "email receipt sent", or an entry from a header link). Label branches out of decisions; `""` otherwise. Every step except a `term` end needs a way out; every step except a `term` start needs a way in. Loops back are fine.
- `PATHS`: `s` is the ordered step ids separated by single spaces; **every consecutive pair must be an edge**. A step may repeat (loops). `side` lists steps triggered along the way that are not on the main line (optional, `""` if none). Give 6 to 20 paths for a large sub-module, 3 to 8 for a small one, grouped by `PATH_GROUPS` (`g` is the group index). Cover: the baseline, each major variant, each channel the guest can meet it on, each recovery path (failure then retry), each exit path, and the after-the-fact paths (edit, pause, refund, delete, report). Every step should be on at least one path.
- `NOTES`: honest list of what you assumed or could not confirm.

### Size

Large sub-modules (Campaigns, Journeys, Loyalty, Deals, Gift Cards, Guest Book, Menu Boards, Website): about 30 to 50 steps. Small ones (Overview, Review Management, Content Calendar, Brand Book, Spotlights): about 12 to 25 steps. Go by what the product actually has; do not pad, do not skip.

### Writing style (the validator enforces some of this)

- Plain, concrete, short. Write for a QA engineer or ops person who knows restaurants but not the code. No file names, function names or table names in the text; describe the behaviour instead.
- **No contractions**: write "cannot", "does not", "is not", "will not". No em dashes or en dashes; use a comma, a colon or a full stop.
- British spelling to match the reference ("customise", "authorise", "colour", "fulfilment"). Sentence case. No trailing full stop on error text or impact.
- Say "guest" for the restaurant's customer and "operator" for restaurant staff using Web Dash.
- Do not name real restaurants.

### Reference: three steps from the Online ordering map (tone and granularity to match)

In that file the 5th element of an error was a flag; in ours it is the ticket array.

```json
{ "id": "A3", "b": "A", "k": "dec", "rel": "L", "t": "Is ordering open right now?",
  "d": "Business hours, online ordering timings, scheduled order settings and busy mode decide what the customer gets: order now, schedule only, or view the menu with ordering turned off. Busy mode pauses ASAP ordering for a set time so the kitchen does not overflow, and the customer can schedule or wait.",
  "sys": ["Web Dash: Online settings", "Business Hours", "MOM"],
  "e": [
    ["Store shown as closed during open hours (time zone or split-shift gap misread)", "Orders lost during service", "C", "CN", []],
    ["Store accepts ASAP orders after closing time", "Kitchen gets orders it cannot make", "C", "CN,CX", []],
    ["Busy mode does not lift when the timer ends", "Lost sales after the rush", "H", "CX", []],
    ["Status does not change at the open or close boundary until the page is refreshed", "Customer sees stale availability", "H", "T,CX", []],
    ["Countdown, back-at time or next opening time missing or wrong", "Customer leaves instead of coming back", "M", "CX", []]
  ] },
{ "id": "E6", "b": "E", "k": "cust", "rel": "L", "t": "Redeem loyalty reward",
  "d": "Signed-in only. Multi-item redemption, points limits, rewards on priced modifiers, tiered discounts (R9).",
  "sys": ["Marketing Loyalty", "Guestbook / CRM"],
  "e": [
    ["Points balance differs from Kiosk or POS", "Customer disputes the balance", "H", "CN,D", []],
    ["Points deducted but discount not applied", "Customer loses value", "C", "M", []],
    ["Points redemption limit not enforced", "Over-redemption", "H", "M", []],
    ["Reward applied to the wrong item in a multi-item cart", "Wrong discount value", "H", "M", []]
  ] },
{ "id": "G5", "b": "G", "k": "soft", "rel": "L", "t": "Adyen authorises payment",
  "d": "Authorisation, including 3D Secure when the bank requires it.",
  "sys": ["Adyen"],
  "e": [
    ["Payment authorised but order not created", "Customer charged with no order", "C", "M,D", []],
    ["Timeout leaves the customer unsure if they were charged", "Duplicate attempts", "C", "CX", []],
    ["Retry after a timeout charges twice", "Duplicate charge", "C", "M", []]
  ] }
```

The full reference file is at `c:\CODE\REPO\zeus\Marketing Product Hardening\src\hardening-online-catering.html` (large; the data starts at `const BANDS = [`; read a slice only if you need more examples of paths and edges).

## Jira tickets: what has already gone wrong

`c:\CODE\REPO\zeus\Marketing Product Hardening\out\tickets.txt` lists the 87 production tickets (project PROD, created 1 Sep to 16 Nov 2026) that touch marketing, with status, module, product area, title and root-cause notes where the scrum team wrote one, followed by the scrum team's notes per sub-area. Read all of it once.

- For every ticket that belongs to **your** sub-module, attach its number to the error it is evidence of (5th element, for example `["4651"]`). If no error on the right step describes that failure yet, add one, worded as the general failure (no restaurant names), informed by the root-cause note.
- Bugs and feature requests both count: a feature request shows a gap at a step.
- A ticket may be attached to more than one error only if it truly shows both.
- Do not attach tickets that belong to another sub-module, and ignore the ones that are not really marketing (Node.js CVE upgrades, POS payment mismatches and so on).
- If the tickets show a step you had not mapped (a device that will not boot, a migration, a sync), add the step.

## What to send back

When the file validates, reply with a short report (under 250 words): the file path(s), counts (stages, steps, paths, errors, tickets attached), the three or four most important things you learned about how the sub-module really works that shaped the map, and anything you could not confirm. Do not paste the JSON.
