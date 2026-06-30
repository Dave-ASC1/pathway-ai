export function PathwayLoader() {
  return (
    <svg
      className="pathway-loader"
      aria-label="Pathway AI loading animation"
      role="img"
      viewBox="0 0 64 64"
    >
      <g className="pathway-loader-mark">
        <path
          className="loader-path-line"
          d="M10 48 L26 36 L42 24 L56 10"
          fill="none"
          stroke="#2f80ff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          pathLength="1"
        />

        <circle
          className="loader-dot loader-dot-one"
          cx="10"
          cy="48"
          r="5"
          fill="#ffffff"
          stroke="#2f80ff"
          strokeWidth="3"
        />
        <circle
          className="loader-dot loader-dot-two"
          cx="26"
          cy="36"
          r="5"
          fill="#ffffff"
          stroke="#2f80ff"
          strokeWidth="3"
        />
        <circle
          className="loader-dot loader-dot-three"
          cx="42"
          cy="24"
          r="5"
          fill="#ffffff"
          stroke="#2f80ff"
          strokeWidth="3"
        />
        <circle
          className="loader-dot loader-dot-four"
          cx="56"
          cy="10"
          r="7"
          fill="#60a5fa"
          stroke="#60a5fa"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}
