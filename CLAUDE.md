# Pathway AI — Claude Code Handoff

## What This Project Is

Pathway AI is an IST 440W capstone project at Penn State. It is a student career readiness web platform — a single free tool that combines four modules: ATS Resume Checker, Career Path Explorer, Skill Gap Roadmap, and AI Mock Interview Coach. The core value proposition is integration: existing tools like Jobscan, Teal, and Final Round AI solve these problems separately and charge for them. Pathway AI brings them together for free.

**Target user:** College students who are confused about career direction and need structured help preparing.

**Professor requirements (what gets graded):**
- Working app with a confirmed public Vercel URL (not a localhost link, not a Vercel dashboard link)
- Code in a public GitHub repo: https://github.com/Dave-ASC1/pathway-ai
- Screenshots proving the app works (landing page, dashboard, resume checker input, resume checker results)
- AI-generated implementation document (functional decomposition, flowcharts)
- Updated Gantt chart, Critical Path Analysis, PERT chart (May 20–August 12 timeline)
- AI prompts used log

---

## Current State (as of August 2, 2026)

Everything below is built, deployed, and verified live. The June planning phases
that used to fill this file are done; do not treat them as outstanding work.

### What Works
- **Live and public:** https://pathway-aiapp.vercel.app (no login prompt)
- `/` and `/dashboard` — journey board entry pages, progress tracked per step
- `/resume-checker` — AI analysis with PDF/DOCX upload, score, radar, keywords
- `/career-path` — three generated paths, each with a first step
- `/skill-gap` — prioritized roadmap with time estimates
- `/interview` — generated questions, answer drafting, scored coaching
- `/saved` — browser-persisted results
- **Try an example** on all four modules, filling from three student profiles
- Data handoff between modules (resume skills flow into the roadmap, role into
  the interview coach)
- 79 unit tests, `npm run lint`, and `npm run build` all pass

### Deliberately Not Built
- **Authentication (Clerk)** and **database (NeonDB + Prisma)** were planned in
  June and intentionally dropped. The app uses browser storage instead, which
  keeps it genuinely free and sign-up free. This was a decision, not a gap.
- Error monitoring (Sentry) needs the user's own account.

---

## Tech Stack

```
Next.js 16 App Router
React 19
TypeScript
Tailwind CSS 4
ESLint
npm
```

**Installed:**
- `@anthropic-ai/sdk` — powers all five AI routes, model `claude-opus-4-8`
- `vitest` + `@testing-library/react` + `jsdom` — unit tests

- `shadcn` + `class-variance-authority` — installed but barely used, only
  `components/ui/button.tsx` exists. Do not build out more of it without reason.

**Not installed, and not planned:** Clerk, Prisma, NeonDB.

---

## File Structure

```
app/
  layout.tsx, page.tsx, globals.css        — root, landing, brand CSS
  error.tsx, global-error.tsx, not-found.tsx
  components/
    AppShell.tsx        — nav and shared layout shell
    PathwayLogo.tsx     — brand logo, do not change the dot pattern
    JourneyBoard.tsx    — the winding path, embedded in every result view
    PathwayLoader.tsx   — stair/drop loading animation, not a spinner
    ScoreGauge.tsx, SectionRadarChart.tsx
  dashboard/ resume-checker/ career-path/ skill-gap/ interview/ saved/
    page.tsx            — server wrapper
    *-client.tsx        — all module logic (client component)
    *-client.test.tsx   — component tests
  api/
    analyze-resume/     — has a local fallback
    career-path/  skill-gap/
    interview/questions/  interview/evaluate/  interview/sample-answers/
    parse-resume/       — PDF/DOCX/TXT extraction, not AI
lib/
  session.ts            — sessionStorage state and cross-module handoff
  history.ts            — saved results (localStorage)
  rate-limit.ts         — per-route in-memory limiter
  resume-analysis.ts    — deterministic analyzer shared by route and client
  examples.ts           — the three Try an example student profiles
docs/                   — capstone deliverables
report/                 — charts, screenshots, docx generation scripts
```

---

## Brand and Design Rules

Do not change the brand. The design direction is intentional and has been refined.

```css
--deep-navy:  #041336
--strong-navy: #000080
--brand-blue: #3b82f6
--soft-blue:  #60a5fa
--light-bg:   #f7f9fc
--white:      #ffffff
--ink:        #0f172a
--muted:      #64748b
--line:       #e2e8f0
```

Typography: Apple-inspired system font stack (SF Pro Display/SF Pro Text via `-apple-system, BlinkMacSystemFont`).

Logo: The Pathway AI logo has a diagonal line with four dots. The first three dots are hollow. The fourth dot is solid light blue. Do not change this.

Loading animation: Dots drop into a stair/path formation. Not a circular spinner.

---

## How the App Is Built

Read `AGENTS.md` for the full architecture. The essentials:

- **Five AI routes**, all server-only, under `app/api/`. The key is a Vercel env
  var read automatically by `new Anthropic()`. Never call the API from a client
  component.
- **Never ask one call to produce N results.** The evaluate and sample-answers
  routes issue one request per item in parallel with `Promise.allSettled`.
  Batching six evaluations into one response made the model generate them
  serially and took three to five minutes; fanning out took it to about 15
  seconds. This applies to any future route returning a list.
- **The local keyword analyzer** (`lib/resume-analysis.ts`) is the fallback when
  the AI call fails, imported by both the route and the client. It was
  previously duplicated in both files; do not re-inline it.
- **Session continuity** via `lib/session.ts`. Inputs and results survive
  navigation, and modules hand data to each other by writing the destination's
  session key.
- **Example profiles** in `lib/examples.ts` power the Try an example buttons.
  Three profiles spanning strong, developing, and early students. Keep the weak
  one; it is the case the coaching is actually for.

---

## Testing

```bash
npm test -- --run
```

79 tests, fully offline (the SDK is mocked), about 3 seconds. Route tests live
beside their routes. Run these alongside lint and build before any commit.

---

## Navigation Updates

When adding new routes, update `AppShell.tsx` navigation links to include:
- Dashboard → `/dashboard`
- Resume Checker → `/resume-checker`
- Career Explorer → `/career-path`
- Skill Gap Roadmap → `/skill-gap`
- Interview Coach → `/interview`

---

## What to Keep Exactly As-Is

- All brand colors — do not change
- The PathwayLogo component — do not change the dot pattern or styling
- The loading animation — stair/drop formation, not circular
- The AppShell sidebar layout and structure
- The overall design feel — clean white surfaces, navy CTAs, soft blue accents

---

## Commands

```bash
npm run dev            # local dev at localhost:3000
npm run lint           # must pass before any commit
npm test -- --run      # 79 tests, offline, ~3s
npm run build          # must pass before any commit or Vercel deploy
```

All three of lint, test, and build must pass before committing. Then verify the
real behavior in the browser, and re-check the live URL after deploying.

Local dev has **no** `ANTHROPIC_API_KEY` (it is set on Vercel for Preview and
Production only). So locally the resume checker falls back to keyword matching
and the interview routes return 503. That is expected, not a bug. To run the AI
locally, `vercel env pull .env.local`.

---

## Git Hygiene

- Never commit `.env.local` — add it to `.gitignore` if not already there
- Never commit `docs/~$*.docx` (Word lock files)
- Commit message format: short imperative sentence
- Push to `main` on GitHub: https://github.com/Dave-ASC1/pathway-ai

---

## Project Timeline

May 20 to August 12, 2026. Today is August 2. Ten days remain.

The build is complete. What is left is submission work:

1. Refresh screenshots from the current UI (the journey board and the new
   results views replaced what is in the older docs)
2. Update the capstone docs in `docs/` and `report/` to match the shipped app
3. Record the video reflection (`SELF_REFLECTION.md` has the script notes)
4. Final submission

Do not start new feature work unless the user asks. The remaining risk is
documentation drift, not missing functionality.
