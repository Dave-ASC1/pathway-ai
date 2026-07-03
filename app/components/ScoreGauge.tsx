function gaugeColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

export function ScoreGauge({ score, label = "Match score" }: { score: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = gaugeColor(clamped);

  return (
    <div className="score-gauge">
      <svg viewBox="0 0 120 120" className="score-gauge-svg" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} className="score-gauge-track" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          className="score-gauge-fill"
        />
      </svg>
      <div className="score-gauge-center">
        <span style={{ color }}>{clamped}%</span>
        <p>{label}</p>
      </div>
    </div>
  );
}
