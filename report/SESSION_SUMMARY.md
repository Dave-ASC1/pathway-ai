# Pathway AI - Capstone Session Summary

**Student:** David Ademoye | **Course:** IST 440W Capstone, Penn State
**Date:** July 6, 2026 | **Status snapshot:** July 6, 2026
**Live URL:** https://pathway-aiapp.vercel.app | **Repo:** https://github.com/Dave-ASC1/pathway-ai

A condensed record of everything produced and decided in this session. All output files live in `pathway-ai/report/`.

---

## 1. What we built (deliverables)

| File | What it is |
|------|------------|
| `Pathway_AI_Enhancement_Report.docx` | Main report. 10 sections, 8 embedded figures (2 flowcharts, 3 screenshots, 3 project charts). Arial, navy headings, no em dashes. |
| `Pathway_AI_Project_Management_Charts_Updated.docx` | Standalone updated Gantt, CPA, and PERT charts with an updated PERT status table. |
| `Pathway_AI_Development_Prompts_Log.docx` | The 7 development/session prompts, each with a purpose note. |
| `Pathway_AI_Video_Reflection_Script.docx` | Teleprompter script for the video reflection (~7.8 min, first person). |
| `simple-phase.svg` / `.png` | Flowchart: before enhancements. |
| `enhanced-phase.svg` / `.png` | Flowchart: after enhancements. |
| `gantt_updated.png`, `cpa_updated.png`, `pert_updated.png` | Regenerated project charts (as of July 6). |
| `before_mvp.png`, `after_landing.png`, `results_dashboard.png` | Redesign screenshots (before / after / results). |

**Regeneration scripts** (all in `report/`): `generate-report.js` (docx-js), `generate-updated-charts.py` (matplotlib), `build-charts-doc.py`, `build-prompts-doc.py`, `build-reflection-script.py` (python-docx). SVG to PNG via cairosvg at 2600px / 300 DPI.

---

## 2. The enhancement (before vs after)

**Before (Simple Phase):** one working module (resume checker via client-side keyword matching); three placeholder modules; no backend; no data sharing.

**After (Enhanced Phase):** all four modules powered by Claude Opus 4.8 through five server-side, rate-limited API routes; data handoff between modules (resume text + skills flow through); file upload (PDF/DOCX); local deterministic fallback on every route; results persisted (browser storage).

**Flowcharts** (report Section 3):
- Figure 1 - Simple Phase: blue = functional, red = local/limited (no AI), gray = placeholder.
- Figure 2 - Enhanced Phase: blue = functional, cyan = Claude AI module, purple = backend API route, dashed = data handoff.

---

## 3. Current project status (July 6, 2026)

- **Complete:** requirements, design, dashboard, resume checker, Vercel deployment (public URL live), Claude API integration, and all four AI modules.
- **In progress:** Testing & QA; Final documentation & submission.
- **Planned (stretch, off critical path):** Clerk authentication and NeonDB + Prisma. These were intentionally deferred; the app uses browser-based storage instead, so they carry slack and do not affect the Aug 12 submission.

**Updated charts** reflect this: Gantt (Figure 6), Critical Path (Figure 7), PERT (Figure 8). Critical path now runs only through Testing & QA then Final Docs & Submission; Auth + Database sits on a parallel, non-critical track.

---

## 4. UI redesign (professor feedback)

Feedback: make the platform more captivating for students. Response: a journey-metaphor landing page (winding road, four waypoints, moving car, finish line) plus a cleaner, more visual results dashboard. Documented in report Section 7:
- Figure 4 - Before: plain, form-heavy keyword MVP (30% demo).
- Figure 5 - After: "From confused to career-ready in 4 steps" journey landing page.
- Figure 3 - Results: enhanced resume dashboard (82% match, radar + section bars).

Brand kept intact: navy, soft blue accents, four-dot pathway logo.

---

## 5. Prompts - two distinct sets

- **Application prompts (5):** what the app sends to the Claude API at runtime (resume analysis, career paths, skill gap, interview questions, interview scoring). Live in report Section 4.
- **Development prompts (7):** what David typed to Claude to build and redesign the app. Kept in a separate log (`Pathway_AI_Development_Prompts_Log.docx`), matching the professor's separate "prompts used" deliverable.

Recommendation followed: keep the two sets separate so the report stays focused and the prompt log stands alone.

---

## 6. Housekeeping / notes

- `report/_check/` is a leftover unzip folder from doc verification. Safe to delete; add to `.gitignore` (delete was declined in-session).
- Brand rules held throughout: always "Pathway AI" (never Claude/Anthropic in UI); no em or en dashes in copy or generated output.
- Sharp (npm) could not convert SVGs in the Linux build env (macOS binary); cairosvg used instead.

---

## 7. Suggested next steps

- Copy final `.docx` deliverables into `docs/` for submission.
- Optionally add a one-line cross-reference in the report pointing to the development prompt log.
- Refresh `SELF_REFLECTION.md` date/status line for consistency.
- Optional: a shorter 3-minute reflection cut.
