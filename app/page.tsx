import Link from "next/link";
import { JourneyBoard } from "./components/JourneyBoard";

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
    <main className="board-page">
      <header className="board-header">
        <Link href="/" className="logo-link" aria-label="Pathway AI homepage">
          <PathwayLogo />
        </Link>
      </header>

      <JourneyBoard context="landing" />

      <footer className="board-footer">
        <PathwayLogo showText={false} />
        <p>Free career readiness for students. No account needed.</p>
      </footer>
    </main>
  );
}
