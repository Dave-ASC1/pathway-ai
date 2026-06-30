import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

type CareerPath = {
  title: string;
  fit: string;
  progression: string[];
  skills: string[];
  firstStep: string;
};

function extractJson(text: string): string {
  // Strip markdown fences if the model wraps the JSON
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

async function generatePaths(input: {
  major: string;
  year: string;
  interests: string;
  targetIndustries: string;
}): Promise<CareerPath[]> {
  const client = new Anthropic();

  const prompt = `You are an experienced career advisor for college students. Based on the student profile below, suggest THREE realistic career paths.

Return ONLY valid JSON — no markdown fences, no explanation — with this exact shape:
{
  "paths": [
    {
      "title": "<job/career title>",
      "fit": "<2 sentences on why this path fits this specific student>",
      "progression": ["<entry role>", "<mid role>", "<senior role>"],
      "skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
      "firstStep": "<one concrete action the student can take this semester>"
    }
  ]
}

Rules:
- Exactly 3 paths.
- Paths must be realistic and achievable for a student with this background — not aspirational fantasy.
- progression: 3 role titles showing a 5-10 year trajectory.
- skills: 5 specific, named skills or tools the path requires.
- firstStep: concrete and doable this semester (a class, project, certification, club, or internship type).
- Writing style: do not use em dashes or en dashes. Use commas, periods, or parentheses instead. Keep the tone natural and human.

STUDENT PROFILE:
Major: ${input.major}
Year: ${input.year}
Interests: ${input.interests}
Target industries: ${input.targetIndustries || "Open to suggestions"}`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(extractJson(raw));
  const paths: CareerPath[] = Array.isArray(parsed.paths) ? parsed.paths : [];

  return paths.map((p) => ({
    title: String(p.title ?? ""),
    fit: String(p.fit ?? ""),
    progression: Array.isArray(p.progression) ? p.progression.map(String) : [],
    skills: Array.isArray(p.skills) ? p.skills.map(String) : [],
    firstStep: String(p.firstStep ?? ""),
  }));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const major: string = body?.major ?? "";
  const year: string = body?.year ?? "";
  const interests: string = body?.interests ?? "";
  const targetIndustries: string = body?.targetIndustries ?? "";

  if (!major.trim() || !interests.trim()) {
    return NextResponse.json(
      { error: "Major and interests are required." },
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
    const paths = await generatePaths({ major, year, interests, targetIndustries });
    if (paths.length === 0) {
      return NextResponse.json(
        { error: "Could not generate career paths. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ paths });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong generating your career paths. Please try again." },
      { status: 502 },
    );
  }
}
