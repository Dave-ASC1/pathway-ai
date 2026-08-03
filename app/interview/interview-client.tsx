"use client";

import { useState } from "react";
import { JourneyBoard } from "../components/JourneyBoard";
import { PathwayLoader } from "../components/PathwayLoader";
import { saveItem } from "@/lib/history";
import { getExample, matchAnswersToQuestions, pickExample } from "@/lib/examples";
import { useSessionState } from "@/lib/session";

const EMPTY_QUESTIONS: Question[] = [];
const EMPTY_ANSWERS: string[] = [];
const EMPTY_EVALS: Evaluation[] = [];

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

export function InterviewClient() {
  const [role, setRole] = useSessionState("interview:role", "");
  const [questions, setQuestions] = useSessionState<Question[]>("interview:questions", EMPTY_QUESTIONS);
  const [answers, setAnswers] = useSessionState<string[]>("interview:answers", EMPTY_ANSWERS);
  const [evaluations, setEvaluations] = useSessionState<Evaluation[]>("interview:evaluations", EMPTY_EVALS);
  const [phase, setPhase] = useSessionState<Phase>("interview:phase", "input");
  // Session-scoped so the sample answer helper survives a page reload mid practice.
  const [exampleId, setExampleId] = useSessionState("interview:exampleId", "");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canGenerate = role.trim().length > 2;
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const averageScore = evaluations.length
    ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
    : 0;

  async function generateQuestions(roleText: string) {
    setIsLoading(true);
    setLoadingLabel("Generating your interview questions…");
    setError(null);
    try {
      const res = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleText }),
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

  function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    setExampleId("");
    void generateQuestions(role);
  }

  // Fills the role and jumps straight to the questions, so a reviewer can reach
  // the coaching output in one click instead of inventing a job posting first.
  function loadExample() {
    const next = pickExample(exampleId || undefined);
    setRole(next.interview.role);
    setExampleId(next.id);
    void generateQuestions(next.interview.role);
  }

  // Assigns the loaded person's stories to whatever questions came back, so the
  // evaluation step is reachable without typing out eight answers by hand.
  function fillSampleAnswers() {
    const source = getExample(exampleId);
    if (!source) return;
    setAnswers(
      matchAnswersToQuestions(
        questions.map((q) => q.question),
        source.interview.sampleAnswers,
      ),
    );
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
    setSaved(false);
    setExampleId("");
  }

  function handleSave() {
    saveItem("interview", `Interview: ${role}`, { role, averageScore, evaluations });
    setSaved(true);
  }

  function updateAnswer(index: number, value: string) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
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
            <p>Enter a role. Answer real questions. Get scored, honest feedback.</p>
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
              <button
                className="secondary-action"
                type="button"
                disabled={isLoading}
                onClick={loadExample}
              >
                Try an example
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
              {exampleId ? (
                <button className="secondary-action" type="button" onClick={fillSampleAnswers}>
                  Fill sample answers
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="interview-stack">
            <div className="score-ring" aria-label={`Average interview score ${averageScore}%`}>
              <span>{averageScore}%</span>
              <p>Average score</p>
            </div>
            <div className="save-toolbar">
              <button className="save-button" type="button" onClick={handleSave} disabled={saved}>
                {saved ? "Saved ✓" : "Save result"}
              </button>
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

            <section className="result-block">
              <JourneyBoard context="embed" currentStop="interview" />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
