"use client";

import { useState } from "react";
import { PathwayLoader } from "../components/PathwayLoader";

type Question = {
  question: string;
  type: "Behavioral" | "Technical";
};

type Evaluation = {
  question: string;
  score: number;
  strengths: string;
  missing: string;
  modelAnswer: string;
};

type Phase = "input" | "answering" | "results";

export function InterviewClient({ initialRole = "" }: { initialRole?: string }) {
  const [role, setRole] = useState(initialRole);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [phase, setPhase] = useState<Phase>("input");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canGenerate = role.trim().length > 2;
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const averageScore = evaluations.length
    ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
    : 0;

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setLoadingLabel("Generating your interview questions…");
    setError(null);
    try {
      const res = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setEvaluations([]);
      setPhase("answering");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEvaluate() {
    setIsLoading(true);
    setLoadingLabel("Reviewing your answers…");
    setError(null);
    try {
      const payload = questions.map((q, i) => ({ question: q.question, answer: answers[i] }));
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, answers: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setEvaluations(data.evaluations);
      setPhase("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function startOver() {
    setQuestions([]);
    setAnswers([]);
    setEvaluations([]);
    setPhase("input");
    setError(null);
  }

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function findAnswer(question: string) {
    const idx = questions.findIndex((q) => q.question === question);
    return idx >= 0 ? answers[idx] : "";
  }

  return (
    <div className="career-layout">
      {phase === "input" ? (
        <section className="checker-panel">
          <div className="workspace-heading compact">
            <div>
              <p className="app-kicker">Mock Interview Coach</p>
              <h1>Practice the interview before it counts.</h1>
            </div>
            <p>
              Enter a role or paste a job description. Pathway AI will ask you
              real interview questions, then review your answers with a score and
              specific coaching.
            </p>
          </div>

          <form className="checker-form" onSubmit={handleGenerate}>
            <label>
              Job role or description
              <textarea
                value={role}
                onChange={(e) => setRole(e.target.value)}
                rows={5}
                placeholder="Enter a role like 'Data Analyst', or paste a full job description for more tailored questions."
              />
            </label>
            <div className="checker-actions">
              <button className="primary-action" disabled={!canGenerate || isLoading} type="submit">
                {isLoading ? "Generating…" : "Generate questions"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="checker-panel interview-role-bar">
          <div>
            <p className="app-kicker">Mock Interview Coach</p>
            <h2 className="interview-role-title">{role}</h2>
          </div>
          <button className="secondary-action" type="button" onClick={startOver}>
            Start over
          </button>
        </section>
      )}

      <section className="career-results" aria-live="polite">
        {isLoading ? (
          <div className="empty-state loading-state">
            <PathwayLoader />
            <h2>{loadingLabel}</h2>
            <p>This takes a few moments. Pathway AI is working on it.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>We hit a snag.</h2>
            <p>{error}</p>
          </div>
        ) : phase === "input" ? (
          <div className="empty-state">
            <h2>Your interview questions will appear here.</h2>
            <p>Enter a role above to start a practice interview.</p>
          </div>
        ) : phase === "answering" ? (
          <div className="interview-stack">
            <div className="interview-instructions">
              <h2>Answer in your own words</h2>
              <p>
                Take your time. When you are ready, submit your answers for
                coaching. You do not have to answer every question.
              </p>
            </div>
            {questions.map((q, i) => (
              <article className="interview-question" key={q.question}>
                <div className="interview-q-head">
                  <span className={`qtype qtype-${q.type.toLowerCase()}`}>{q.type}</span>
                  <h3>Question {i + 1}</h3>
                </div>
                <p className="interview-q-text">{q.question}</p>
                <textarea
                  className="interview-answer"
                  value={answers[i]}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  rows={4}
                  placeholder="Type your answer here…"
                />
              </article>
            ))}
            <div className="checker-actions">
              <button
                className="primary-action"
                type="button"
                disabled={answeredCount === 0}
                onClick={handleEvaluate}
              >
                Get feedback ({answeredCount} answered)
              </button>
            </div>
          </div>
        ) : (
          <div className="interview-stack">
            <div className="score-ring" aria-label={`Average interview score ${averageScore}%`}>
              <span>{averageScore}%</span>
              <p>Average score</p>
            </div>
            {evaluations.map((ev, i) => (
              <article className="interview-question" key={ev.question}>
                <div className="interview-q-head">
                  <h3>Question {i + 1}</h3>
                  <span className="interview-score">{ev.score}%</span>
                </div>
                <p className="interview-q-text">{ev.question}</p>

                <div className="interview-yours">
                  <h4>Your answer</h4>
                  <p>{findAnswer(ev.question) || "No answer provided."}</p>
                </div>

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
            <div className="checker-actions">
              <button className="primary-action" type="button" onClick={startOver}>
                Practice another role
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
