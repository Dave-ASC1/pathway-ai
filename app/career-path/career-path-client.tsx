"use client";

import Link from "next/link";
import { useState } from "react";
import { PathwayLoader } from "../components/PathwayLoader";

type CareerPath = {
  title: string;
  fit: string;
  progression: string[];
  skills: string[];
  firstStep: string;
};

const yearOptions = [
  "First year",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate student",
  "Recent graduate",
];

export function CareerPathClient() {
  const [major, setMajor] = useState("");
  const [year, setYear] = useState(yearOptions[2]);
  const [interests, setInterests] = useState("");
  const [targetIndustries, setTargetIndustries] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [paths, setPaths] = useState<CareerPath[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = major.trim().length > 1 && interests.trim().length > 3;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/career-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ major, year, interests, targetIndustries }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setPaths(data.paths);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPaths(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="career-layout">
      <section className="checker-panel">
        <div className="workspace-heading compact">
          <div>
            <p className="app-kicker">Career Path Explorer</p>
            <h1>Find career directions worth pursuing.</h1>
          </div>
          <p>
            Tell us about yourself and Pathway AI will map three realistic career
            paths, including the roles, the skills, and your first step toward each.
          </p>
        </div>

        <form className="checker-form" onSubmit={handleSubmit}>
          <label>
            Major or field of study
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Information Sciences and Technology"
            />
          </label>

          <label>
            Year
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Interests, strengths, and what you enjoy
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              rows={4}
              placeholder="e.g. I like solving problems with data, building things, and working with people. I'm strong at writing and organizing."
            />
          </label>

          <label>
            Target industries (optional)
            <input
              type="text"
              value={targetIndustries}
              onChange={(e) => setTargetIndustries(e.target.value)}
              placeholder="e.g. healthcare, finance, tech (or leave blank)"
            />
          </label>

          <div className="checker-actions">
            <button className="primary-action" disabled={!canSubmit || isLoading} type="submit">
              {isLoading ? "Generating paths…" : "Explore career paths"}
            </button>
          </div>
        </form>
      </section>

      <section className="career-results" aria-live="polite">
        {isLoading ? (
          <div className="empty-state loading-state">
            <PathwayLoader />
            <h2>Mapping your career paths…</h2>
            <p>Pathway AI is analyzing your profile to find realistic directions.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>We hit a snag.</h2>
            <p>{error}</p>
          </div>
        ) : !paths ? (
          <div className="empty-state">
            <h2>Your career paths will appear here.</h2>
            <p>
              Fill in your major and interests, then explore three paths tailored
              to your background.
            </p>
          </div>
        ) : (
          <div className="path-grid">
            {paths.map((path, index) => (
              <article className="path-card" key={path.title}>
                <span className="path-number">{String(index + 1).padStart(2, "0")}</span>
                <h2>{path.title}</h2>
                <p className="path-fit">{path.fit}</p>

                <div className="path-section">
                  <h3>Typical progression</h3>
                  <div className="path-progression">
                    {path.progression.map((role, i) => (
                      <span className="path-role" key={role}>
                        {role}
                        {i < path.progression.length - 1 ? <em aria-hidden="true">→</em> : null}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="path-section">
                  <h3>Skills to build</h3>
                  <div className="keyword-list">
                    {path.skills.map((skill) => (
                      <span className="keyword missing" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="path-firststep">
                  <h3>Your first step</h3>
                  <p>{path.firstStep}</p>
                </div>

                <div className="path-actions">
                  <Link
                    className="text-action"
                    href={`/skill-gap?role=${encodeURIComponent(path.title)}`}
                  >
                    Build a roadmap for this
                  </Link>
                  <Link
                    className="text-action"
                    href={`/interview?role=${encodeURIComponent(path.title)}`}
                  >
                    Practice interview
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
