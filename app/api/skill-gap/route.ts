import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FIELD_LENGTH = 10000;

type RoadmapStep = {
  skill: string;
  why: string;
  resource: string;
  time: string;
  priority: "High" | "Medium" | "Low";
};

type Roadmap = {
  summary: string;
  haveSkills: string[];
  steps: RoadmapStep[];
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

function normalizePriority(value: unknown): "High" | "Medium" | "Low" {
  const v = String(value).toLowerCase();
  if (v.startsWith("high")) return "High";
  if (v.startsWith("low")) return "Low";
  return "Medium";
}

async function generateRoadmap(input: {
  currentSkills: string;
  targetRole: string;
}): Promise<Roadmap> {
  const client = new Anthropic();

  const prompt = `You are an experienced career and learning coach for college students. Build a focused skill-gap roadmap that takes the student from their current skills to a target role.

Return ONLY valid JSON (no markdown fences, no explanation) with this exact shape:
{
  "summary": "<2-3 sentence honest assessment of the gap between the student's current skills and the target role>",
  "haveSkills": ["<relevant skill the student already has>", "..."],
  "steps": [
    {
      "skill": "<specific skill or competency to build>",
      "why": "<one sentence on why this matters for the target role>",
      "resource": "<concrete resource type, e.g. 'Online course (Coursera/Udemy)', 'Hands-on project', 'Certification', 'Book'>",
      "time": "<realistic estimate, e.g. '2-3 weeks', '1 month'>",
      "priority": "High" | "Medium" | "Low"
    }
  ]
}

Rules:
- haveSkills: list the student's existing skills that are genuinely relevant to the target role. If none are clearly relevant, return an empty array.
- steps: 5 to 6 steps, ordered from highest priority to lowest. Each must be specific and actionable.
- Prioritize the skills that matter most for the target role and that the student is missing.
- Be honest and realistic for a student, not aspirational.
- Writing style: do not use em dashes or en dashes. Use commas, periods, or parentheses instead. Keep the tone natural and human.

STUDENT'S CURRENT SKILLS:
${input.currentSkills}

TARGET ROLE:
${input.targetRole}`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(extractJson(raw));

  const steps: RoadmapStep[] = Array.isArray(parsed.steps)
    ? parsed.steps.map((s: Record<string, unknown>) => ({
        skill: String(s.skill ?? ""),
        why: String(s.why ?? ""),
        resource: String(s.resource ?? ""),
        time: String(s.time ?? ""),
        priority: normalizePriority(s.priority),
      }))
    : [];

  return {
    summary: String(parsed.summary ?? ""),
    haveSkills: Array.isArray(parsed.haveSkills) ? parsed.haveSkills.map(String) : [],
    steps,
  };
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, { name: "skill-gap", limit: 8, windowMs: 60000 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const currentSkills: string = typeof body?.currentSkills === "string" ? body.currentSkills : "";
  const targetRole: string = typeof body?.targetRole === "string" ? body.targetRole : "";

  if (!currentSkills.trim() || !targetRole.trim()) {
    return NextResponse.json(
      { error: "Your current skills and a target role are required." },
      { status: 400 },
    );
  }

  if (currentSkills.length > MAX_FIELD_LENGTH || targetRole.length > MAX_FIELD_LENGTH) {
    return NextResponse.json(
      { error: "Input is too long. Please shorten your text." },
      { status: 413 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI service is not configured. Please try again later." },
      { status: 503 },
    );
  }

  try {
    const roadmap = await generateRoadmap({ currentSkills, targetRole });
    if (roadmap.steps.length === 0) {
      return NextResponse.json(
        { error: "Could not generate a roadmap. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json(roadmap);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong building your roadmap. Please try again." },
      { status: 502 },
    );
  }
}
