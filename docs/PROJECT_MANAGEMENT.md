# Pathway AI Project Management Artifacts

**Project window: May 20, 2026 – August 12, 2026**

## Gantt Chart

```mermaid
gantt
    title Pathway AI — Project Gantt Chart (May 20 – Aug 12)
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Documentation
    Project Brief & Literature Review     :done, a1, 2026-05-20, 14d
    Midterm Presentation & Paper Demo     :done, a2, 2026-05-27, 21d
    Prompt Log & Response to Reviewers    :done, a3, 2026-06-03, 14d

    section Frontend MVP
    Landing Page Design & Branding        :done, b1, 2026-06-10, 10d
    Dashboard Route                       :done, b2, 2026-06-17, 7d
    Resume Checker MVP                    :done, b3, 2026-06-17, 10d
    Build Verification (lint/build)       :done, b4, 2026-06-26, 3d

    section Deployment & Docs
    Vercel Deployment & Public URL        :active, c1, 2026-06-29, 5d
    Screenshots & README Update           :active, c2, 2026-06-29, 4d

    section AI Integration
    Claude API Integration                :c3, 2026-07-01, 14d
    Clerk Authentication                  :c4, 2026-07-04, 10d
    NeonDB + Prisma Setup                 :c5, 2026-07-09, 10d

    section Module Development
    Career Path Explorer                  :d1, 2026-07-14, 14d
    Skill Gap Roadmap                     :d2, 2026-07-21, 14d
    Mock Interview Coach                  :d3, 2026-07-28, 18d

    section Final
    Testing & QA                          :e1, 2026-08-06, 4d
    Final Documentation & Submission      :e2, 2026-08-08, 4d
    Capstone Presentation                 :e3, 2026-08-11, 2d
```

## Critical Path Analysis

The critical path is the sequence of dependent tasks that directly controls the August 12 submission date.

```mermaid
flowchart LR
    A["Requirements\n& Brief"] --> C["Design &\nBranding"]
    C --> E["Resume\nChecker MVP"]
    E --> F["Vercel\nDeploy"]
    F --> G["Claude API\nIntegration"]
    G --> H["Auth &\nDatabase"]
    H --> K["Mock Interview\nCoach"]
    K --> L["Final Docs\n& Submission"]
```

### Critical Path Tasks

| Task | Expected Duration | Status |
|------|-------------------|--------|
| Requirements & Project Brief | 5 days | Complete |
| Design & Branding | 8 days | Complete |
| Dashboard & Resume Checker MVP | 8 days | Complete |
| Vercel Deployment | 4 days | In Progress |
| Claude API Integration | 12 days | Planned |
| Authentication & Database | 10 days | Planned |
| Mock Interview Coach | 14 days | Planned |
| Final Documentation & Submission | 8 days | Planned |

**Total critical path: ~69 expected days. Project window: 84 days. Float: ~15 days.**

## PERT Estimates

te = (Optimistic + 4 × Most Likely + Pessimistic) / 6

| ID | Task | O | M | P | te |
|----|------|---|---|---|----|
| A | Requirements & Brief | 3 | 5 | 7 | 5.0 |
| B | Literature Review | 5 | 7 | 10 | 7.2 |
| C | Design & Branding | 5 | 8 | 12 | 8.2 |
| D | Dashboard Route | 3 | 5 | 8 | 5.2 |
| E | Resume Checker MVP | 5 | 8 | 12 | 8.2 |
| F | Vercel Deployment | 2 | 4 | 7 | 4.2 |
| G | Claude API Integration | 7 | 12 | 18 | 12.2 |
| H | Auth + Database | 7 | 10 | 15 | 10.3 |
| I | Career Path Explorer | 7 | 12 | 18 | 12.2 |
| J | Skill Gap Roadmap | 7 | 12 | 18 | 12.2 |
| K | Mock Interview Coach | 10 | 14 | 21 | 14.5 |
| L | Final Docs & Submission | 5 | 8 | 12 | 8.2 |

## PERT Chart

```mermaid
flowchart TD
    A["A: Requirements\n& Brief\nte=5.0d"] --> C["C: Design\n& Branding\nte=8.2d"]
    A --> D["D: Dashboard\nRoute\nte=5.2d"]
    B["B: Literature\nReview\nte=7.2d"] --> D
    C --> E["E: Resume\nChecker\nte=8.2d"]
    D --> E
    D --> F["F: Vercel\nDeploy\nte=4.2d"]
    E --> G["G: Claude API\nIntegration\nte=12.2d"]
    F --> H["H: Auth &\nDatabase\nte=10.3d"]
    G --> I["I: Career Path\nExplorer\nte=12.2d"]
    G --> J["J: Skill Gap\nRoadmap\nte=12.2d"]
    H --> J
    H --> K["K: Mock Interview\nCoach\nte=14.5d"]
    I --> L["L: Final Docs\n& Submission\nte=8.2d"]
    J --> L
    K --> L
```
