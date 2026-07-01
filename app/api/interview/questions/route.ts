import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FIELD_LENGTH = 20000;

type Question = {
  question: string;
  type: "Behavioral" | "Technical";
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

function normalizeType(value: unknown): "Behavioral" | "Technical" {
  return String(value).toLowerCase().startsWith("tech") ? "Technical" : "Behavioral";
}

async function generateQuestions(role: string): Promise<Question[]> {
  const client = new Anthropic();

  const prompt = `You are an experienced hiring manager preparing interview questions for a candidate. Based on the role or job description below, write a realistic set of interview questions.

Return ONLY valid JSON (no markdown fences, no explanation) with this exact shape:
{
  "questions": [
    { "question": "<the interview question>", "type": "Behavioral" | "Technical" }
  ]
}

Rules:
- Write 6 questions total.
- Use a mix of behavioral and technical questions appropriate to the role.
- Behavioral questions should explore real situations, teamwork, and problem solving.
- Technical questions should fit the role and be answerable by a student or entry-level candidate.
- Make questions specific to the role, not generic filler.
- Writing style: do not use em dashes or en dashes. Use commas, periods, or parentheses instead.

ROLE OR JOB DESCRIPTION:
${role}`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1536,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(extractJson(raw));

  return Array.isArray(parsed.questions)
    ? parsed.questions.map((q: Record<string, unknown>) => ({
        question: String(q.question ?? ""),
        type: normalizeType(q.type),
      }))
    : [];
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, { name: "interview-questions", limit: 8, windowMs: 60000 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const role: string = body?.role ?? "";

  if (!role.trim()) {
    return NextResponse.json(
      { error: "A job role or description is required." },
      { status: 400 },
    );
  }

  if (role.length > MAX_FIELD_LENGTH) {
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
    const questions = await generateQuestions(role);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Could not generate questions. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong generating questions. Please try again." },
      { status: 502 },
    );
  }
}
