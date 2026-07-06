"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSessionState } from "@/lib/session";

type StopId = "resume" | "career" | "roadmap" | "interview";

type Stop = {
  id: StopId;
  label: string;
  href: string;
  tint: string;
  stroke: string;
  text: string;
  solid: string;
};

const STOPS: Stop[] = [
  { id: "resume", label: "Resume", href: "/resume-checker", tint: "#eff6ff", stroke: "#3b82f6", text: "#2563eb", solid: "#3b82f6" },
  { id: "career", label: "Career", href: "/career-path", tint: "#dcfce7", stroke: "#16a34a", text: "#166534", solid: "#16a34a" },
  { id: "roadmap", label: "Roadmap", href: "/skill-gap", tint: "#fef9c3", stroke: "#d97706", text: "#a16207", solid: "#d97706" },
  { id: "interview", label: "Interview", href: "/interview", tint: "#f3e8ff", stroke: "#7c3aed", text: "#7c3aed", solid: "#7c3aed" },
];

type Layout = {
  viewBox: string;
  path: string;
  start: { x: number; y: number };
  goal: { x: number; y: number };
  nodes: Record<StopId, [number, number]>;
  r: number;
  goalR: number;
};

const WIDE: Layout = {
  viewBox: "0 0 680 460",
  path: "M170,400 C 340,398 555,405 555,360 S 125,320 125,265 S 555,225 555,175 S 235,142 235,92 S 595,95 595,55",
  start: { x: 104, y: 402 },
  goal: { x: 595, y: 55 },
  nodes: { resume: [555, 360], career: [125, 265], roadmap: [555, 175], interview: [235, 92] },
  r: 27,
  goalR: 22,
};

const TALL: Layout = {
  viewBox: "0 0 360 610",
  path: "M110,535 C 110,505 270,510 270,470 S 90,415 90,370 S 270,310 270,265 S 90,205 90,160 S 200,100 200,60",
  start: { x: 110, y: 566 },
  goal: { x: 200, y: 60 },
  nodes: { resume: [270, 470], career: [90, 370], roadmap: [270, 265], interview: [90, 160] },
  r: 27,
  goalR: 22,
};

const CAR_TRAVEL_MS = 18000;
const CAR_PAUSE_MS = 1100;
const CAR_GOAL_HOLD_MS = 950;
const AUTO_PLAY_DELAY_MS = 700;

const SPARK_COLORS = ["#ffd464", "#fde047", "#facc15", "#fff1a8"];

const SPARKS: { dx: number; dy: number; r: number; color: string }[] = [
  { count: 12, dist: 52, r: 3.3 },
  { count: 8, dist: 31, r: 2.6 },
].flatMap((tier, ti) =>
  Array.from({ length: tier.count }, (_, i) => {
    const ang = ((Math.PI * 2) / tier.count) * i + (ti * Math.PI) / tier.count;
    return {
      dx: Number((Math.cos(ang) * tier.dist).toFixed(1)),
      dy: Number((Math.sin(ang) * tier.dist).toFixed(1)),
      r: tier.r,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
    };
  }),
);

type BoardProps = {
  layout: Layout;
  doneMap: Record<StopId, boolean>;
  nextId: StopId | null;
  startHref: string;
  interactive?: boolean;
  startStopId?: StopId | null;
};

function Board({ layout, doneMap, nextId, startHref, interactive = false, startStopId = null }: BoardProps) {
  const { r } = layout;
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const autoPlayedRef = useRef(false);
  const stopLenRef = useRef<{ id: StopId; len: number }[]>([]);
  const [touring, setTouring] = useState(false);
  const [activeStop, setActiveStop] = useState<StopId | null>(null);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!interactive) return;
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const samples = 420;
    const pts: { len: number; x: number; y: number }[] = [];
    for (let i = 0; i <= samples; i += 1) {
      const len = (total * i) / samples;
      const p = path.getPointAtLength(len);
      pts.push({ len, x: p.x, y: p.y });
    }
    stopLenRef.current = STOPS.map((stop) => {
      const [cx, cy] = layout.nodes[stop.id];
      let best = pts[0];
      let bestDist = Infinity;
      for (const pt of pts) {
        const d = (pt.x - cx) ** 2 + (pt.y - cy) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = pt;
        }
      }
      return { id: stop.id, len: best.len };
    }).sort((a, b) => a.len - b.len);
  }, [interactive, layout]);

  const placeCar = (path: SVGPathElement, len: number, total: number) => {
    const p = path.getPointAtLength(Math.max(0, Math.min(len, total)));
    const ahead = path.getPointAtLength(Math.min(len + 4, total));
    const behind = path.getPointAtLength(Math.max(len - 4, 0));
    const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
    const car = carRef.current;
    if (car) car.setAttribute("transform", `translate(${p.x},${p.y}) rotate(${angle})`);
  };

  const startTour = () => {
    if (!interactive) return;
    const path = pathRef.current;
    if (!path) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const total = path.getTotalLength();
    const startLen = startStopId ? (stopLenRef.current.find((s) => s.id === startStopId)?.len ?? 0) : 0;
    const stops = stopLenRef.current.filter((s) => s.len > startLen);
    const speed = total / CAR_TRAVEL_MS;

    let head = startLen;
    let stopIdx = 0;
    let pausedUntil = 0;
    let last = performance.now();

    placeCar(path, startLen, total);
    setTouring(true);

    const step = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;

      if (now >= pausedUntil) {
        head += speed * dt;
        if (stopIdx < stops.length && head >= stops[stopIdx].len) {
          head = stops[stopIdx].len;
          pausedUntil = now + CAR_PAUSE_MS;
          setActiveStop(stops[stopIdx].id);
          stopIdx += 1;
        }
      }

      placeCar(path, head, total);

      if (head < total) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        setActiveStop(null);
        setBurst((n) => n + 1);
        holdTimerRef.current = window.setTimeout(() => {
          setTouring(false);
          holdTimerRef.current = null;
        }, CAR_GOAL_HOLD_MS);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const endTour = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setTouring(false);
    setActiveStop(null);
  };

  const startTourRef = useRef<() => void>(() => {});
  useEffect(() => {
    startTourRef.current = startTour;
  });

  useEffect(() => {
    if (!interactive) return;
    if (autoPlayedRef.current) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 561px)").matches) return;
    autoPlayedRef.current = true;
    autoTimerRef.current = window.setTimeout(() => {
      startTourRef.current();
    }, AUTO_PLAY_DELAY_MS);
    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [interactive]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  return (
    <svg
      className="journey-svg"
      viewBox={layout.viewBox}
      role="img"
      aria-label="Your career readiness path with four stops: resume, career, roadmap, and interview."
    >
      <path ref={pathRef} className="jb-road-base" d={layout.path} />
      <path className="jb-road-dash" d={layout.path} />

      {interactive ? (
        <g
          ref={carRef}
          className={`jb-car${touring ? " on" : ""}`}
          aria-hidden="true"
          transform={`translate(${startStopId ? layout.nodes[startStopId][0] : layout.start.x},${startStopId ? layout.nodes[startStopId][1] : layout.start.y})`}
        >
          <rect x="-9" y="-12" width="9" height="5" rx="2" fill="#0b1220" />
          <rect x="4.5" y="-12" width="9" height="5" rx="2" fill="#0b1220" />
          <rect x="-9" y="7" width="9" height="5" rx="2" fill="#0b1220" />
          <rect x="4.5" y="7" width="9" height="5" rx="2" fill="#0b1220" />
          <rect x="-16" y="-9" width="32" height="18" rx="6" fill="#000080" />
          <rect x="-3" y="-6" width="12" height="12" rx="3" fill="#60a5fa" />
          <circle cx="15" cy="-4.5" r="1.7" fill="#ffd464" />
          <circle cx="15" cy="4.5" r="1.7" fill="#ffd464" />
        </g>
      ) : null}

      {startStopId ? null : (
        <a
          href={startHref}
          className={`jb-start${touring ? " touring" : ""}`}
          aria-label="Start your journey"
          onMouseEnter={startTour}
          onMouseLeave={endTour}
          onFocus={startTour}
          onBlur={endTour}
        >
          <rect className="jb-start-pill" x={layout.start.x - 78} y={layout.start.y - 24} width="156" height="48" rx="24" />
          <text className="jb-start-text" x={layout.start.x} y={layout.start.y + 6} textAnchor="middle" fontSize="16.5">
            {"Start here →"}
          </text>
        </a>
      )}

      {interactive && !startStopId ? (
        <text
          className={`jb-hint${touring ? " on" : ""}`}
          x={layout.start.x}
          y={layout.start.y - 40}
          textAnchor="middle"
          fontSize="13"
        >
          Click to begin
        </text>
      ) : null}

      {STOPS.map((stop, index) => {
        const [cx, cy] = layout.nodes[stop.id];
        const done = doneMap[stop.id];
        const isNext = stop.id === nextId && !done;
        const urge = activeStop === stop.id;
        return (
          <a
            key={stop.id}
            href={stop.href}
            className={`jb-stop${urge ? " urge" : ""}`}
            aria-label={`${stop.label} tool${done ? ", done" : ""}`}
          >
            {isNext ? <circle className="jb-pulse" cx={cx} cy={cy} r={r + 5} fill="none" stroke={stop.stroke} strokeWidth="2" /> : null}
            <g className="jb-node">
              <circle
                className="jb-face"
                cx={cx}
                cy={cy}
                r={r}
                fill={done ? stop.solid : stop.tint}
                stroke={stop.stroke}
                strokeWidth={done ? 2 : 2.5}
              />
              {done ? (
                <path className="jb-check" d={`M${cx - 11},${cy} l7,7 l13,-14`} />
              ) : (
                <text x={cx} y={cy + 6} textAnchor="middle" fontSize="17" fontWeight={800} fill={stop.text}>
                  {index + 1}
                </text>
              )}
            </g>
            <text className="jb-label" x={cx} y={cy + r + 20} textAnchor="middle" fontSize="14">
              {stop.label}
            </text>
          </a>
        );
      })}

      <g className="jb-goal" aria-hidden="true">
        <g key={`mark-${burst}`} className={`jb-goal-mark${burst > 0 ? " pop" : ""}`}>
          <circle className="jb-goal-face" cx={layout.goal.x} cy={layout.goal.y} r={layout.goalR} />
          <text className="jb-goal-star" x={layout.goal.x} y={layout.goal.y + 7} textAnchor="middle" fontSize="20">
            {"★"}
          </text>
        </g>
        <text className="jb-label" x={layout.goal.x} y={layout.goal.y + layout.goalR + 22} textAnchor="middle" fontSize="12">
          Career-ready
        </text>
      </g>

      {interactive && burst > 0 ? (
        <g key={`fw-${burst}`} className="jb-fireworks" transform={`translate(${layout.goal.x},${layout.goal.y})`} aria-hidden="true">
          <circle className="jb-flash" r="12" fill="#fff1a8" />
          {SPARKS.map((spark, i) => (
            <circle
              key={i}
              className="jb-spark"
              r={spark.r}
              fill={spark.color}
              style={{ "--dx": `${spark.dx}px`, "--dy": `${spark.dy}px` } as CSSProperties}
            />
          ))}
        </g>
      ) : null}
    </svg>
  );
}

type Context = "landing" | "workspace" | "embed";

export function JourneyBoard({
  context = "landing",
  currentStop,
}: {
  context?: Context;
  /** For context="embed": the stop just completed. The car continues its
   * tour from here instead of replaying the whole path from the start. */
  currentStop?: StopId;
}) {
  const [resumeDone] = useSessionState("resume:hasAnalyzed", false);
  const [careerResult] = useSessionState<unknown>("career:result", null);
  const [roadmapResult] = useSessionState<unknown>("roadmap:result", null);
  const [interviewPhase] = useSessionState("interview:phase", "input");

  const doneMap: Record<StopId, boolean> = {
    resume: resumeDone === true,
    career: Array.isArray(careerResult) && careerResult.length > 0,
    roadmap: !!roadmapResult,
    interview: interviewPhase === "results",
  };

  const completedCount = Object.values(doneMap).filter(Boolean).length;
  const nextStop = STOPS.find((stop) => !doneMap[stop.id]) ?? null;
  const allDone = nextStop === null;
  const startHref = allDone ? "/saved" : nextStop.href;
  const nextId = nextStop ? nextStop.id : null;

  const kicker = context === "landing" ? "Free · no sign up" : "Your journey";
  const heading =
    context === "landing"
      ? "From confused to career-ready in 4 steps."
      : allDone
        ? "All 4 steps done."
        : `${completedCount} of 4 steps done.`;
  const HeadingTag = context === "embed" ? "h2" : "h1";

  return (
    <div className={`journey-board${context === "embed" ? " journey-board-embed" : ""}`}>
      <div className="journey-board-heading">
        <p className="journey-board-kicker">{kicker}</p>
        <HeadingTag>{heading}</HeadingTag>
        {context === "landing" ? (
          <p className="journey-board-sub">
            Resume checks, career paths, skill roadmaps, and interview practice, all in one free tool.
          </p>
        ) : null}
      </div>

      <div className="journey-canvas journey-canvas-wide">
        <Board
          layout={WIDE}
          doneMap={doneMap}
          nextId={nextId}
          startHref={startHref}
          interactive
          startStopId={context === "embed" ? (currentStop ?? null) : null}
        />
      </div>
      <div className="journey-canvas journey-canvas-tall">
        <Board layout={TALL} doneMap={doneMap} nextId={nextId} startHref={startHref} />
      </div>

      <p className="journey-board-hint">Tap any stop to jump in. Your progress saves as you go.</p>
    </div>
  );
}
