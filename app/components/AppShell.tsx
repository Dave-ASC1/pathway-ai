import Link from "next/link";
import { PathwayLogo } from "./PathwayLogo";

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resume-checker", label: "Resume checker" },
  { href: "/dashboard#roadmap", label: "Roadmap" },
  { href: "/dashboard#interview", label: "Interview" },
];

type AppShellProps = {
  active: "dashboard" | "resume";
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
              className={
                (active === "dashboard" && link.label === "Dashboard") ||
                (active === "resume" && link.label === "Resume checker")
                  ? "app-nav-link active"
                  : "app-nav-link"
              }
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
