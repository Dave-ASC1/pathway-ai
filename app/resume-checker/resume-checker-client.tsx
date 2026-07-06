"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { JourneyBoard } from "../components/JourneyBoard";
import { PathwayLoader } from "../components/PathwayLoader";
import { ScoreGauge } from "../components/ScoreGauge";
import { SectionRadarChart } from "../components/SectionRadarChart";
import { saveItem } from "@/lib/history";
import { readSession, useSessionState, writeSession } from "@/lib/session";

const sampleResume = `Jordan Miles
IT Operations Analyst

Summary
Reliable IT Operations Analyst with hands-on experience keeping servers, network infrastructure, incidents, and tickets running smoothly in a fast paced support environment.

Education
Pennsylvania State University, B.S. Information Sciences and Technology
Relevant coursework: network administration, systems support, and IT service management

Experience
IT Operations Analyst Intern, Keystone Health Systems, University Park, PA (May 2024 to present)
Supported daily IT operations for a 400 person company, keeping systems and services online.
Monitored servers and responded within minutes when servers reported a problem, which reduced downtime.
Monitored network infrastructure and kept the network stable across three office locations.
Took ownership of incidents from first report to close, tracking each ticket in the system and resolving more than 40 tickets a week.
Logged every incident and closed tickets within same day service targets, which improved response time by 30%.
Resolved hardware problems and resolved software problems for 200 plus users, increasing first call resolution.
Wrote clear documentation for new systems so documentation stayed current for the whole support team.
Configured Windows Server and supported Windows desktops across every department.
Managed Active Directory accounts and maintained Active Directory groups for onboarding and offboarding.
Supported Azure subscriptions and reviewed Azure billing monthly to control cloud costs.
Ran backups on a schedule and verified backups regularly, achieving a 100 percent recovery success rate.
Built automation scripts that reduced manual work and increased team output.
Monitored security alerts and reviewed security logs weekly to protect company data.
Prepared compliance reports and tracked compliance deadlines for every audit with zero missed findings.
Followed change management steps and documented every change carefully before deployment.

Volunteer Experience
Volunteer IT Support, Local Community Center
Supported the helpdesk queue on weekends and trained new helpdesk volunteers on ticketing tools.

Projects
Home Lab Automation: Built and designed a home lab environment to practice Windows Server, Active Directory, and Azure administration.
Helpdesk Portfolio Project: Designed a small ticketing portfolio site to track tickets and incidents for a mock support team.

Skills
Windows Server, Active Directory, Azure, networking, ticketing systems, automation scripting, security monitoring, compliance reporting, backups, documentation, tools: PowerShell, Intune, ServiceNow, and other IT operations technologies`;

const sampleJobDescription = `IT Operations Analyst

We are hiring an IT Operations Analyst for our growing operations team. This analyst keeps daily technology operations running smoothly for the whole company.

Responsibilities:
Monitor servers and respond when servers report a problem. Monitor network infrastructure so the network stays stable. Manage incidents from open to close and log incidents in the tracker. Open tickets for new incidents and close tickets once resolved.

Troubleshoot hardware problems and troubleshoot software problems for staff. Write clear documentation for new systems so documentation stays current.

Configure Windows Server and support Windows desktops. Manage Active Directory accounts and maintain Active Directory groups. Support Azure subscriptions and review Azure billing.

Run backups on a schedule and verify backups regularly. Build automation scripts and expand automation to save time.

Monitor security alerts and review security logs. Prepare compliance reports and track compliance deadlines.

Support the helpdesk queue and train new helpdesk staff. Follow change management steps and document every change carefully.`;

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
  sections: { label: string; score: number }[];
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

// Scores a section 0-100 from how many of its trigger terms show up in the
// resume, so the local (non-AI) fallback can still show a progress bar
// instead of a flat yes/no.
function sectionScore(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  const hits = terms.filter((term) => lower.includes(term)).length;
  if (hits === 0) return 20;
  return Math.min(100, Math.round(35 + (hits / terms.length) * 65));
}

function analyzeResume(resume: string, jobDescription: string): Analysis {
  const keywords = extractKeywords(jobDescription);
  const resumeWords = new Set(tokenize(resume));
  const matchedKeywords = keywords.filter((keyword) => resumeWords.has(keyword));
  const missingKeywords = keywords.filter((keyword) => !resumeWords.has(keyword));
  const matchRatio = keywords.length ? matchedKeywords.length / keywords.length : 0;

  const sections = [
    { label: "Education", score: sectionScore(resume, ["education", "university", "college"]) },
    { label: "Projects", score: sectionScore(resume, ["project", "portfolio", "built", "designed"]) },
    { label: "Skills", score: sectionScore(resume, ["skills", "tools", "technologies"]) },
    { label: "Experience", score: sectionScore(resume, ["experience", "intern", "work", "volunteer"]) },
    { label: "Impact", score: sectionScore(resume, ["improved", "increased", "reduced", "%", "users"]) },
  ];

  const avgSectionScore = sections.reduce((sum, section) => sum + section.score, 0) / sections.length / 100;
  const score = Math.round(matchRatio * 72 + avgSectionScore * 28);

  const findSection = (label: string) => sections.find((section) => section.label === label)?.score ?? 0;

  const strengths = [
    matchedKeywords.length > 0
      ? `The resume already matches ${matchedKeywords.length} important role keyword${matchedKeywords.length === 1 ? "" : "s"}.`
      : "The resume has a foundation, but it needs more language from the target role.",
    findSection("Projects") >= 60
      ? "Project work is visible, which helps students with limited formal experience show proof of ability."
      : "Adding project work would make the resume stronger for student-level roles.",
    findSection("Skills") >= 60
      ? "The skills section helps recruiters quickly understand the student's toolset."
      : "A dedicated skills section would make the resume easier to scan.",
  ];

  const improvements = [
    missingKeywords.length > 0
      ? `Add truthful examples using missing keywords such as ${missingKeywords.slice(0, 5).join(", ")}.`
      : "Keyword coverage is strong. Focus next on clearer outcomes and stronger bullets.",
    findSection("Impact") >= 60
      ? "Keep impact language visible and connect each result to a project or work activity."
      : "Add measurable outcomes where possible, such as users supported, reports built, time saved, or errors reduced.",
    findSection("Experience") >= 60
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
