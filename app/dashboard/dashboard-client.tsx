"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useSessionState } from "@/lib/session";

type Step = {
  id: string;
  label: string;
  href: string;
  colorClass: string;
};

const steps: Step[] = [
  { id: "resume", label: "Resume", href: "/resume-checker", colorClass: "stop-resume" },
  { id: "career", label: "Career paths", href: "/career-path", colorClass: "stop-career" },
  { id: "roadmap", label: "Roadmap", href: "/skill-gap", colorClass: "stop-roadmap" },
  { id: "interview", label: "Interview", href: "/interview", colorClass: "stop-interview" },
];

export function DashboardClient() {
  const [resumeDone] = useSessionState("resume:hasAnalyzed", false);
  const [careerResult] = useSessionState<unknown>("career:result", null);
  const [roadmapResult] = useSessionState<unknown>("roadmap:result", null);
  const [interviewPhase] = useSessionState("interview:phase", "input");

  const doneMap: Record<string, boolean> = {
    resume: resumeDone === true,
    career: Array.isArray(careerResult) && careerResult.length > 0,
    roadmap: !!roadmapResult,
    interview: interviewPhase === "results",
  };

  const completedCount = Object.values(doneMap).filter(Boolean).length;
  const nextStep = steps.find((step) => !doneMap[step.id]) ?? steps[steps.length - 1];

  const ctaLabel =
    completedCount === 0
      ? "Start with your resume"
      : completedCount === steps.length
        ? "Review your saved results"
        : "Continue where you left off";
  const ctaHref = completedCount === steps.length ? "/saved" : nextStep.href;

  return (
    <div className="journey-hub">
      <section className="app-hero">
        <div>
          <p className="app-kicker">Your journey</p>
          <h1>{completedCount} of {steps.length} steps done.</h1>
        </div>
        <div className="app-hero-actions">
          <Link className="primary-action" href={ctaHref}>
            {ctaLabel}
          </Link>
          <Link className="text-action" href="/saved">
            View saved results
          </Link>
        </div>
      </section>

      <nav className="journey-path" aria-label="Career readiness path">
        {steps.map((step, index) => {
          const done = doneMap[step.id];
          const isNext = step.id === nextStep.id && !done;
          return (
            <Fragment key={step.id}>
              <Link
                href={step.href}
                className={`journey-stop ${step.colorClass}${done ? " done" : ""}${isNext ? " next" : ""}`}
              >
                <span className="journey-stop-icon" aria-hidden="true">
                  {done ? "✓" : index + 1}
                </span>
                <span className="journey-stop-label">{step.label}</span>
              </Link>
              {index < steps.length - 1 ? (
                <span className="journey-connector" aria-hidden="true" />
              ) : null}
            </Fragment>
          );
        })}
      </nav>

      <p className="journey-hint">Click any step to jump in. Your progress is saved as you go.</p>
    </div>
  );
}
