import Link from "next/link";

type PathwayLogoProps = {
  showText?: boolean;
  href?: string;
};

export function PathwayMark() {
  return (
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
        strokeLinecap="round"
        strokeWidth="4"
      />
      <circle cx="18" cy="42" r="6" />
      <circle cx="38" cy="28" r="6" />
      <circle cx="58" cy="18" r="6" />
      <circle cx="78" cy="6" r="10" />
    </svg>
  );
}

export function PathwayLogo({ showText = true, href = "/" }: PathwayLogoProps) {
  return (
    <Link href={href} className="logo-link" aria-label="Pathway AI homepage">
      <span className="brand-mark" aria-label="Pathway AI">
        <PathwayMark />
        {showText ? <span className="brand-name">Pathway AI</span> : null}
      </span>
    </Link>
  );
}
