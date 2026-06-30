import { PathwayLoader } from "./components/PathwayLoader";

const modules = [
  {
    label: "01",
    title: "ATS Resume Checker",
    description:
      "Compare your resume with a target job description, identify missing keywords, and receive specific resume improvement suggestions.",
    href: "/resume-checker",
    available: true,
  },
  {
    label: "02",
    title: "Career Path Explorer",
    description:
      "Use your profile, skills, and interests to discover three realistic career paths, each with role progression and the skills it needs.",
    href: "/career-path",
    available: true,
  },
  {
    label: "03",
    title: "Skill Gap Roadmap",
    description:
      "Turn a target role into a clear, prioritized learning plan with practical tasks, resource types, and time estimates.",
    href: "/skill-gap",
    available: true,
  },
  {
    label: "04",
    title: "Mock Interview Coach",
    description:
      "Practice role-based interview questions and receive structured feedback that improves confidence and clarity.",
    href: "/dashboard",
    available: false,
  },
];

const journeySteps = [
  "Upload or paste your resume",
  "Compare against a job description",
  "Choose a realistic target role",
  "Build a skill roadmap",
  "Practice interview answers",
];

const studentSignals = [
  "Limited experience does not mean no value",
  "Coursework and projects can become stronger resume proof",
  "Career direction should be realistic, not randomly optimistic",
];

const trustPrinciples = [
  "Your resume and job description are never stored. They are analyzed and discarded.",
  "AI feedback explains the reasoning behind every recommendation.",
  "No account or sign-up required to use any tool.",
];

function PathwayLogo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="brand-mark" aria-label="Pathway AI">
      <svg
        className="brand-symbol"
        width="96"
        height="56"
        viewBox="0 0 96 56"
        role="img"
        aria-hidden="true"
      >
        <path
          d="M18 42 L38 28 L58 18 L78 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="18" cy="42" r="6" />
        <circle cx="38" cy="28" r="6" />
        <circle cx="58" cy="18" r="6" />
        <circle cx="78" cy="6" r="10" />
      </svg>
      {showText ? <span className="brand-name">Pathway AI</span> : null}
    </div>
  );
}

export default function Home() {
  return (
    <main className="page-shell">
      <header className="site-header" aria-label="Pathway AI main navigation">
        <a href="#top" className="logo-link" aria-label="Pathway AI homepage">
          <PathwayLogo />
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#problem">Problem</a>
          <a href="#journey">Journey</a>
          <a href="#modules">Modules</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <a href="/dashboard" className="header-action">
          Get started
        </a>
      </header>

      <section id="top" className="hero-section" aria-labelledby="hero-title">
        <div className="hero-eyebrow">
          Student career readiness, connected in one place
        </div>

        <h1 id="hero-title">
          Go from career confusion to a clear, confident plan.
        </h1>

        <p className="hero-copy">
          Pathway AI helps students improve their resume, discover realistic
          career paths, close skill gaps, and practice interviews before the
          real opportunity arrives.
        </p>

        <div className="hero-actions" aria-label="Landing page actions">
          <a href="/dashboard" className="primary-action">
            Open dashboard
          </a>
          <a href="#modules" className="secondary-action">
            Explore modules
          </a>
        </div>

        <div className="hero-note">
          Built for students with limited experience who need direction,
          preparation, and confidence.
        </div>
      </section>

      <section className="product-preview" aria-label="Pathway AI dashboard preview">
        <div className="preview-window">
          <div className="preview-window-top">
            <div className="window-controls" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="preview-url">pathway-aiapp.vercel.app/dashboard</span>
          </div>

          <div className="preview-content">
            <aside className="preview-sidebar">
              <PathwayLogo showText={false} />
              <div className="sidebar-pill active">Dashboard</div>
              <div className="sidebar-pill">Resume</div>
              <div className="sidebar-pill">Career</div>
              <div className="sidebar-pill">Roadmap</div>
              <div className="sidebar-pill">Interview</div>
            </aside>

            <div className="preview-main">
              <div className="preview-heading-row">
                <div>
                  <p className="preview-kicker">Career workspace</p>
                  <h2>Your path, organized</h2>
                  <p>
                    Resume insights, role direction, skill planning, and
                    interview practice in one place.
                  </p>
                </div>

                <div className="score-card" aria-label="Resume insights status">
                  <span>Ready</span>
                  <p>Resume insights</p>
                </div>
              </div>

              <div className="journey-track" aria-label="Career readiness journey">
                {journeySteps.map((step, index) => (
                  <div className="journey-dot" key={step}>
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>

              <div className="preview-grid">
                {modules.map((module) => (
                  <article className="preview-card" key={module.title}>
                    <span>{module.label}</span>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </article>
                ))}
              </div>

              <div className="loading-card">
                <div>
                  <span className="loading-label">Powered by Pathway AI</span>
                  <p>
                    Real-time analysis built for your situation, so your feedback is
                    always specific and actionable.
                  </p>
                </div>
                <PathwayLoader />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="content-section">
        <div className="section-label">The problem</div>
        <div className="section-split">
          <h2>Career readiness is scattered across too many tools.</h2>
          <div className="section-copy-stack">
            <p>
              Students often jump between resume checkers, job boards, skill
              tutorials, and interview prep tools. Pathway AI connects those
              steps into one guided workspace so students know what to fix, what
              to learn, and how to prepare next.
            </p>
            <div className="signal-list" aria-label="Student support principles">
              {studentSignals.map((signal) => (
                <div className="signal-item" key={signal}>
                  <span />
                  <p>{signal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="content-section">
        <div className="section-label">The student journey</div>
        <div className="journey-cards">
          {journeySteps.map((step, index) => (
            <article className="journey-card" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step}</h3>
              <p>
                {index === 0 &&
                  "Students begin with the resume they already have, whether it is polished or still in progress."}
                {index === 1 &&
                  "The resume is compared against a real role so the feedback is specific, not generic."}
                {index === 2 &&
                  "Pathway AI recommends realistic paths based on the student’s profile and current skills."}
                {index === 3 &&
                  "The selected role becomes a focused learning plan with practical next steps."}
                {index === 4 &&
                  "Students practice explaining their experience before entering a real interview."}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="modules" className="content-section">
        <div className="section-label">Core modules</div>
        <div className="section-intro">
          <h2>Four focused tools, one connected student journey.</h2>
          <p>
            Each module builds on the last. Resume feedback informs your career direction,
            which shapes your skill roadmap, which prepares you for the interview.
            No jumping between apps. No starting over.
          </p>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.title}>
              <span>{module.label}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <a className="module-status" href={module.href}>
                {module.available ? "Available now →" : "Coming soon"}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="privacy" className="content-section privacy-section">
        <div>
          <div className="section-label">Responsible AI</div>
          <h2>Helpful guidance without unnecessary data storage.</h2>
        </div>
        <div className="trust-list">
          {trustPrinciples.map((principle) => (
            <div className="trust-item" key={principle}>
              <span>OK</span>
              <p>{principle}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <PathwayLogo />
        <p>A one stop shop to your career goals.</p>
      </footer>
    </main>
  );
}
