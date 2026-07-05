<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pathway AI — Agent Handoff

This section is written so a different AI coding assistant (Codex, or anyone
else) can pick up this project mid-stream with no prior context. It reflects
the real, current state of the repo as of this commit, not the original plan.

Read this fully before making changes. If anything here conflicts with what you
observe in the code, trust the code and treat this section as possibly stale,
but it was accurate at time of writing.

---

## What this project is

Pathway AI is a free, no-login student career readiness web app. Four AI-powered
tools in one connected flow:

1. **Resume Checker** (`/resume-checker`) — paste or upload a resume (PDF/DOCX/TXT)
   plus a job description, get a match score, keyword gaps, and improvements.
2. **Career Path Explorer** (`/career-path`) — enter major/interests, get three
   realistic career paths with progression and required skills.
3. **Skill Gap Roadmap** (`/skill-gap`) — enter current skills and target role,
   get a prioritized, step-by-step learning plan.
4. **Mock Interview Coach** (`/interview`) — enter a role, answer generated
   interview questions, get scored feedback with model answers.

All four are **fully built, AI-powered, and live in production**, this is not an
MVP. Every module calls Claude for real analysis; nothing is a placeholder.

**Live URL:** https://pathway-aiapp.vercel.app
**GitHub:** https://github.com/Dave-ASC1/pathway-ai (branch: `main`, auto-deploys to Vercel)

Originally an IST 440W capstone project, but the operating instruction from the
user partway through was: **ignore grading/capstone requirements, build the real
product.** Treat this as a genuine product, not a school assignment, unless the
user explicitly asks for grading-related documents.

---

## Tech stack

```
Next.js 16 (App Router, Turbopack)
React 19
TypeScript
Tailwind CSS 4  (no tailwind.config.ts, @import "tailwindcss" in globals.css)
@anthropic-ai/sdk  — all AI calls, server-side only
Vercel             — hosting, deploy, analytics
```

No auth, no database. Two lightweight client-side stores instead (see below).

Commands:
```bash
npm run dev     # localhost:3000 — NOTE: AI features fall back to non-AI mode
                # locally unless ANTHROPIC_API_KEY is in .env.local (gitignored,
                # not present in this repo). Test AI behavior against production.
npm run build   # must pass clean before any commit
npm run lint    # must pass clean before any commit
```

---

## Architecture patterns (read before touching any module)

### 1. API routes, one per AI feature, all server-only

```
app/api/analyze-resume/route.ts     (resume checker — has a local fallback!)
app/api/career-path/route.ts
app/api/skill-gap/route.ts
app/api/interview/questions/route.ts
app/api/interview/evaluate/route.ts
app/api/parse-resume/route.ts       (PDF/DOCX/TXT text extraction, not AI)
```

Shared pattern in every AI route:
- `checkRateLimit(req, { name, limit, windowMs })` from `lib/rate-limit.ts`, called
  first, before any Claude call, so blocked or invalid requests cost nothing.
- Input length caps (413 if exceeded) before calling Claude.
- Model is always `"claude-opus-4-8"`, do not downgrade unless the user says to.
- Prompts explicitly instruct: "do not use em dashes or en dashes... keep the
  tone natural and human", this is intentional (see Brand rules below) and
  must be kept in any new or edited prompt.
- Claude is asked to return raw JSON; responses go through an `extractJson()`
  helper (strips markdown fences, finds the `{...}` substring) before
  `JSON.parse`.
- Only `analyze-resume` has a deterministic **local fallback** (keyword matching,
  no AI), this is historical (it was the original MVP logic) and intentionally
  kept as a safety net if the Claude call fails. The other three routes just
  return a clean error message on failure; they do not have fallbacks.

### 2. Session continuity, lib/session.ts

This is the most important non-obvious piece of architecture. Each module's
inputs and results are persisted to `sessionStorage` via a custom hook:

```ts
const [value, setValue] = useSessionState("namespace:key", initialValue);
```

Built on `useSyncExternalStore` (SSR-safe, no hydration mismatch). This means:
- Navigating away from a module and back **restores everything** (inputs and
  results), this was a specific bug fix; do not regress it by switching any
  module back to plain `useState` for its primary fields.
- Cross-module handoffs write directly into the destination module's session
  key so the receiving page just works, no URL params needed. For example,
  finishing a resume analysis auto-writes `roadmap:currentSkills` and
  `interview:role` if those are still empty (`readSession` check first, so it
  never clobbers something the user already typed).
- Keys in use: `resume:text`, `resume:jd`, `resume:hasAnalyzed`, `resume:analysis`,
  `resume:source`, `career:major`, `career:year`, `career:interests`,
  `career:industries`, `career:result`, `roadmap:currentSkills`,
  `roadmap:targetRole`, `roadmap:result`, `interview:role`, `interview:questions`,
  `interview:answers`, `interview:evaluations`, `interview:phase`.
- The dashboard/journey hub (`app/dashboard/dashboard-client.tsx`) reads these
  same keys read-only to compute progress (has the user done each step yet).

**Gotcha:** initial values passed to `useSessionState` must be stable references
for arrays or objects (module-level constants), not new literals per render, or
`useSyncExternalStore` will warn or loop. See `EMPTY_QUESTIONS` etc. in
`interview-client.tsx` for the pattern; primitives (`""`, `false`, `null`) are
fine inline.

### 3. Saved results, lib/history.ts (different from session storage)

This is a separate, deliberate, user-triggered persistence layer using
`localStorage` (not sessionStorage) so it survives closing the tab:

```ts
saveItem(type, title, data)   // "Save result" button on each module
useSavedItems()               // reactive read, used by /saved page
deleteItem(id)
```

Do not conflate this with `lib/session.ts`. Session storage is automatic,
ephemeral, per-tab continuity. History or saved is explicit, permanent (until
deleted), cross-tab-visible via `localStorage`.

### 4. Rate limiting, lib/rate-limit.ts

In-memory, per-IP, fixed-window. Known limitation, accepted deliberately:
Vercel runs multiple warm instances, so the effective limit is roughly
`limit x active instances`, not a hard global cap. This was a conscious
tradeoff (user chose "in-memory, zero setup" over "Upstash Redis, robust but
needs a new account"), do not silently "fix" this by adding Upstash unless
asked; it's a known, accepted gap, not a bug.

---

## Brand rules, do not violate these

- **Colors** (CSS vars in `globals.css`): `--deep-navy #041336`, `--strong-navy
  #000080`, `--brand-blue #3b82f6`, `--soft-blue #60a5fa`. Module identity colors
  (used consistently across Saved-page badges, journey hub stops, keyword
  chips): resume=blue, career=green (#166534/#16a34a), roadmap=amber
  (#a16207/#d97706), interview=purple (#7c3aed).
- **Logo**: diagonal ascending line, 4 dots, first 3 hollow, 4th solid light
  blue. `app/components/PathwayLogo.tsx`. Do not change the dot pattern.
- **"Pathway AI" everywhere in the UI, never "Claude" or "Anthropic".** The
  backend uses Claude; visitors must never see that. If you add a new
  user-facing loading or status string, say "Pathway AI is..." not "Claude
  is...". (Backend code, this file, README, etc. can say Claude/Anthropic freely.)
- **No em dashes or en dashes anywhere a user reads text**, not in JSX copy,
  not in AI prompt output (the prompts explicitly instruct Claude to avoid
  them too). The user considers em dashes an AI tell and has asked for this
  repeatedly. Use commas, periods, or parentheses instead.
- **Sentence case, short sentences.** The user's professor gave feedback that
  the site was too wordy; a large trim pass (commit `6c20417`) cut most
  paragraph-length copy down to one short line. Keep new copy in that register,
  don't reintroduce paragraph blocks in module intros or landing sections.

---

## UI structure

```
app/
  page.tsx                    — public landing page: logo, one headline, the
                                JourneyBoard, and a footer (the old marketing
                                sections were removed in the journey-board redesign)
  layout.tsx                  — root layout, metadata, Vercel Analytics
  globals.css                 — ALL styling lives here, no CSS modules
  error.tsx / global-error.tsx / not-found.tsx  — branded error/404 states
  robots.ts / sitemap.ts / opengraph-image.tsx  — SEO
  icon.svg                    — favicon (Pathway logo mark)
  components/
    AppShell.tsx               — sidebar nav + layout wrapper for all app pages
    PathwayLogo.tsx            — logo component, links to "/"
    PathwayLoader.tsx          — branded loading animation (dots dropping in a
                                  stair pattern), reused across every module's
                                  loading state
    ScoreGauge.tsx             — circular color-graded score ring (resume checker)
    JourneyBoard.tsx           — the game-board entry: a switchback road with 4
                                  progress-aware module stops, an auto-driving/
                                  hover car, and fireworks at the goal. Rendered
                                  by BOTH page.tsx (context="landing") and the
                                  dashboard (context="workspace"). See redesign below.
  dashboard/
    page.tsx + dashboard-client.tsx   — "Journey" hub. dashboard-client is now
                                         just <JourneyBoard context="workspace" />
                                         (an "X of 4 steps done" heading + the board)
  resume-checker/  career-path/  skill-gap/  interview/  saved/
    page.tsx (server wrapper, just mounts AppShell + client component)
    <name>-client.tsx (all logic, "use client")
```

Nav route `/dashboard` is internally still called "dashboard" in code
(`active="dashboard"`, session key namespace unaffected) but the **visible nav
label is "Journey"**, this was a deliberate rename, don't revert one without
the other.

---

## Journey board redesign (current), read this before touching the entry pages

This is the current state and supersedes an earlier step-path dashboard. The
professor said the site was too wordy and should feel like a simple, stylized
game the student plays to move through the four tools. After confirming scope
(a styled board, NOT a literal dice-and-tiles game; merge landing and dashboard
into one experience), the built direction is:

- A shared component, `app/components/JourneyBoard.tsx`, renders a winding
  "switchback road" (smooth C1-continuous bends, echoing the logo's ascending
  4-dot line) with the four modules as color-coded stops (resume=blue,
  career=green, roadmap=amber, interview=purple) ending at a navy "Career-ready"
  star goal. Stops fill with a checkmark and pulse the next incomplete one,
  computed from the same `lib/session.ts` progress keys (`resume:hasAnalyzed`,
  `career:result`, `roadmap:result`, `interview:phase`). Stops are real
  `<a href>` links (full-page navigation, crawlable, keyboard-accessible).
- BOTH `/` (landing) and `/dashboard` render this same board — `page.tsx` with
  `context="landing"` (static headline, no sidebar), `dashboard-client.tsx` with
  `context="workspace"` (an "X of 4 steps done" heading, inside AppShell). The
  old wordy landing sections (hero, product preview, module cards, privacy) were
  deleted.
- An animated top-down car drives slowly along the road: once automatically
  ~0.7s after page load (desktop only, skipped on mobile and for
  `prefers-reduced-motion`), and again on hover/focus of the "Start here" button.
  It pauses at each stop (the stop scales up), while a "Click to begin" hint
  fades in and the button pulses. When it reaches the goal, the star pops and
  bursts into yellow fireworks.
- Two layouts in the component: `WIDE` (desktop switchback) and `TALL` (a
  vertical version swapped in by CSS at max-width 560px so labels stay legible).
- Tunable animation constants at the top of the file: `CAR_TRAVEL_MS` (18000,
  intentionally slow), `CAR_PAUSE_MS`, `CAR_GOAL_HOLD_MS`, `AUTO_PLAY_DELAY_MS`.
  All board styling is in `globals.css` under `.journey-board` / `.jb-*`.
- The resume checker's circular animated score gauge (`ScoreGauge.tsx`, red/
  amber/green by band) is still in place from the earlier redesign.

**The literal snake-and-ladder board (dice, tiles, random movement) was
explicitly NOT built** — considered and deliberately deferred as a much bigger,
lower-value build that maps less cleanly onto 4 real tools. If the user or
professor asks for the literal board-game version later, that is new scope,
confirm before building it.

---

## Deployment and operational notes

- **Env var:** `ANTHROPIC_API_KEY` is set in Vercel (Production and Preview,
  marked Sensitive), NOT in this repo, no `.env.local` present. Local `npm run
  dev` will exercise error paths or the local fallback (resume checker only)
  since there's no key locally.
- **Anthropic billing:** the user has a small prepaid credit balance on
  console.anthropic.com. No hard spend cap is configured there yet, flagged
  to the user as a to-do, not yet done. Be mindful of token usage in prompts.
- **Vercel auto-deploys on every push to `main`.** It has, once, silently
  failed to trigger on a push (a dropped GitHub webhook, not a code issue),
  the fix was pushing a new commit (or an empty commit) to re-trigger it. If a
  push doesn't appear in Vercel's Deployments tab within about 2 minutes,
  that's the likely cause, not a build error.
- **After every deploy-worthy change, verify against the live URL**, not just
  local build success, several past bugs (stale Turbopack CSS cache, a
  dropped webhook) only became visible by actually curling or loading the
  production URL. `rm -rf .next` fixes local Turbopack cache staleness if
  local dev shows CSS that doesn't match the source.
- **Mobile check habit:** this project has hit real mobile CSS overflow bugs
  twice (nav using `grid-template-columns` without `minmax(0, 1fr)` or
  `min-width: 0`, which lets grid children force the page wider than the
  viewport). Any new layout should be checked at about 390px width for
  horizontal overflow before considering it done.

---

## What's NOT done yet (known gaps, not oversights)

From an explicit UX and backend review the user requested, tiered by priority.
P0 and most of P1 are done; these remain:

- **Sentry or error monitoring**, `error.tsx` and `global-error.tsx` both log
  via `console.error` with a comment marking where to wire
  `Sentry.captureException` once the user creates a Sentry project and DSN.
  Not done because it requires the user's own account.
- **Anthropic spend cap**, user needs to set this in console.anthropic.com
  themselves (agent cannot do this non-interactively). Mentioned above too.
- **P2, optional, not requested yet:** a "clear all my data" button (session and
  saved), PDF or print export of results, dark mode (shadcn dark tokens are
  already partially in `globals.css` from an earlier `shadcn init`, unused).
  Don't build these speculatively, wait for the user to ask.
- **Custom domain**, user asked about it, was told it's optional and cosmetic and
  declined for now. Current URL is the permanent one unless they say otherwise.

---

## Working conventions observed in this project (carry these forward)

- Every feature change: implement, then `npm run lint`, then `npm run build`,
  then verify the actual behavior (preview browser locally, or curl/test
  production for AI-dependent behavior), then commit with a short imperative
  message, then push, then re-verify against the live URL.
- Commits are created per logical change, not batched into giant commits.
  Commit messages are one imperative sentence, occasionally with a short body
  explaining why for non-obvious changes.
- Do not commit `docs/~$*.docx` (Word lock files) or `.env*` files.
- The user is hands-on and reviews behavior directly in the browser or
  production, don't mark something done without actually checking it renders
  or works.

