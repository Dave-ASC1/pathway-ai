"use client";

import { useCallback, useState } from "react";
import { PathwayLoader } from "../components/PathwayLoader";

const sampleResume = `David Ademoye
Information Sciences and Technology student

Education
Penn State University, B.S. Information Sciences and Technology

Projects
Pathway AI: Designed a student career readiness platform using Next.js, TypeScript, and responsive UI patterns.
Inventory Dashboard: Built a dashboard that summarized operational data and presented action items for managers.

Skills
JavaScript, TypeScript, React, Next.js, data analysis, SQL, communication, teamwork`;

const sampleJobDescription = `Entry-Level Technical Analyst
We are looking for a candidate who can analyze business requirements, document workflows, communicate with stakeholders, support dashboards, use SQL, troubleshoot technical issues, and collaborate with cross-functional teams. Experience with data analysis, reporting, documentation, and problem solving is preferred.`;

const stopWords = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "but",
  "can",
  "for",
  "from",
  "has",
  "have",
  "into",
  "our",
  "that",
  "the",
  "this",
  "with",
  "will",
  "you",
  "your",
]);

type Analysis = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  sections: { label: string; present: boolean }[];
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3 && !stopWords.has(word));
}

function extractKeywords(jobDescription: string) {
  const counts = new Map<string, number>();

  tokenize(jobDescription).forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 18)
    .map(([word]) => word);
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function analyzeResume(resume: string, jobDescription: string): Analysis {
  const keywords = extractKeywords(jobDescription);
  const resumeWords = new Set(tokenize(resume));
  const matchedKeywords = keywords.filter((keyword) => resumeWords.has(keyword));
  const missingKeywords = keywords.filter((keyword) => !resumeWords.has(keyword));
  const matchRatio = keywords.length ? matchedKeywords.length / keywords.length : 0;

  const sections = [
    { label: "Education", present: includesAny(resume, ["education", "university", "college"]) },
    { label: "Projects", present: includesAny(resume, ["project", "portfolio", "built", "designed"]) },
    { label: "Skills", present: includesAny(resume, ["skills", "tools", "technologies"]) },
    { label: "Experience", present: includesAny(resume, ["experience", "intern", "work", "volunteer"]) },
    { label: "Impact", present: includesAny(resume, ["improved", "increased", "reduced", "%", "users"]) },
  ];

  const sectionScore = sections.filter((section) => section.present).length / sections.length;
  const score = Math.round(matchRatio * 72 + sectionScore * 28);

  const strengths = [
    matchedKeywords.length > 0
      ? `The resume already matches ${matchedKeywords.length} important role keyword${matchedKeywords.length === 1 ? "" : "s"}.`
      : "The resume has a foundation, but it needs more language from the target role.",
    sections.find((section) => section.label === "Projects")?.present
      ? "Project work is visible, which helps students with limited formal experience show proof of ability."
      : "Adding project work would make the resume stronger for student-level roles.",
    sections.find((section) => section.label === "Skills")?.present
      ? "The skills section helps recruiters quickly understand the student's toolset."
      : "A dedicated skills section would make the resume easier to scan.",
  ];

  const improvements = [
    missingKeywords.length > 0
      ? `Add truthful examples using missing keywords such as ${missingKeywords.slice(0, 5).join(", ")}.`
      : "Keyword coverage is strong. Focus next on clearer outcomes and stronger bullets.",
    sections.find((section) => section.label === "Impact")?.present
      ? "Keep impact language visible and connect each result to a project or work activity."
      : "Add measurable outcomes where possible, such as users supported, reports built, time saved, or errors reduced.",
    sections.find((section) => section.label === "Experience")?.present
      ? "Make sure experience bullets begin with action verbs and connect directly to the job description."
      : "If formal work experience is limited, add class projects, volunteer work, or campus leadership as experience.",
  ];

  return {
    score,
    matchedKeywords,
    missingKeywords,
    strengths,
    improvements,
    sections,
  };
}

export function ResumeCheckerClient() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis>(() => analyzeResume("", ""));
  const [analysisSource, setAnalysisSource] = useState<"claude" | "local">("local");

  const canAnalyze = resume.trim().length > 40 && jobDescription.trim().length > 40;

  const runAnalysis = useCallback(
    async (r: string = resume, jd: string = jobDescription) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: r, jobDescription: jd }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setAnalysis(data);
        setAnalysisSource(data.source ?? "local");
        setHasAnalyzed(true);
      } catch {
        const fallback = analyzeResume(r, jd);
        setAnalysis(fallback);
        setAnalysisSource("local");
        setHasAnalyzed(true);
      } finally {
        setIsLoading(false);
      }
    },
    [resume, jobDescription],
  );

  const currentAnalysis = analysis;

  return (
    <div className="checker-layout">
      <section className="checker-panel">
        <div className="workspace-heading compact">
          <div>
            <p className="app-kicker">Resume checker</p>
            <h1>Compare your resume to a target role.</h1>
          </div>
          <p>
            {!hasAnalyzed
              ? "Paste your resume and a target job description to get a match score and specific improvements."
              : analysisSource === "claude"
                ? "Powered by Pathway AI for advanced analysis of your resume against the job description."
                : "Analyzed using keyword matching and section detection."}
          </p>
        </div>

        <form
          className="checker-form"
          onSubmit={(event) => {
            event.preventDefault();
            runAnalysis();
          }}
        >
          <label>
            Resume text
            <textarea
              value={resume}
              onChange={(event) => {
                setResume(event.target.value);
                setHasAnalyzed(false);
              }}
              rows={13}
              placeholder="Paste your resume here..."
            />
          </label>

          <label>
            Target job description
            <textarea
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                setHasAnalyzed(false);
              }}
              rows={11}
              placeholder="Paste the job description here..."
            />
          </label>

          <div className="checker-actions">
            <button className="primary-action" disabled={!canAnalyze || isLoading} type="submit">
              {isLoading ? "Analyzing…" : "Analyze resume"}
            </button>
            <button
              className="secondary-action"
              type="button"
              disabled={isLoading}
              onClick={() => {
                setResume(sampleResume);
                setJobDescription(sampleJobDescription);
                runAnalysis(sampleResume, sampleJobDescription);
              }}
            >
              Try an example
            </button>
          </div>
        </form>
      </section>

      <aside className="results-panel" aria-live="polite">
        <div className="score-ring" aria-label={`Resume match score ${currentAnalysis.score}%`}>
          <span>{hasAnalyzed ? currentAnalysis.score : "--"}%</span>
          <p>Match score</p>
        </div>

        {isLoading ? (
          <div className="empty-state loading-state">
            <PathwayLoader />
            <h2>Analyzing your resume…</h2>
            <p>Pathway AI is reviewing your resume against the job description.</p>
          </div>
        ) : !canAnalyze ? (
          <div className="empty-state">
            <h2>Add enough resume and job description text.</h2>
            <p>
              The checker needs both sides of the comparison before it can
              generate useful feedback.
            </p>
          </div>
        ) : (
          <div className="results-stack">
            <section className="result-block">
              <h2>Matched keywords</h2>
              <div className="keyword-list">
                {currentAnalysis.matchedKeywords.slice(0, 10).map((keyword) => (
                  <span className="keyword matched" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </section>

            <section className="result-block">
              <h2>Missing keywords</h2>
              <div className="keyword-list">
                {currentAnalysis.missingKeywords.slice(0, 10).map((keyword) => (
                  <span className="keyword missing" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </section>

            <section className="result-block">
              <h2>Resume sections</h2>
              <div className="section-checks">
                {currentAnalysis.sections.map((section) => (
                  <div className="section-check" key={section.label}>
                    <span>{section.present ? "Ready" : "Add"}</span>
                    <p>{section.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="result-block">
              <h2>Strengths</h2>
              <ul>
                {currentAnalysis.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="result-block">
              <h2>Recommended improvements</h2>
              <ul>
                {currentAnalysis.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
