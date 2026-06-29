# Pathway AI

Pathway AI is a student-first career readiness platform that helps students improve resumes, discover realistic career paths, build skill roadmaps, and prepare for interviews.

This repository contains the MVP implementation for the project submission. It includes a polished landing page, a dashboard workspace, and a working local ATS-style resume checker.

## Implemented MVP Features

- Public landing page with Pathway AI branding and module overview.
- Dashboard route at `/dashboard`.
- Working resume checker route at `/resume-checker`.
- Resume and target job description text inputs.
- Local ATS-style match score.
- Matched keyword and missing keyword detection.
- Resume section checks for education, projects, skills, experience, and impact.
- Student-focused strengths and improvement recommendations.
- Responsive design for desktop and mobile.
- No external API key required for the MVP.

## Planned Future Features

- User authentication.
- Saved student profiles and resume results.
- AI-generated feedback through a secure server route.
- Career Path Explorer.
- Skill Gap Roadmap.
- Mock Interview Coach.
- Resume PDF/DOCX upload and parsing.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Local deterministic resume analysis for the MVP

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

The resume checker runs locally in the browser:

1. The student pastes resume text.
2. The student pastes a target job description.
3. The checker extracts important keywords from the job description.
4. The checker compares those keywords against the resume.
5. It calculates a match score using keyword coverage and resume section completeness.
6. It returns matched keywords, missing keywords, section checks, strengths, and recommended improvements.

Because this MVP does not require an external AI API, it can run on another computer immediately after cloning and installing dependencies.

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

## Screenshots to Capture for Submission

After running the app locally, capture these screenshots:

1. Landing page at `/`
2. Dashboard at `/dashboard`
3. Resume checker input state at `/resume-checker`
4. Resume checker result state after clicking `Analyze resume`

Suggested folder for screenshots:

```text
public/screenshots/
```

## GitHub Submission Steps

1. Create a new public GitHub repository named `pathway-ai`.
2. Add the GitHub remote:

```bash
git remote add origin https://github.com/YOUR-USERNAME/pathway-ai.git
```

3. Commit the project:

```bash
git add .
git commit -m "Build Pathway AI dashboard and resume checker MVP"
```

4. Push to GitHub:

```bash
git branch -M main
git push -u origin main
```

5. Submit the public GitHub repository link with the assignment.

## Self-Reflection Recording Guide

For the recording deliverable, each member should explain one part of the project:

- Project goal and problem being solved.
- Landing page and branding decisions.
- Dashboard and user journey.
- Resume checker logic and result interpretation.
- Limitations and future improvements.
- Project management artifacts and updated timeline.
