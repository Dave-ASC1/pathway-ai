# Pathway AI

**Live app:** https://pathway-aiapp.vercel.app

Pathway AI is a student-first career readiness platform that helps students improve resumes, discover realistic career paths, build skill roadmaps, and prepare for interviews.

This repository contains the implementation for the IST 440W capstone project. All four modules are built and running against the Claude API, and the app requires no account and costs nothing to use.

## Features

**Try an example** on every module fills the form with one of three realistic student profiles, so the app can be tested end to end without writing a resume or finding a job posting first. The profiles span a senior with an internship, a junior with projects but no internship, and a sophomore with no relevant experience.

### ATS Resume Checker (`/resume-checker`)
- Paste resume text or upload a PDF or DOCX.
- AI analysis against a target job description, with a deterministic keyword-matching fallback if the AI call fails.
- Match score, matched and missing keywords, per-section scoring (education, experience, projects, skills, impact), strengths, and specific improvements.

### Career Path Explorer (`/career-path`)
- Three realistic career directions from a student's major, year, and interests.
- Each path includes typical progression, skills to build, and a concrete first step.

### Skill Gap Roadmap (`/skill-gap`)
- Compares current skills against a target role.
- Prioritized learning steps with reasoning, suggested resource type, and time estimates.

### Mock Interview Coach (`/interview`)
- Role-specific behavioral and technical questions.
- Scored feedback per answer: what worked, what was missing, and a model answer.

### Across the app
- Results carry between modules (resume skills flow into the roadmap, the target role into the interview coach).
- Results can be saved to the browser and revisited at `/saved`.
- Responsive on desktop and mobile.

## Deliberately Not Built

Authentication (Clerk) and a database (NeonDB + Prisma) were planned early and intentionally dropped. Browser storage is used instead, which keeps the app free and sign-up free. This was a scoping decision, not an unfinished item.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Claude API (`@anthropic-ai/sdk`) — resume checker AI analysis

## Getting Started

### Requirements

- Node.js 20 or newer
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm test -- --run
```

79 unit tests covering the API routes, the deterministic analyzer, and the module
components. The Anthropic SDK is mocked, so the suite runs offline in a few
seconds and makes no API calls.

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and journey overview |
| `/dashboard` | Student workspace with per-step progress |
| `/resume-checker` | ATS-style resume checker |
| `/career-path` | Career Path Explorer |
| `/skill-gap` | Skill Gap Roadmap |
| `/interview` | Mock Interview Coach |
| `/saved` | Saved results |

### API routes

All AI calls are server-side, so the API key is never exposed to the browser.

| Route | Purpose |
| --- | --- |
| `/api/analyze-resume` | Resume analysis (has a local fallback) |
| `/api/career-path` | Career path generation |
| `/api/skill-gap` | Roadmap generation |
| `/api/interview/questions` | Interview question generation |
| `/api/interview/evaluate` | Answer scoring and coaching |
| `/api/interview/sample-answers` | Drafts example answers for the demo profiles |
| `/api/parse-resume` | PDF, DOCX, and TXT text extraction (not AI) |

## How the Resume Checker Works

1. The student pastes resume text and a target job description.
2. The app POSTs to `/api/analyze-resume` (server-side route).
3. If `ANTHROPIC_API_KEY` is set, Claude AI analyzes the resume and returns structured feedback.
4. If no API key is present or the call fails, a local keyword-matching fallback runs automatically.
5. Results include: match score (0–100), matched keywords, missing keywords, section checks, strengths, and improvement recommendations.

The other three modules follow the same server-side pattern, but return a clear
error instead of falling back, since there is no meaningful non-AI version of
generating interview questions or a learning roadmap.

To enable AI locally, add to `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

Without a key, the resume checker still works via the fallback and the other
modules report that the AI service is unavailable. The deployed app has the key
configured, so all four modules are fully functional there.

## Documentation

Assignment documentation is included in the `docs` folder:

- `docs/AI_PROMPTS_USED.md`
- `docs/IMPLEMENTATION_DOCUMENT.md`
- `docs/PROJECT_MANAGEMENT.md`

The implementation document includes:

- Functional Decomposition Level 0
- Functional Decomposition Level 1
- Technical design flowchart
- Operational flowchart from the user point of view

The project management document includes:

- Updated Gantt chart
- Critical Path Analysis
- PERT chart

## Screenshots

Captured from the live site and saved in `public/screenshots/` at 2x for print.
Regenerate them any time the UI changes:

```bash
npx tsx report/capture-screenshots.ts
```

| File | Shows |
| --- | --- |
| `landing-page.png` | Journey board landing page |
| `dashboard.png` | Student workspace with step progress |
| `resume-checker-input.png` | Resume and job description filled in, before analysis |
| `resume-checker-results.png` | Score, radar, section bars, keywords, and recommendations |
| `career-path-results.png` | Three generated career paths |
| `skill-gap-results.png` | Prioritized learning roadmap |
| `interview-questions.png` | Generated interview questions |

## GitHub Repository

https://github.com/Dave-ASC1/pathway-ai

## Self-Reflection Recording Guide

This is a solo project. The recording covers:

- Project goal and the problem being solved.
- Landing page, branding, and the journey metaphor.
- The four modules and how results carry between them.
- Moving from keyword matching to real AI analysis.
- Limitations and future improvements.
- Project management artifacts and updated timeline.

Talking points are in `SELF_REFLECTION.md`.
