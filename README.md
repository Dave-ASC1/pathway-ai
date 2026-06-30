# Pathway AI

**Live app:** https://pathway-aiapp.vercel.app

Pathway AI is a student-first career readiness platform that helps students improve resumes, discover realistic career paths, build skill roadmaps, and prepare for interviews.

This repository contains the MVP implementation for the IST 440W capstone project. It includes a polished landing page, a dashboard workspace, and a working ATS-style resume checker powered by Claude AI with a local fallback.

## Implemented Features

- Public landing page with Pathway AI branding and module overview.
- Dashboard route at `/dashboard`.
- Resume checker at `/resume-checker` — AI-powered via Claude API with local keyword-matching fallback.
- Matched keyword and missing keyword detection.
- Resume section checks for education, projects, skills, experience, and impact.
- Student-focused strengths and improvement recommendations.
- Screenshots of all working screens in `public/screenshots/`.
- Responsive design for desktop and mobile.

## Planned Features

- User authentication (Clerk).
- Saved student profiles and resume history (NeonDB + Prisma).
- Career Path Explorer.
- Skill Gap Roadmap.
- Mock Interview Coach.

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

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/dashboard` | MVP student workspace |
| `/resume-checker` | Working ATS-style resume checker |

## How the Resume Checker Works

1. The student pastes resume text and a target job description.
2. The app POSTs to `/api/analyze-resume` (server-side route).
3. If `ANTHROPIC_API_KEY` is set, Claude AI analyzes the resume and returns structured feedback.
4. If no API key is present or the call fails, a local keyword-matching fallback runs automatically.
5. Results include: match score (0–100), matched keywords, missing keywords, section checks, strengths, and improvement recommendations.

To enable Claude AI locally, add to `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

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

Screenshots of all working screens are saved in `public/screenshots/`:

- `landing-page.png`
- `dashboard.png`
- `resume-checker-input.png`
- `resume-checker-results.png`

## GitHub Repository

https://github.com/Dave-ASC1/pathway-ai

## Self-Reflection Recording Guide

For the recording deliverable, each member should explain one part of the project:

- Project goal and problem being solved.
- Landing page and branding decisions.
- Dashboard and user journey.
- Resume checker logic and result interpretation.
- Limitations and future improvements.
- Project management artifacts and updated timeline.
