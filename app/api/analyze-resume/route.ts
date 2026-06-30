import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

type Section = { label: string; present: boolean };

type Analysis = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  sections: Section[];
};

// ── Local fallback (identical logic to resume-checker-client.tsx) ──────────

const stopWords = new Set([
  "about", "after", "also", "and", "are", "but", "can", "for", "from",
  "has", "have", "into", "our", "that", "the", "this", "with", "will",
  "you", "your",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !stopWords.has(w));
}

function extractKeywords(jobDescription: string) {
  const counts = new Map<string, number>();
  tokenize(jobDescription).forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 18)
    .map(([w]) => w);
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

function localAnalyze(resume: string, jobDescription: string): Analysis {
  const keywords = extractKeywords(jobDescription);
  const resumeWords = new Set(tokenize(resume));
  const matchedKeywords = keywords.filter((k) => resumeWords.has(k));
  const missingKeywords = keywords.filter((k) => !resumeWords.has(k));
  const matchRatio = keywords.length ? matchedKeywords.length / keywords.length : 0;

  const sections: Section[] = [
    { label: "Education", present: includesAny(resume, ["education", "university", "college"]) },
    { label: "Projects", present: includesAny(resume, ["project", "portfolio", "built", "designed"]) },
    { label: "Skills", present: includesAny(resume, ["skills", "tools", "technologies"]) },
    { label: "Experience", present: includesAny(resume, ["experience", "intern", "work", "volunteer"]) },
    { label: "Impact", present: includesAny(resume, ["improved", "increased", "reduced", "%", "users"]) },
  ];

  const sectionScore = sections.filter((s) => s.present).length / sections.length;
  const score = Math.round(matchRatio * 72 + sectionScore * 28);

  const strengths = [
    matchedKeywords.length > 0
      ? `The resume already matches ${matchedKeywords.length} important role keyword${matchedKeywords.length === 1 ? "" : "s"}.`
      : "The resume has a foundation, but it needs more language from the target role.",
    sections.find((s) => s.label === "Projects")?.present
      ? "Project work is visible, which helps students with limited formal experience show proof of ability."
      : "Adding project work would make the resume stronger for student-level roles.",
    sections.find((s) => s.label === "Skills")?.present
      ? "The skills section helps recruiters quickly understand the student's toolset."
      : "A dedicated skills section would make the resume easier to scan.",
  ];

  const improvements = [
    missingKeywords.length > 0
      ? `Add truthful examples using missing keywords such as ${missingKeywords.slice(0, 5).join(", ")}.`
      : "Keyword coverage is strong. Focus next on clearer outcomes and stronger bullets.",
    sections.find((s) => s.label === "Impact")?.present
      ? "Keep impact language visible and connect each result to a project or work activity."
      : "Add measurable outcomes where possible, such as users supported, reports built, time saved, or errors reduced.",
    sections.find((s) => s.label === "Experience")?.present
      ? "Make sure experience bullets begin with action verbs and connect directly to the job description."
      : "If formal work experience is limited, add class projects, volunteer work, or campus leadership as experience.",
  ];

  return { score, matchedKeywords, missingKeywords, strengths, improvements, sections };
}

// ── Claude analysis ────────────────────────────────────────────────────────

async function claudeAnalyze(resume: string, jobDescription: string): Promise<Analysis> {
  const client = new Anthropic();

  const prompt = `You are an expert ATS resume reviewer. Analyze the resume against the job description below.

Return ONLY valid JSON — no markdown fences, no explanation, just the raw JSON object with this exact shape:
{
  "score": <integer 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "sections": {
    "Education": <true|false>,
    "Experience": <true|false>,
    "Projects": <true|false>,
    "Skills": <true|false>,
    "Impact": <true|false>
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}

Rules:
- matchedKeywords: up to 10 keywords from the job description that appear in the resume
- missingKeywords: up to 10 important keywords from the job description absent from the resume
- sections: true if that section type is clearly present in the resume
- strengths: exactly 3 specific, student-focused observations about what the resume does well
- improvements: exactly 3 specific, actionable recommendations to better match the target role
- score: overall ATS match quality considering keyword overlap, section completeness, and relevance
- Writing style: in strengths and improvements, do not use em dashes or en dashes. Use commas, periods, or parentheses instead. Keep the tone natural and human.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(raw);

  // Normalise sections from object → array shape the UI expects
  const sections: Section[] = [
    { label: "Education", present: Boolean(parsed.sections?.Education) },
    { label: "Experience", present: Boolean(parsed.sections?.Experience) },
    { label: "Projects", present: Boolean(parsed.sections?.Projects) },
    { label: "Skills", present: Boolean(parsed.sections?.Skills) },
    { label: "Impact", present: Boolean(parsed.sections?.Impact) },
  ];

  return {
    score: Number(parsed.score) || 0,
    matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    sections,
  };
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const resume: string = body?.resume ?? "";
  const jobDescription: string = body?.jobDescription ?? "";

  if (!resume.trim() || !jobDescription.trim()) {
    return NextResponse.json({ error: "resume and jobDescription are required" }, { status: 400 });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const result = await claudeAnalyze(resume, jobDescription);
      return NextResponse.json({ ...result, source: "claude" });
    } catch {
      // Fall through to local fallback
    }
  }

  const result = localAnalyze(resume, jobDescription);
  return NextResponse.json({ ...result, source: "local" });
}
