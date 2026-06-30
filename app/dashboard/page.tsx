import Link from "next/link";
import { AppShell } from "../components/AppShell";

const readinessCards = [
  {
    label: "Resume",
    value: "AI-powered analysis",
    detail: "Paste your resume and a job description to get a real match score, missing keywords, and specific improvements.",
  },
  {
    label: "Career path",
    value: "Discover your direction",
    detail: "Use your resume and interests to find realistic entry-level roles worth pursuing.",
  },
  {
    label: "Skill roadmap",
    value: "Build toward your goal",
    detail: "Turn identified skill gaps into a focused, step-by-step learning plan.",
  },
];

const moduleCards = [
  {
    id: "resume",
    title: "ATS Resume Checker",
    status: "Available now",
    description:
      "Compare your resume against any job description. Get a match score, see missing keywords, and receive specific improvements powered by Pathway AI.",
    href: "/resume-checker",
  },
  {
    id: "career",
    title: "Career Path Explorer",
    status: "Available now",
    description:
      "Discover realistic career directions based on your major, skills, and interests. Get three tailored paths with role titles, progression, and what you need to get there.",
    href: "/career-path",
  },
  {
    id: "roadmap",
    title: "Skill Gap Roadmap",
    status: "Coming soon",
    description:
      "Turn the gap between where you are and where you want to be into a clear, prioritized learning plan with actionable next steps.",
    href: "/resume-checker",
  },
  {
    id: "interview",
    title: "Mock Interview Coach",
    status: "Coming soon",
    description:
      "Practice role-specific interview questions and get structured feedback on your answers — so you walk in prepared, not hoping for the best.",
    href: "/resume-checker",
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
          <p className="app-kicker">Career workspace</p>
          <h1>Everything you need to go from student to hired.</h1>
          <p>
            Run your resume through AI analysis, discover roles worth pursuing,
            build the skills that close the gap, and practice until the interview feels easy.
          </p>
        </div>
        <Link className="primary-action" href="/resume-checker">
          Check my resume
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
            <h2>Four tools, one connected journey.</h2>
          </div>
          <p>
            Each module builds on the last — resume feedback informs your career direction,
            which shapes your skill roadmap, which prepares you for interviews.
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
                {module.status === "Available now" ? "Open module" : "Coming soon"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <div>
            <p className="app-kicker">How it works</p>
            <h2>Five steps from where you are to where you want to be.</h2>
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
