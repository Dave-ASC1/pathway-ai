# Pathway AI

**Live app:** https://pathway-aiapp.vercel.app

Pathway AI is a student-first career readiness platform that helps students improve resumes, discover realistic career paths, build skill roadmaps, and prepare for interviews.

This repository contains the implementation for the IST 440W capstone project. All four modules are built and running against the Claude API, and the app requires no account and costs nothing to use.

## Running This Project From Scratch (Complete Step-by-Step Guide)

This section is a full, beginner-friendly walkthrough for running Pathway AI on a
computer that has never seen the code before. It assumes nothing is installed and
that you have never used this project. Follow every step in order and the app will
run without errors, with all four modules fully working.

> **Why the code needs one extra step to run.** The live site at
> https://pathway-aiapp.vercel.app already has a private Claude API key configured
> on the hosting server, so it works for everyone who visits the URL. That key is a
> secret and is **deliberately not stored in this public repository** — putting an
> API key in a public repo would let anyone use it and run up charges. So when you
> download the code and run it yourself, you add the key once as a local setting
> (Step 6 below). This is normal, expected, and the correct way to handle secrets.

### Step 0 — What you need before you start

You need three things installed. If you already have them, skip to Step 1.

1. **Git** — the tool that downloads the code from GitHub.
   - Check if it is already installed. Open a terminal (on Windows use **Git Bash**
     or **PowerShell**; on macOS use **Terminal**; in a lab, open the Command Prompt
     or Terminal app) and type:
     ```bash
     git --version
     ```
   - If you see a version number, Git is installed. If you see "command not found,"
     download it from https://git-scm.com/downloads and run the installer with the
     default options.

2. **Node.js, version 20 or newer** — the engine that runs the app. `npm` (the
   package installer) comes bundled with it automatically.
   - Check if it is already installed:
     ```bash
     node --version
     ```
   - If you see `v20.x.x` or higher, you are set. If the number is lower than 20, or
     you see "command not found," download the **LTS** version from
     https://nodejs.org and run the installer with default options. After it
     finishes, close and reopen your terminal, then run `node --version` again to
     confirm.

3. **A Claude API key** — the credential that lets the four modules work. You get
   this from the Anthropic Console at https://console.anthropic.com under **API
   Keys**. It is a long string that starts with `sk-ant-`. Copy it somewhere you can
   paste from in Step 6. **Do not paste it into any file that gets committed to Git.**

### Step 1 — Choose a folder to work in

Pick a place to download the project, for example your Desktop, and move into it in
the terminal. `cd` means "change directory."

```bash
cd Desktop
```

### Step 2 — Download (clone) the code from GitHub

"Cloning" means copying the entire project from GitHub onto this computer. Run:

```bash
git clone https://github.com/Dave-ASC1/pathway-ai.git
```

You will see Git downloading the files. When it finishes, a new folder named
`pathway-ai` now exists inside your current folder.

### Step 3 — Move into the project folder

```bash
cd pathway-ai
```

Every command from here on is run from inside this folder. If you ever get lost,
run `pwd` (macOS/Linux/Git Bash) or `cd` (Windows) to see where you are; the path
should end in `pathway-ai`.

### Step 4 — Confirm you have the right files

List the contents of the folder to confirm the download worked:

```bash
ls
```

You should see files and folders including `app`, `lib`, `components`,
`package.json`, and this `README.md`. If you see them, the clone succeeded.

### Step 5 — Install the project's dependencies

The project relies on a set of code libraries. This one command reads
`package.json` and downloads all of them into a `node_modules` folder
automatically. You only need to do this once.

```bash
npm install
```

This takes a minute or two the first time. It is normal to see a progress bar and
a summary of packages at the end. If you see a few "warnings," that is fine —
warnings are not errors. Wait until your terminal returns to a normal prompt before
continuing.

### Step 6 — Add your Claude API key

This is the step that makes all four AI modules work locally. You are going to
create a small settings file named `.env.local` in the project folder and put your
key inside it. This file is already listed in `.gitignore`, so it will never be
committed to Git — your key stays private on this machine only.

**Option A — create the file with a command (quickest).** Replace
`sk-ant-your-key-here` with the actual key you copied in Step 0:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local
```

**Option B — create the file by hand.** Make a new file named exactly `.env.local`
in the `pathway-ai` folder, open it in any text editor, and paste this single line
(with your real key):

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Save and close the file. That is all the configuration the project needs.

> If you already deploy this project on Vercel and have the Vercel CLI installed,
> you can instead pull the key automatically with `vercel env pull .env.local`.
> The manual step above is simpler and needs no extra tools.

### Step 7 — Verify the code is healthy (optional but recommended)

Before running the app, you can prove the code builds cleanly and passes its tests.
These two commands are a strong thing to show on a recorded run because they
demonstrate the project is sound.

Run the automated test suite. All 79 tests should pass. These run offline and do
**not** use your API key or cost anything:

```bash
npm test -- --run
```

Then confirm the project builds for production without errors:

```bash
npm run build
```

A successful build ends with a summary of the pages and routes and returns you to
the prompt with no red error text.

### Step 8 — Run the app

Start the development server:

```bash
npm run dev
```

After a moment you will see a message like `Local: http://localhost:3000`. Leave
this terminal window open and running — it is now serving the app.

### Step 9 — Open the app in your browser

Open a web browser and go to:

```
http://localhost:3000
```

You should see the Pathway AI landing page with the journey board. The app is now
running from the freshly downloaded code on this computer.

### Step 10 — Reproduce the results shown in the report

With your key in place (Step 6), all four modules now produce real results. To
reproduce what appears in the report, use the **Try an example** button on each
module so you do not have to type a resume or find a job posting:

1. **Resume Checker** (`/resume-checker`) — click **Try an example**, then **Analyze
   resume**. You will get a match score, matched and missing keywords, a five-section
   breakdown, and improvement suggestions.
2. **Career Path Explorer** (`/career-path`) — click **Try an example**, then
   generate. You will get three career paths, each with a fit explanation,
   progression, skills, and a first step.
3. **Skill Gap Roadmap** (`/skill-gap`) — the target role and skills carry over from
   the earlier steps. Generate the roadmap to get a prioritized learning plan with
   reasons, resource types, and time estimates.
4. **Mock Interview Coach** (`/interview`) — the role carries over. Generate
   questions, answer one, and submit it to get a scored evaluation with strengths,
   gaps, and a model answer.

These are the same outputs documented in the project report.

### Stopping the app

When you are done, go back to the terminal running the server and press
**Ctrl + C** to stop it.

### If something goes wrong

- **`git: command not found`** — Git is not installed. Return to Step 0, part 1.
- **`node: command not found` or a version below 20** — Node.js is missing or too
  old. Return to Step 0, part 2, and install the LTS version.
- **`npm install` fails partway** — check your internet connection and run
  `npm install` again; it resumes safely.
- **The three non-resume modules say the AI service is unavailable** — the API key
  is missing or misspelled. Reopen `.env.local`, confirm the line reads
  `ANTHROPIC_API_KEY=` followed by your real key with no extra spaces or quotes,
  save it, stop the server with Ctrl + C, and run `npm run dev` again. The server
  only reads the key when it starts, so you must restart it after editing the file.
- **`http://localhost:3000` will not open** — make sure the `npm run dev` terminal
  is still running and did not report an error; that window must stay open while you
  use the app.

---


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

> If you are running this project for the first time on a fresh computer, follow the full walkthrough in **Running This Project From Scratch** above, which covers everything from installing Git and Node.js to reproducing the report's results. The steps below are a quick reference for people who already have the prerequisites installed.

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
