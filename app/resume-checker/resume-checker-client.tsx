"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { PathwayLoader } from "../components/PathwayLoader";
import { saveItem } from "@/lib/history";

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

// Pull the Skills section out of a pasted resume so it can be reused elsewhere.
function extractSkillsSection(resumeText: string): string {
  const lines = resumeText.split("\n");
  const inlineHeading = /^(technical skills|core skills|key skills|skills)\s*[:\-–]\s*(.+)$/i;
  const blockHeading = /^(technical skills|core skills|key skills|skills)\s*:?\s*$/i;
  const nextSection =
    /^(education|experience|projects?|work|employment|certifications?|awards?|activities|leadership|summary|objective|profile|interests|volunteer|references)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const inline = line.match(inlineHeading);
    if (inline) return inline[2].trim();

    if (blockHeading.test(line)) {
      const collected: string[] = [];
      for (let j = i + 1; j < lines.length && collected.length < 5; j++) {
        const next = lines[j].trim();
        if (!next) {
          if (collected.length) break;
          continue;
        }
        if (nextSection.test(next)) break;
        collected.push(next);
      }
      if (collected.length) return collected.join(", ");
    }
  }
  return "";
}

export function ResumeCheckerClient() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis>(() => analyzeResume("", ""));
  const [analysisSource, setAnalysisSource] = useState<"claude" | "local">("local");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAnalyze = resume.trim().length > 40 && jobDescription.trim().length > 40;

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so selecting the same file again still fires onChange
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not read that file.");
      setResume(data.text);
      setUploadedName(file.name);
      setHasAnalyzed(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not read that file.");
      setUploadedName(null);
    } finally {
      setIsUploading(false);
    }
  }

  const runAnalysis = useCallback(
    async (r: string = resume, jd: string = jobDescription) => {
      setIsLoading(true);
      setSaved(false);
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

  function handleSave() {
    const firstLine = jobDescription.split("\n").map((l) => l.trim()).find(Boolean);
    const title = firstLine ? firstLine.slice(0, 60) : "Resume analysis";
    saveItem("resume", title, currentAnalysis);
    setSaved(true);
  }

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
          <div className="checker-field">
            <div className="field-label-row">
              <label htmlFor="resume-text" className="field-label">
                Resume text
              </label>
              <span className="upload-control">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="upload-input"
                  tabIndex={-1}
                />
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Reading file…" : "Upload PDF or DOCX"}
                </button>
              </span>
            </div>
            <textarea
              id="resume-text"
              value={resume}
              onChange={(event) => {
                setResume(event.target.value);
                setHasAnalyzed(false);
                setUploadedName(null);
              }}
              rows={13}
              placeholder="Paste your resume here, or upload a file above."
            />
            {uploadedName ? (
              <span className="upload-status">Loaded from {uploadedName}. You can edit it above.</span>
            ) : null}
            {uploadError ? <span className="upload-status error">{uploadError}</span> : null}
          </div>

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
            {hasAnalyzed ? (
              <div className="save-toolbar">
                <button
                  className="save-button"
                  type="button"
                  onClick={handleSave}
                  disabled={saved}
                >
                  {saved ? "Saved ✓" : "Save result"}
                </button>
              </div>
            ) : null}

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

            {hasAnalyzed ? (
              <section className="result-block continue-block">
                <h2>Next step</h2>
                <p>Now find roles that fit and build a plan to land them.</p>
                <div className="continue-links">
                  <Link className="text-action" href="/career-path">
                    Explore career paths
                  </Link>
                  <Link
                    className="text-action"
                    href={(() => {
                      const skills =
                        extractSkillsSection(resume) ||
                        currentAnalysis.matchedKeywords.slice(0, 12).join(", ");
                      return skills
                        ? `/skill-gap?skills=${encodeURIComponent(skills.slice(0, 500))}`
                        : "/skill-gap";
                    })()}
                  >
                    Build a skill roadmap
                  </Link>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
