"use client";

import { useState } from "react";

type RoadmapStep = {
  skill: string;
  why: string;
  resource: string;
  time: string;
  priority: "High" | "Medium" | "Low";
};

type Roadmap = {
  summary: string;
  haveSkills: string[];
  steps: RoadmapStep[];
};

export function SkillGapClient() {
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = currentSkills.trim().length > 3 && targetRole.trim().length > 1;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSkills, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setRoadmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setRoadmap(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="career-layout">
      <section className="checker-panel">
        <div className="workspace-heading compact">
          <div>
            <p className="app-kicker">Skill Gap Roadmap</p>
            <h1>Build the skills that get you hired.</h1>
          </div>
          <p>
            List what you can do today and the role you want. Pathway AI will
            map the gap into a clear, prioritized learning plan you can follow.
          </p>
        </div>

        <form className="checker-form" onSubmit={handleSubmit}>
          <label>
            Your current skills
            <textarea
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              rows={5}
              placeholder="e.g. HTML, CSS, basic JavaScript, Excel, writing, teamwork. Built a couple of small class projects."
            />
          </label>

          <label>
            Target role
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Front-End Developer, Data Analyst, Product Manager"
            />
          </label>

          <div className="checker-actions">
            <button className="primary-action" disabled={!canSubmit || isLoading} type="submit">
              {isLoading ? "Building roadmap…" : "Build my roadmap"}
            </button>
          </div>
        </form>
      </section>

      <section className="career-results" aria-live="polite">
        {isLoading ? (
          <div className="empty-state">
            <h2>Building your roadmap…</h2>
            <p>Pathway AI is mapping the gap between your skills and the role.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>We hit a snag.</h2>
            <p>{error}</p>
          </div>
        ) : !roadmap ? (
          <div className="empty-state">
            <h2>Your roadmap will appear here.</h2>
            <p>
              Add your current skills and a target role, then build a step-by-step
              plan to close the gap.
            </p>
          </div>
        ) : (
          <div className="roadmap-stack">
            <div className="roadmap-summary">
              <h2>Where you stand</h2>
              <p>{roadmap.summary}</p>
              {roadmap.haveSkills.length > 0 ? (
                <div className="roadmap-have">
                  <h3>Skills you already have</h3>
                  <div className="keyword-list">
                    {roadmap.haveSkills.map((skill) => (
                      <span className="keyword matched" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <ol className="roadmap-steps">
              {roadmap.steps.map((step, index) => (
                <li className="roadmap-step" key={step.skill}>
                  <div className="roadmap-step-number">{index + 1}</div>
                  <div className="roadmap-step-body">
                    <div className="roadmap-step-head">
                      <h3>{step.skill}</h3>
                      <span className={`priority priority-${step.priority.toLowerCase()}`}>
                        {step.priority} priority
                      </span>
                    </div>
                    <p className="roadmap-step-why">{step.why}</p>
                    <div className="roadmap-step-meta">
                      <span>
                        <strong>Resource</strong> {step.resource}
                      </span>
                      <span>
                        <strong>Time</strong> {step.time}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
