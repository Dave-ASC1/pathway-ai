# Pathway AI Project Management Artifacts

## Updated Gantt Chart

```mermaid
gantt
    title Pathway AI MVP Updated Gantt Chart
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Discovery
    Review assignment requirements           :done, a1, 2026-06-21, 1d
    Review project brief and handoff files   :done, a2, 2026-06-21, 2d

    section Design
    Landing page visual redesign             :done, b1, 2026-06-23, 2d
    Branding and loader refinement           :done, b2, 2026-06-23, 2d
    Apple-style typography pass              :done, b3, 2026-06-24, 1d

    section MVP Implementation
    Dashboard workspace route                :done, c1, 2026-06-28, 1d
    Resume checker MVP                       :done, c2, 2026-06-28, 1d
    Responsive app styling                   :done, c3, 2026-06-28, 1d

    section Verification and Packaging
    Lint and production build                :done, d1, 2026-06-28, 1d
    Implementation documentation             :active, d2, 2026-06-28, 1d
    Screenshots and GitHub README            :d3, 2026-06-28, 1d
    Public GitHub submission                 :d4, 2026-06-29, 1d

    section Presentation
    Self-reflection recording preparation    :e1, 2026-06-29, 1d
    Final recording and submission           :e2, 2026-06-30, 1d
```

## Critical Path Analysis

The critical path is the sequence of tasks that must be completed for the assignment deliverable to be accepted as a runnable implementation package.

```mermaid
flowchart LR
    A["Review requirements"] --> B["Define MVP scope"]
    B --> C["Implement dashboard"]
    C --> D["Implement resume checker"]
    D --> E["Verify lint/build"]
    E --> F["Capture screenshots"]
    F --> G["Complete documentation"]
    G --> H["Publish public GitHub repo"]
    H --> I["Record self-reflection"]
```

### Critical Path Tasks

| Task | Dependency | Status |
| --- | --- | --- |
| Review assignment requirements | None | Complete |
| Define MVP scope | Requirements review | Complete |
| Implement dashboard | MVP scope | Complete |
| Implement resume checker | Dashboard route | Complete |
| Verify lint/build | Implementation | Complete |
| Capture screenshots | Working local app | Pending |
| Complete documentation | Implementation details | In progress |
| Publish public GitHub repo | Code and README | Pending |
| Record self-reflection | Working app and docs | Pending |

## PERT Chart

```mermaid
flowchart TD
    A["A: Requirements Review"] --> B["B: Scope MVP"]
    B --> C["C: Landing Page Polish"]
    B --> D["D: Dashboard Build"]
    D --> E["E: Resume Checker Build"]
    C --> F["F: Visual Verification"]
    E --> F
    F --> G["G: Documentation"]
    G --> H["H: GitHub Packaging"]
    H --> I["I: Presentation Recording"]
```

## PERT Estimate Table

| Activity | Optimistic | Most Likely | Pessimistic | Expected Time |
| --- | ---: | ---: | ---: | ---: |
| Requirements review | 0.5 day | 1 day | 1.5 days | 1.0 day |
| MVP scope definition | 0.5 day | 1 day | 2 days | 1.1 days |
| Landing page polish | 1 day | 2 days | 3 days | 2.0 days |
| Dashboard build | 0.5 day | 1 day | 2 days | 1.1 days |
| Resume checker build | 0.5 day | 1 day | 2 days | 1.1 days |
| Verification and screenshots | 0.5 day | 1 day | 1.5 days | 1.0 day |
| Documentation package | 1 day | 1.5 days | 3 days | 1.7 days |
| GitHub packaging | 0.5 day | 1 day | 2 days | 1.1 days |
| Self-reflection recording | 0.5 day | 1 day | 2 days | 1.1 days |

Expected time uses the PERT formula: `(Optimistic + 4 * Most Likely + Pessimistic) / 6`.
