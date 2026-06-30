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

## Current State (as of June 30, 2026)

### What Works
- `/` — Landing page with hero, module cards, branding, loading animation
- `/dashboard` — Student workspace with readiness cards and module links
- `/resume-checker` — Functional ATS resume checker (client-side, deterministic keyword matching)
- Build passes: `npm run lint` and `npm run build` both clean
- Docs exist in `/docs`: implementation document, project management charts, AI prompts log

### What Does NOT Work Yet
- No Claude API integration — the resume checker uses keyword matching, not AI
- No authentication — Clerk was planned but not installed
- No database — Prisma + NeonDB were planned but not set up
- Career Path Explorer: placeholder card only, no page or logic
- Skill Gap Roadmap: placeholder card only
- Mock Interview Coach: placeholder card only
- Vercel deployment: URL redirects to Vercel login (deployment protection is on — needs fixing)

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

**Planned additions (not yet installed):**
- `@anthropic-ai/sdk` — Claude API
- `@clerk/nextjs` — authentication
- `@prisma/client` + `prisma` — ORM
- NeonDB — PostgreSQL serverless database
- `shadcn/ui` — component library (install via `npx shadcn@latest init`)

---

## File Structure

```
app/
  layout.tsx                        — root layout
  page.tsx                          — landing page
  globals.css                       — brand CSS variables and typography
  components/
    AppShell.tsx                    — sidebar nav, shared layout shell
    PathwayLogo.tsx                 — reusable brand logo component
  dashboard/
    page.tsx                        — student dashboard
  resume-checker/
    page.tsx                        — server wrapper
    resume-checker-client.tsx       — all resume checker logic (client component)
docs/
  AI_PROMPTS_USED.md
  IMPLEMENTATION_DOCUMENT.md
  PROJECT_MANAGEMENT.md             — Gantt, CPA, PERT (May 20–Aug 12)
  PathwayAI_AI_Prompts_Used.docx
  PathwayAI_AI_Gen_Implementation_Document.docx
  PathwayAI_Project_Management_Charts.docx
public/
  screenshots/                      — needs to be populated
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

## Immediate Priorities (Do These First)

### 1. Fix Vercel Deployment

The URL `https://pathway-ai-ercbvixuf-pathway-ai1.vercel.app/` redirects to Vercel login. Deployment protection is enabled on this preview URL.

Fix options (pick one):
- In Vercel dashboard → Settings → Deployment Protection → disable for production
- Or check the Domains tab for the production `.vercel.app` URL and test it in incognito while not logged into Vercel
- The correct public URL should open the landing page without any login prompt

Once confirmed working, add the public URL to `README.md` and update meta tags in `app/layout.tsx`.

### 2. Take Screenshots

Once Vercel is working, capture and save to `public/screenshots/`:
- `landing-page.png` — full landing page
- `dashboard.png` — dashboard with module cards
- `resume-checker-input.png` — resume checker with text pasted, before analysis
- `resume-checker-results.png` — resume checker after analysis showing score and feedback

### 3. Commit Docs

These files are untracked and need to be committed:
```bash
git add docs/PathwayAI_AI_Prompts_Used.docx
git add docs/PathwayAI_AI_Gen_Implementation_Document.docx
git add docs/PathwayAI_Project_Management_Charts.docx
git add docs/PROJECT_MANAGEMENT.md
git commit -m "Add project documentation and fix timeline"
git push
```

Do NOT commit `docs/~$thwayAI_Project_Management_Charts.docx` — that is a temporary Word lock file.

---

## Phase 2 — Claude API Integration

**Goal:** Replace the deterministic keyword matching in the resume checker with real AI analysis via Claude API.

### Setup

```bash
npm install @anthropic-ai/sdk
```

Add to `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

### Implementation

Create a server-side API route — never call the Claude API from a client component (exposes the key):

```
app/api/analyze-resume/route.ts
```

The route should:
1. Accept POST with `{ resume: string, jobDescription: string }`
2. Call Claude API with a structured prompt
3. Return `{ score, matchedKeywords, missingKeywords, sections, strengths, improvements }`

Update `resume-checker-client.tsx` to POST to `/api/analyze-resume` instead of running the local analysis function.

**Prompt design for Claude:**
Ask Claude to act as a professional ATS resume reviewer. Provide the resume text and job description. Request JSON output containing: overall match score (0-100), top matched keywords, top missing keywords, section completeness check (Education, Experience, Projects, Skills, Impact), 3 strengths, 3 specific improvement recommendations.

**Keep the local fallback:** If the API call fails, fall back to the existing deterministic analyzer so the app never breaks.

---

## Phase 3 — Authentication with Clerk

```bash
npm install @clerk/nextjs
```

Add to `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Wrap `app/layout.tsx` with `<ClerkProvider>`. Add `<SignInButton>` / `<UserButton>` to the landing page header. Protect `/dashboard` and inner routes with `auth()` from `@clerk/nextjs/server`.

---

## Phase 4 — Database with NeonDB + Prisma

```bash
npm install @prisma/client prisma
npx prisma init
```

Add `DATABASE_URL` from NeonDB to `.env.local`.

Minimal schema for MVP:

```prisma
model User {
  id        String           @id @default(cuid())
  clerkId   String           @unique
  email     String
  createdAt DateTime         @default(now())
  analyses  ResumeAnalysis[]
}

model ResumeAnalysis {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  resumeText     String
  jobDescription String
  score          Int
  feedback       Json
  createdAt      DateTime @default(now())
}
```

Save analysis results after each Claude API call. Surface history on the dashboard.

---

## Phase 5 — Remaining Modules

Build each as its own route under `app/`:

### Career Path Explorer (`app/career-path/page.tsx`)
- Student inputs: major, year, interests, target industries
- Claude generates: 3 career path options with role titles, typical progression, required skills
- Show as cards the student can explore

### Skill Gap Roadmap (`app/skill-gap/page.tsx`)
- Input: student's current skills (from resume or manual entry) + target role
- Claude generates: gap analysis + prioritized learning roadmap with specific resource types
- Render as a visual checklist roadmap

### Mock Interview Coach (`app/interview/page.tsx`)
- Student selects job role or pastes a job description
- Claude generates: 5-8 role-specific interview questions (behavioral + technical mix)
- Student types a response to each question
- Claude evaluates each response: score, strengths, what was missing, model answer
- Build this last — it is the most complex module

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
npm run dev       # local dev at localhost:3000
npm run lint      # must pass before any commit
npm run build     # must pass before any commit or Vercel deploy
```

Verify both `lint` and `build` pass after every significant change before committing.

---

## Git Hygiene

- Never commit `.env.local` — add it to `.gitignore` if not already there
- Never commit `docs/~$*.docx` (Word lock files)
- Commit message format: short imperative sentence
- Push to `main` on GitHub: https://github.com/Dave-ASC1/pathway-ai

---

## Project Timeline

May 20 – August 12, 2026. Today is June 30. Six weeks remain.

**Priority order:**
1. Fix Vercel public URL — this week
2. Take and commit screenshots — this week
3. Commit all docs — this week
4. Claude API for resume checker — weeks 1-2
5. Clerk auth + NeonDB — week 2-3
6. Career Path Explorer + Skill Gap Roadmap — weeks 3-4
7. Mock Interview Coach — week 5
8. Testing, polish, final docs, submission — final week
