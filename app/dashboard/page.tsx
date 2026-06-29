import Link from "next/link";
import { AppShell } from "../components/AppShell";

const readinessCards = [
  {
    label: "Resume",
    value: "Ready to analyze",
    detail: "Paste a resume and job description to receive a local ATS-style review.",
  },
  {
    label: "Career path",
    value: "Guided next",
    detail: "Use resume feedback to choose realistic student-friendly roles.",
  },
  {
    label: "Skill roadmap",
    value: "Planned",
    detail: "Convert gaps into a learning path with practical milestones.",
  },
];

const moduleCards = [
  {
    id: "resume",
    title: "ATS Resume Checker",
    status: "Working MVP",
    description:
      "Compare resume content against a target job description and return match score, missing keywords, strengths, and next-step improvements.",
    href: "/resume-checker",
  },
  {
    id: "career",
    title: "Career Path Explorer",
    status: "Prototype",
    description:
      "Suggest realistic entry-level career directions based on resume signals, interests, and selected target roles.",
    href: "/dashboard#career",
  },
  {
    id: "roadmap",
    title: "Skill Gap Roadmap",
    status: "Prototype",
    description:
      "Turn resume gaps into a sequence of skills, projects, and practice tasks students can complete over time.",
    href: "/dashboard#roadmap",
  },
  {
    id: "interview",
    title: "Mock Interview Coach",
    status: "Prototype",
    description:
      "Generate practice prompts and answer feedback tied to the role and resume improvements.",
    href: "/dashboard#interview",
  },
];

const timeline = [
  "Analyze resume match",
  "Identify missing role keywords",
  "Choose a realistic target path",
  "Build a skill roadmap",
  "Practice interview responses",
];

export default function DashboardPage() {
  return (
    <AppShell active="dashboard">
      <section className="app-hero">
        <div>
          <p className="app-kicker">Pathway AI dashboard</p>
          <h1>Your career readiness workspace.</h1>
          <p>
            This MVP connects the student journey from resume feedback to
            career direction, roadmap planning, and interview preparation.
          </p>
        </div>
        <Link className="primary-action" href="/resume-checker">
          Start resume check
        </Link>
      </section>

      <section className="metric-grid" aria-label="Readiness summary">
        {readinessCards.map((card) => (
          <article className="metric-card" key={card.label}>
            <span>{card.label}</span>
            <h2>{card.value}</h2>
            <p>{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="app-kicker">Core modules</p>
            <h2>One connected product flow</h2>
          </div>
          <p>
            The resume checker is the completed MVP slice. The remaining modules
            are represented as planned product surfaces for the next build phase.
          </p>
        </div>

        <div className="workspace-grid">
          {moduleCards.map((module) => (
            <article className="workspace-card" id={module.id} key={module.title}>
              <div className="card-topline">
                <span>{module.status}</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <Link className="text-action" href={module.href}>
                {module.status === "Working MVP" ? "Open module" : "View plan"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="app-kicker">Operational flow</p>
            <h2>How a student moves through Pathway AI</h2>
          </div>
        </div>
        <div className="flow-steps">
          {timeline.map((step, index) => (
            <div className="flow-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
