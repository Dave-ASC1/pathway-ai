"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { JourneyBoard } from "../components/JourneyBoard";
import { PathwayLoader } from "../components/PathwayLoader";
import { ScoreGauge } from "../components/ScoreGauge";
import { SectionRadarChart } from "../components/SectionRadarChart";
import { saveItem } from "@/lib/history";
import { pickExample } from "@/lib/examples";
import { type Analysis, analyzeResume } from "@/lib/resume-analysis";
import { readSession, useSessionState, writeSession } from "@/lib/session";

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

// Stable reference for the initial (empty) analysis so session snapshots match.
const EMPTY_ANALYSIS: Analysis = analyzeResume("", "");

function bandColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

export function ResumeCheckerClient() {
  const [resume, setResume] = useSessionState("resume:text", "");
  const [jobDescription, setJobDescription] = useSessionState("resume:jd", "");
  const [hasAnalyzed, setHasAnalyzed] = useSessionState("resume:hasAnalyzed", false);
  const [analysis, setAnalysis] = useSessionState<Analysis>("resume:analysis", EMPTY_ANALYSIS);
  const [analysisSource, setAnalysisSource] = useSessionState<"claude" | "local">("resume:source", "local");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [example, setExample] = useState<{ id: string; label: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAnalyze = resume.trim().length > 40 && jobDescription.trim().length > 40;

  function loadExample() {
    const next = pickExample(example?.id);
    setResume(next.resumeChecker.resume);
    setJobDescription(next.resumeChecker.jobDescription);
    setExample({ id: next.id, label: next.label });
    setUploadedName(null);
    setUploadError(null);
    runAnalysis(next.resumeChecker.resume, next.resumeChecker.jobDescription);
  }

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
      setExample(null);
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
      setAnalysisError(null);
      try {
        const res = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: r, jobDescription: jd }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          // A real response from our own API (input too long, rate limited,
          // etc.) — show it instead of silently substituting local results.
          setAnalysisError(data?.error ?? "Something went wrong. Please try again.");
        } else {
          setAnalysis(data);
          setAnalysisSource(data.source ?? "local");
          setHasAnalyzed(true);
        }
      } catch {
        // The API itself was unreachable (network/server down) — degrade to
        // the local analyzer so the tool still works rather than dead-ending.
        const fallback = analyzeResume(r, jd);
        setAnalysis(fallback);
        setAnalysisSource("local");
        setHasAnalyzed(true);
      } finally {
        setIsLoading(false);
        // Carry the resume's skills into the roadmap unless it already has skills.
        const skills = extractSkillsSection(r);
        if (skills && !readSession("roadmap:currentSkills", "")) {
          writeSession("roadmap:currentSkills", skills);
        }
        // Carry the job description into the interview coach unless it already has input.
        if (jd.trim() && !readSession("interview:role", "")) {
          writeSession("interview:role", jd);
        }
      }
    },
    [resume, jobDescription, setAnalysis, setAnalysisSource, setHasAnalyzed],
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
              ? "Paste your resume and the job. Get a score and what to fix."
              : analysisSource === "claude"
                ? "Powered by Pathway AI."
                : "Analyzed using keyword matching."}
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
                // Their own text now, so stop claiming a sample profile is loaded.
                setExample(null);
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
                setExample(null);
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
              onClick={loadExample}
            >
              {example ? "Try another example" : "Try an example"}
            </button>
          </div>
          {example ? <p className="example-status">Loaded {example.label}.</p> : null}
        </form>
      </section>

      <aside className="results-panel" aria-live="polite">
        <div className="score-ring" aria-label={`Resume match score ${hasAnalyzed ? currentAnalysis.score : 0}%`}>
          {hasAnalyzed ? (
            <ScoreGauge score={currentAnalysis.score} />
          ) : (
            <>
              <span>--%</span>
              <p>Match score</p>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="empty-state loading-state">
            <PathwayLoader />
            <h2>Analyzing your resume…</h2>
            <p>Pathway AI is reviewing your resume against the job description.</p>
          </div>
        ) : analysisError ? (
          <div className="empty-state">
            <h2>We hit a snag.</h2>
            <p>{analysisError}</p>
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

            <div className="stat-cards">
              <div className="stat-card">
                <span style={{ color: "#166534" }}>{currentAnalysis.matchedKeywords.length}</span>
                <p>Matched keywords</p>
              </div>
              <div className="stat-card">
                <span style={{ color: "var(--brand-blue)" }}>{currentAnalysis.missingKeywords.length}</span>
                <p>Missing keywords</p>
              </div>
              <div className="stat-card">
                <span style={{ color: "var(--deep-navy)" }}>
                  {currentAnalysis.sections.filter((section) => section.score >= 70).length}/
                  {currentAnalysis.sections.length}
                </span>
                <p>Sections strong</p>
              </div>
            </div>

            <section className="result-block">
              <h2>Resume sections</h2>
              <div className="section-overview">
                <SectionRadarChart sections={currentAnalysis.sections} />
                <div className="section-score-grid">
                  {currentAnalysis.sections.map((section) => (
                    <div className="section-score-card" key={section.label}>
                      <div className="section-score-card-top">
                        <p>{section.label}</p>
                        <span style={{ color: bandColor(section.score) }}>{section.score}%</span>
                      </div>
                      <div className="section-score-bar">
                        <div
                          className="section-score-bar-fill"
                          style={{ width: `${section.score}%`, background: bandColor(section.score) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

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

            <div className="result-columns">
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
                    href="/skill-gap"
                    onClick={() => {
                      const skills =
                        extractSkillsSection(resume) ||
                        currentAnalysis.matchedKeywords.slice(0, 12).join(", ");
                      if (skills) writeSession("roadmap:currentSkills", skills);
                    }}
                  >
                    Build a skill roadmap
                  </Link>
                </div>
              </section>
            ) : null}

            {hasAnalyzed ? (
              <section className="result-block">
                <JourneyBoard context="embed" currentStop="resume" />
              </section>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
