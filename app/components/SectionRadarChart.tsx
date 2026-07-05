type SectionScore = { label: string; score: number };

function bandColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_RADIUS = 72;
const GRID_RINGS = [0.33, 0.66, 1];

function axisAngle(index: number, count: number): number {
  return -90 + (360 / count) * index;
}

function axisPoint(index: number, count: number, radiusFraction: number) {
  const angleRad = (axisAngle(index, count) * Math.PI) / 180;
  return {
    x: CX + Math.cos(angleRad) * MAX_RADIUS * radiusFraction,
    y: CY + Math.sin(angleRad) * MAX_RADIUS * radiusFraction,
  };
}

function polygonPath(count: number, radiusFraction: number | ((index: number) => number)) {
  const points = Array.from({ length: count }, (_, i) => {
    const fraction = typeof radiusFraction === "function" ? radiusFraction(i) : radiusFraction;
    const p = axisPoint(i, count, fraction);
    return `${p.x},${p.y}`;
  });
  return `M ${points.join(" L ")} Z`;
}

// A 5-axis radar chart, the honest chart type for several independent 0-100
// scores (unlike a pie/donut, which implies parts of one whole). Axis labels
// live on the chart itself so it reads without a separate legend.
export function SectionRadarChart({ sections }: { sections: SectionScore[] }) {
  const count = sections.length;

  return (
    <div className="section-radar">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="section-radar-svg">
        {GRID_RINGS.map((ring) => (
          <path key={ring} d={polygonPath(count, ring)} className="section-radar-grid" />
        ))}
        {sections.map((_, i) => {
          const outer = axisPoint(i, count, 1);
          return <line key={i} x1={CX} y1={CY} x2={outer.x} y2={outer.y} className="section-radar-axis" />;
        })}
        <path
          d={polygonPath(count, (i) => Math.max(0, Math.min(100, sections[i].score)) / 100)}
          className="section-radar-shape"
        />
        {sections.map((section, i) => {
          const p = axisPoint(i, count, Math.max(0, Math.min(100, section.score)) / 100);
          return <circle key={section.label} cx={p.x} cy={p.y} r={5} fill={bandColor(section.score)} stroke="#fff" strokeWidth={1.5} />;
        })}
        {sections.map((section, i) => {
          const angle = axisAngle(i, count);
          const rad = (angle * Math.PI) / 180;
          const labelPoint = axisPoint(i, count, 1.32);
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
          const dy = sin < -0.5 ? -6 : sin > 0.5 ? 14 : 4;
          return (
            <text
              key={section.label}
              x={labelPoint.x}
              y={labelPoint.y + dy}
              textAnchor={anchor}
              className="section-radar-label"
            >
              <tspan className="section-radar-label-name">{section.label}</tspan>
              <tspan className="section-radar-label-score" fill={bandColor(section.score)} dx="4">
                {section.score}%
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
