"use client";

import Link from "next/link";
import { deleteItem, useSavedItems, type SavedItem } from "@/lib/history";

type ResumeData = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  sections: { label: string; score: number }[];
  strengths: string[];
  improvements: string[];
};

type CareerData = {
  major?: string;
  paths: {
    title: string;
    fit: string;
    progression: string[];
    skills: string[];
    firstStep: string;
  }[];
};

type RoadmapData = {
  targetRole: string;
  summary: string;
  haveSkills: string[];
  steps: { skill: string; why: string; resource: string; time: string; priority: string }[];
};

type InterviewData = {
  role: string;
  averageScore: number;
  evaluations: {
    question: string;
    score: number;
    strengths: string;
    missing: string;
    modelAnswer: string;
  }[];
};

const typeLabels: Record<SavedItem["type"], string> = {
  resume: "Resume",
  career: "Career paths",
  roadmap: "Roadmap",
  interview: "Interview",
};

function metric(item: SavedItem): string {
  const d = item.data as Record<string, unknown>;
  if (item.type === "resume") return `${(d as ResumeData).score}%`;
  if (item.type === "interview") return `${(d as InterviewData).averageScore}%`;
  if (item.type === "career") return `${(d as CareerData).paths?.length ?? 0} paths`;
  if (item.type === "roadmap") return `${(d as RoadmapData).steps?.length ?? 0} steps`;
  return "";
}

function ResumeDetail({ data }: { data: ResumeData }) {
  return (
    <div className="results-stack">
      <section className="result-block">
        <h2>Match score</h2>
        <p className="saved-big-score">{data.score}%</p>
      </section>
      <section className="result-block">
        <h2>Matched keywords</h2>
        <div className="keyword-list">
          {data.matchedKeywords?.map((k) => (
            <span className="keyword matched" key={k}>{k}</span>
          ))}
        </div>
      </section>
      <section className="result-block">
        <h2>Missing keywords</h2>
        <div className="keyword-list">
          {data.missingKeywords?.map((k) => (
            <span className="keyword missing" key={k}>{k}</span>
          ))}
        </div>
      </section>
      <section className="result-block">
        <h2>Strengths</h2>
        <ul>{data.strengths?.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
      <section className="result-block">
        <h2>Recommended improvements</h2>
        <ul>{data.improvements?.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
    </div>
  );
}

function CareerDetail({ data }: { data: CareerData }) {
  return (
    <div className="path-grid">
      {data.paths?.map((p, i) => (
        <article className="path-card" key={p.title}>
          <span className="path-number">{String(i + 1).padStart(2, "0")}</span>
          <h2>{p.title}</h2>
          <p className="path-fit">{p.fit}</p>
          <div className="path-section">
            <h3>Typical progression</h3>
            <div className="path-progression">
              {p.progression?.map((role, idx) => (
                <span className="path-role" key={role}>
                  {role}
                  {idx < p.progression.length - 1 ? <em aria-hidden="true">→</em> : null}
                </span>
              ))}
            </div>
          </div>
          <div className="path-section">
            <h3>Skills to build</h3>
            <div className="keyword-list">
              {p.skills?.map((s) => <span className="keyword missing" key={s}>{s}</span>)}
            </div>
          </div>
          <div className="path-firststep">
            <h3>Your first step</h3>
            <p>{p.firstStep}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function RoadmapDetail({ data }: { data: RoadmapData }) {
  return (
    <div className="roadmap-stack">
      <div className="roadmap-summary">
        <h2>Where you stand</h2>
        <p>{data.summary}</p>
        {data.haveSkills?.length ? (
          <div className="roadmap-have">
            <h3>Skills you already have</h3>
            <div className="keyword-list">
              {data.haveSkills.map((s) => <span className="keyword matched" key={s}>{s}</span>)}
            </div>
          </div>
        ) : null}
      </div>
      <ol className="roadmap-steps">
        {data.steps?.map((step, i) => (
          <li className="roadmap-step" key={step.skill}>
            <div className="roadmap-step-number">{i + 1}</div>
            <div className="roadmap-step-body">
              <div className="roadmap-step-head">
                <h3>{step.skill}</h3>
                <span className={`priority priority-${step.priority.toLowerCase()}`}>
                  {step.priority} priority
                </span>
              </div>
              <p className="roadmap-step-why">{step.why}</p>
              <div className="roadmap-step-meta">
                <span><strong>Resource</strong> {step.resource}</span>
                <span><strong>Time</strong> {step.time}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function InterviewDetail({ data }: { data: InterviewData }) {
  return (
    <div className="interview-stack">
      <div className="score-ring" aria-label={`Average interview score ${data.averageScore}%`}>
        <span>{data.averageScore}%</span>
        <p>Average score</p>
      </div>
      {data.evaluations?.map((ev, i) => (
        <article className="interview-question" key={ev.question}>
          <div className="interview-q-head">
            <h3>Question {i + 1}</h3>
            <span className="interview-score">{ev.score}%</span>
          </div>
          <p className="interview-q-text">{ev.question}</p>
          <div className="interview-eval-block strengths">
            <h4>What worked</h4>
            <p>{ev.strengths}</p>
          </div>
          <div className="interview-eval-block missing">
            <h4>What was missing</h4>
            <p>{ev.missing}</p>
          </div>
          <div className="interview-eval-block model">
            <h4>A stronger answer</h4>
            <p>{ev.modelAnswer}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function Detail({ item }: { item: SavedItem }) {
  if (item.type === "resume") return <ResumeDetail data={item.data as ResumeData} />;
  if (item.type === "career") return <CareerDetail data={item.data as CareerData} />;
  if (item.type === "roadmap") return <RoadmapDetail data={item.data as RoadmapData} />;
  return <InterviewDetail data={item.data as InterviewData} />;
}

export function SavedClient() {
  const items = useSavedItems();

  return (
    <div className="saved-page">
      <div className="workspace-heading">
        <div>
          <p className="app-kicker">Saved</p>
          <h1>Your saved results.</h1>
        </div>
        <p>
          Saved to this browser only. Nothing is sent to a server or tied to an account.
          Clearing your browser data removes these.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h2>You have not saved anything yet.</h2>
          <p>
            Run any tool and press Save result to keep it here for later.{" "}
            <Link className="text-action" href="/resume-checker">
              Start with the resume checker
            </Link>
          </p>
        </div>
      ) : (
        <div className="saved-list">
          {items.map((item) => (
            <details className="saved-item" key={item.id}>
              <summary className="saved-summary">
                <span className={`saved-type type-${item.type}`}>{typeLabels[item.type]}</span>
                <span className="saved-title">{item.title}</span>
                <span className="saved-metric">{metric(item)}</span>
                <span className="saved-date">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  className="saved-delete"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteItem(item.id);
                  }}
                >
                  Delete
                </button>
              </summary>
              <div className="saved-detail">
                <Detail item={item} />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
