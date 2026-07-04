# Pathway AI — Handoff Prompt for a New Chat

Paste this whole document as your first message in a new chat to resume work on
Pathway AI with full context. It replaces an earlier, now very outdated,
version of this file (that draft predated the Claude API integration and three
of the four modules — ignore anything you may have seen referencing it).

This file also has two siblings worth knowing about:
- **`/Users/kingdavid/pathway-ai/CLAUDE.md`** — auto-loaded into every Claude
  Code session on this repo. It is currently stale (describes an early MVP
  state) and hasn't been rewritten. Trust this handoff and the live repo over
  it.
- **`/Users/kingdavid/pathway-ai/AGENTS.md`** — a technical architecture
  reference written for any coding agent (Codex, etc.) working in this repo.
  It covers file structure, code patterns, and brand rules in more implementation
  detail than this document. Read both.

---

## Who you're working with

The user is a student building this as an IST 440W capstone project, but
partway through explicitly redirected: **ignore grading/capstone requirements
and build the real, functional product** unless they specifically ask for a
grading document (implementation doc, Gantt chart, AI-prompts log, etc. — those
already exist in `docs/` from earlier work and don't need attention now).

Working style to match:
- Hands-on. Reviews things directly in the browser or via curl against the
  live production URL, not just "the build passed."
- Wants every change verified against **production**, not just local dev,
  because local dev has no Claude API key (see Environment below) and this
  project has been bitten twice by things that worked locally but weren't
  actually live (a dropped Vercel webhook, a stale Turbopack CSS cache).
- Prefers short, focused commits with imperative messages, pushed and
  re-verified live before moving to the next thing.
- Will push back on scope creep or unnecessary complexity — default to the
  simplest solution that solves the actual problem (e.g. chose in-memory
  rate limiting over Upstash Redis specifically to avoid a new account/setup).
- Appreciates being asked before large, ambiguous pivots (see the "journey
  redesign" story below for an example of getting this right).

---

## What Pathway AI is

A free, no-login student career-readiness web app with four AI-powered tools,
connected into one flow:

1. **Resume Checker** (`/resume-checker`) — paste or upload (PDF/DOCX/TXT) a
   resume + job description → match score, missing keywords, strengths,
   improvements.
2. **Career Path Explorer** (`/career-path`) — major/interests in → three
   realistic career paths out, each with progression and required skills.
3. **Skill Gap Roadmap** (`/skill-gap`) — current skills + target role in →
   a prioritized, step-by-step learning plan out.
4. **Mock Interview Coach** (`/interview`) — role in → generated interview
   questions → the user answers → scored feedback with model answers.

**All four are fully built and genuinely AI-powered in production right now.**
This is not a demo or MVP with placeholders — every module calls Claude for
real analysis.

- **Live URL:** https://pathway-aiapp.vercel.app
- **GitHub:** https://github.com/Dave-ASC1/pathway-ai (branch `main`, auto-deploys to Vercel)
- **Local path:** `/Users/kingdavid/pathway-ai`

---

## Tech stack

```
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4
@anthropic-ai/sdk (server-side only) · Vercel (hosting + deploy + analytics)
No auth. No database. (Two lightweight client-side stores instead — see below.)
```

```bash
npm run dev     # localhost:3000 — no ANTHROPIC_API_KEY locally, so AI routes
                # either error gracefully or (resume checker only) fall back to
                # local keyword matching. Test real AI behavior against prod.
npm run build   # must pass clean before any commit
npm run lint    # must pass clean before any commit
```

---

## The story so far (why things are built the way they are)

This section exists so you understand *why*, not just *what* — several
decisions look arbitrary until you know the history.

1. **Started as a grading-focused capstone MVP.** Landing page, dashboard,
   and a keyword-matching (non-AI) resume checker existed. Docs for the
   professor (implementation doc, project management charts, AI prompts log)
   were committed. Vercel deployment protection was fixed so the public URL
   actually works without login.

2. **User said: stop optimizing for grading, build the real product.** This
   was a deliberate, explicit pivot (saved in persistent memory — see
   "Persistent preferences" below). From here on, everything was built as if
   this were a genuine product, not a school deliverable.

3. **Real Claude API integration, one module at a time**, always the same
   pattern: build → test locally → **test against production with a live
   `curl`** (because Vercel has the API key and local doesn't) → commit → push
   → re-verify live:
   - Resume Checker got real Claude analysis (`app/api/analyze-resume/route.ts`),
     keeping the original keyword-matching logic as an automatic fallback if
     the API call fails.
   - Career Path Explorer, Skill Gap Roadmap, and Mock Interview Coach were
     each built from scratch as full modules (API route + client + page),
     no fallback logic needed since they were new (nothing to fall back to).
   - Debugged a real incident along the way: the `ANTHROPIC_API_KEY` env var
     in Vercel appeared set but was actually an **empty value** (the "Sensitive"
     toggle was showing placeholder text, not the real key) — caught via a
     temporary debug endpoint that reported `hasAnthropicKey`, then removed
     once fixed. If AI calls ever mysteriously return the local-fallback/error
     path in production again, check the actual env var value first, not just
     whether the key exists in the Vercel dashboard list.

4. **Two hard product/voice rules emerged from direct user correction** (both
   saved as persistent memory, both must be respected in all future work):
   - **Never show "Claude" or "Anthropic" in the UI.** Every user-facing string
     says "Pathway AI" (e.g. "Pathway AI is analyzing your resume..."). The
     backend uses Claude; visitors must never see that.
   - **No em dashes or en dashes anywhere a user reads text** — not in JSX
     copy, not in AI-generated output. The user considers em dashes a tell
     that text is AI-written. Every AI prompt in the codebase explicitly
     instructs Claude to avoid them; keep that instruction in any new/edited
     prompt.

5. **Made the resume checker feel like a real tool, not a demo**: it used to
   load with a pre-filled sample resume and instant results. Changed to start
   blank with a "Try an example" button instead — matches how real tools
   (Jobscan, etc.) work, and made all four modules consistent (blank by
   default everywhere).

6. **Connected the modules — and had to fix it twice.** First pass used URL
   query params (`?role=...`) to hand data from one module to the next
   (e.g. clicking "Practice interview" on a career path). The user then
   reported a real UX problem: navigating between sidebar tabs lost all
   in-progress work, and going back to a module cleared it. That led to a full
   rework: **`lib/session.ts`**, a `sessionStorage`-backed `useSessionState`
   hook (built on `useSyncExternalStore`, SSR-safe) that every module now uses
   for its inputs and results. Navigating away and back restores everything.
   Cross-module handoffs now write directly into the destination module's
   session key (checking it's empty first, so it never clobbers something the
   user already typed) instead of relying on URL params. This also enabled
   nice automatic behavior: finishing a resume analysis auto-fills the
   roadmap's "current skills" (extracted from the resume's actual Skills
   section) and the interview coach's role field (from the job description),
   without the user clicking anything extra.

7. **Added "Save result" + a `/saved` page** — deliberately a *second*,
   separate persistence mechanism from session storage: **`lib/history.ts`**
   uses `localStorage` (not sessionStorage) so saved items survive closing the
   tab, but only when the user explicitly clicks "Save result." This was the
   answer to "what if a user wants their results later" without adding
   accounts or a database, which the user considered and explicitly decided
   against (browser-based saving covers the real need at much lower cost/risk).

8. **Added file upload** (PDF/DOCX/TXT via `unpdf` + `mammoth`, a new
   `/api/parse-resume` route) so users don't have to paste text manually.

9. **Ran a full UX/backend production-readiness review** (user asked "what
   would you want to see before this goes public") and worked through it in
   priority tiers:
   - **P0 (done):** error boundaries (`app/error.tsx`, `app/global-error.tsx`)
     so a crash never shows a blank white screen, a branded 404 page.
   - **P1 (done):** Vercel Analytics, `robots.ts` + `sitemap.ts`, a branded
     OG preview image (`app/opengraph-image.tsx`, so link shares on
     iMessage/Slack/etc. show a real card), a proper favicon
     (`app/icon.svg`, the Pathway logo — removed the default Next.js icon and
     leftover template SVGs).
   - **Still outstanding, needs the user's own accounts, cannot be done by an
     agent non-interactively:** wiring Sentry (the `console.error` calls in
     the error boundaries have a comment marking where `Sentry.captureException`
     goes once the user creates a project and DSN), and setting a spend cap
     on console.anthropic.com (no hard cap configured yet — the in-memory rate
     limiter slows abuse but doesn't hard-stop it, this is an accepted,
     known gap, not a bug to silently "fix" with Upstash unless asked).

10. **Most recent major change: the "journey redesign."** The user's professor
    reviewed the site and said it was too wordy and should feel more like a
    guided game — showed a snake-and-ladder board as inspiration, wanted a
    colorful dashboard. This was ambiguous enough (a literal board game vs. a
    simpler guided visual is a huge scope difference) that clarifying
    questions were asked *before* building anything. The agreed, actually-built
    direction:
    - The old text-and-cards dashboard was **replaced entirely** with a
      colorful step-path tracker (`app/dashboard/dashboard-client.tsx`): four
      circular nodes, one per module, color-coded (resume=blue, career=green,
      roadmap=amber, interview=purple — same palette as the Saved page's type
      badges), connected by a line, filled solid with a checkmark once that
      module's been used this session, with a soft pulse on whichever step
      is next. Clicking any node jumps to that tool. Progress is computed by
      reading the same `lib/session.ts` keys other modules already write to.
    - Added `app/components/ScoreGauge.tsx`, an animated circular gauge
      (red/amber/green by score band) replacing the resume checker's plain
      percentage text.
    - Trimmed copy sitewide — landing page, all four module intros, the new
      dashboard — down to short, punchy lines.
    - Renamed the sidebar nav label "Dashboard" → "Journey" (the route path
      `/dashboard` and internal `active="dashboard"` key were deliberately
      left unchanged to avoid touching everything downstream).
    - **The literal snake-and-ladder board (dice, tiles, random movement) was
      explicitly considered and NOT built** — it was judged a much bigger,
      lower-value build that maps less cleanly onto four real tools. If asked
      for it later, that's new scope, confirm before building.

11. **Created `AGENTS.md`** at the repo root (appended after an existing
    auto-generated Next.js version-warning block) as a technical handoff for
    Codex or any other coding agent — architecture patterns, brand rules,
    gotchas, in more code-level detail than this narrative document.

---

## Architecture quick reference (see AGENTS.md for full detail)

```
app/api/analyze-resume/route.ts      — resume checker (has local fallback)
app/api/career-path/route.ts
app/api/skill-gap/route.ts
app/api/interview/questions/route.ts
app/api/interview/evaluate/route.ts
app/api/parse-resume/route.ts        — PDF/DOCX/TXT extraction, not AI

lib/session.ts    — useSessionState(key, initial): sessionStorage-backed,
                     per-tab continuity across navigation. Every module's
                     inputs/results live here. Also enables cross-module
                     auto-fill (write into the destination's key if empty).
lib/history.ts    — saveItem/useSavedItems/deleteItem: localStorage-backed,
                     explicit user action ("Save result"), survives closing
                     the tab. Powers /saved. Separate concept from session.ts.
lib/rate-limit.ts — checkRateLimit(req, {name, limit, windowMs}): in-memory,
                     per-IP, called before any Claude call in every route.

app/components/AppShell.tsx     — sidebar nav + layout wrapper for all app pages
app/components/PathwayLogo.tsx  — logo, links to "/"
app/components/PathwayLoader.tsx — branded loading animation, used everywhere
app/components/ScoreGauge.tsx   — circular score ring, resume checker

app/dashboard/  app/resume-checker/  app/career-path/  app/skill-gap/  app/interview/  app/saved/
  page.tsx (server wrapper, mounts AppShell + client) + <name>-client.tsx (logic)
```

Every AI route: rate-limit check → input size cap (413 if too long) → Claude
call (`model: "claude-opus-4-8"`, don't downgrade unless told to) → prompt
explicitly forbids em/en dashes → response parsed via a shared `extractJson()`
pattern (strips markdown fences / finds the `{...}` substring) → `JSON.parse`.

---

## Brand rules (do not violate)

- Colors: `--deep-navy #041336`, `--strong-navy #000080`, `--brand-blue
  #3b82f6`, `--soft-blue #60a5fa`. Module identity colors: resume=blue,
  career=green, roadmap=amber, interview=purple (consistent across Saved
  badges, journey hub, keyword chips).
- Logo: diagonal ascending line, 4 dots, first 3 hollow, 4th solid light blue.
  Never change the dot pattern.
- "Pathway AI" in the UI, never "Claude" or "Anthropic" (see history #4 above).
- No em/en dashes anywhere user-visible (see history #4 above).
- Short, sentence-case copy — the site went through a deliberate trim pass;
  don't reintroduce paragraph-length blocks in module intros.

---

## Environment & deployment notes

- `ANTHROPIC_API_KEY` lives only in Vercel (Production + Preview, marked
  Sensitive) — not in this repo, no `.env.local` present locally.
- Vercel auto-deploys every push to `main`. It has, once, silently failed to
  trigger (a dropped GitHub webhook, not a code problem) — fix is pushing
  another commit (even an empty one) to re-trigger it.
- Always verify deploy-worthy changes against the **live URL**, not just a
  successful local build — this project has hit a stale Turbopack CSS cache
  locally (`rm -rf .next` fixes it) that made local dev show different CSS
  than what was actually on disk/deployed.
- Mobile check habit: this project has twice hit real horizontal-overflow
  bugs from CSS grid children not respecting `minmax(0, 1fr)` / `min-width: 0`.
  Check new layouts at ~390px width before calling them done.

---

## Persistent preferences already saved in memory

If you're running as Claude Code on this machine, these are already loaded
automatically each session (`~/.claude/projects/.../memory/`), but stated here
for portability to any other context:

- Build the real, functional product — ignore capstone grading requirements
  unless the user explicitly asks for a document.
- Never say "Claude"/"Anthropic" in the UI — always "Pathway AI."
- Never use em dashes or en dashes in copy or AI prompt output.

---

## What's left (in rough priority order)

1. **Sentry wiring** — needs the user to create a project/DSN first (agent
   can't do this non-interactively). Hook points already exist in
   `app/error.tsx` / `app/global-error.tsx`.
2. **Anthropic spend cap** — needs the user to set this in
   console.anthropic.com themselves.
3. **P2 / optional, not yet requested — don't build speculatively:** a
   "clear all my data" button, PDF/print export of results, dark mode (shadcn
   dark tokens already exist unused in `globals.css` from an earlier
   `shadcn init`).
4. Anything the user brings up new — always clarify scope first if a request
   is ambiguous enough that multiple reasonable, very different
   implementations exist (see the journey-redesign story above for the model
   to follow: ask 3-4 sharp multiple-choice questions, then execute without
   further check-ins).

---

## How to resume productively

1. `cd /Users/kingdavid/pathway-ai && git log --oneline -20` to see exactly
   what's landed since this document was written — it may already be stale
   the same way the previous handoff was.
2. `git status --short` — check for uncommitted work before assuming a clean
   slate.
3. Confirm production is in sync: `git rev-parse --short origin/main` should
   match what's actually live (spot-check a recent feature via curl against
   `https://pathway-aiapp.vercel.app`).
4. Ask the user what they want to work on next — don't assume the "What's
   left" list above reflects their current priority.
