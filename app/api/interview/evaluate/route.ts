import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

type AnswerInput = { question: string; answer: string };

type Evaluation = {
  question: string;
  score: number;
  strengths: string;
  missing: string;
  modelAnswer: string;
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

async function evaluateAnswers(role: string, answers: AnswerInput[]): Promise<Evaluation[]> {
  const client = new Anthropic();

  const qa = answers
    .map((a, i) => `Question ${i + 1}: ${a.question}\nCandidate answer ${i + 1}: ${a.answer}`)
    .join("\n\n");

  const prompt = `You are an experienced interview coach reviewing a candidate's practice answers for the role below. Evaluate each answer honestly and constructively, as if coaching a student who wants to improve.

Return ONLY valid JSON (no markdown fences, no explanation) with this exact shape:
{
  "evaluations": [
    {
      "score": <integer 0-100>,
      "strengths": "<1-2 sentences on what the answer did well>",
      "missing": "<1-2 sentences on what was missing or could be stronger>",
      "modelAnswer": "<a strong example answer the candidate can learn from, 3-5 sentences>"
    }
  ]
}

Rules:
- Return exactly one evaluation per question, in the same order as the questions below.
- score: reflect answer quality, relevance, structure, and specificity. Be fair but honest.
- For behavioral questions, reward use of the STAR structure (Situation, Task, Action, Result).
- modelAnswer: concrete and realistic for a student or entry-level candidate.
- Writing style: do not use em dashes or en dashes. Use commas, periods, or parentheses instead. Keep the tone encouraging and human.

ROLE:
${role}

CANDIDATE PRACTICE ANSWERS:
${qa}`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(extractJson(raw));
  const evals: Record<string, unknown>[] = Array.isArray(parsed.evaluations)
    ? parsed.evaluations
    : [];

  return evals.map((e, i) => ({
    question: answers[i]?.question ?? "",
    score: Number(e.score) || 0,
    strengths: String(e.strengths ?? ""),
    missing: String(e.missing ?? ""),
    modelAnswer: String(e.modelAnswer ?? ""),
  }));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const role: string = body?.role ?? "";
  const rawAnswers: AnswerInput[] = Array.isArray(body?.answers) ? body.answers : [];

  // Only evaluate questions the candidate actually answered
  const answers = rawAnswers.filter(
    (a) => a && typeof a.answer === "string" && a.answer.trim().length > 0,
  );

  if (!role.trim() || answers.length === 0) {
    return NextResponse.json(
      { error: "Answer at least one question before requesting feedback." },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI service is not configured. Please try again later." },
      { status: 503 },
    );
  }

  try {
    const evaluations = await evaluateAnswers(role, answers);
    if (evaluations.length === 0) {
      return NextResponse.json(
        { error: "Could not evaluate your answers. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ evaluations });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong evaluating your answers. Please try again." },
      { status: 502 },
    );
  }
}
