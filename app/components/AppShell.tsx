import Link from "next/link";
import { PathwayLogo } from "./PathwayLogo";

type ActiveModule = "dashboard" | "resume" | "career" | "roadmap" | "interview";

const appLinks: { href: string; label: string; key: ActiveModule }[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/resume-checker", label: "Resume checker", key: "resume" },
  { href: "/career-path", label: "Career paths", key: "career" },
  { href: "/skill-gap", label: "Roadmap", key: "roadmap" },
  { href: "/dashboard#interview", label: "Interview", key: "interview" },
];

type AppShellProps = {
  active: ActiveModule;
  children: React.ReactNode;
};

export function AppShell({ active, children }: AppShellProps) {
  return (
    <main className="app-shell">
      <aside className="app-sidebar" aria-label="Pathway AI workspace">
        <PathwayLogo href="/dashboard" />
        <nav className="app-nav" aria-label="Workspace navigation">
          {appLinks.map((link) => (
            <Link
              className={active === link.key ? "app-nav-link active" : "app-nav-link"}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-support">
          <span>Free to use</span>
          <p>No account required. All tools are available at no cost.</p>
        </div>
      </aside>
      <section className="app-main">{children}</section>
    </main>
  );
}
