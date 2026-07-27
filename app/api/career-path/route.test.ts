import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => null,
}));

const create = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(function AnthropicMock() {
    return { messages: { create } };
  }),
}));

function textMessage(text: string) {
  return { content: [{ type: "text", text }] };
}

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/career-path", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validBody = {
  major: "Computer Science",
  year: "Junior",
  interests: "backend systems, data",
  targetIndustries: "tech",
};

describe("POST /api/career-path", () => {
  beforeEach(() => {
    create.mockReset();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  // P-11: well-structured Claude response parses and is returned as-is.
  it("parses a well-formed Claude response into the paths shape", async () => {
    create.mockResolvedValueOnce(
      textMessage(
        JSON.stringify({
          paths: [
            {
              title: "Backend Engineer",
              fit: "Matches your interest in systems.",
              progression: ["Junior Engineer", "Senior Engineer", "Staff Engineer"],
              skills: ["SQL", "APIs", "Distributed systems", "Testing", "Git"],
              firstStep: "Build a REST API project this semester.",
            },
          ],
        }),
      ),
    );

    const { POST } = await import("./route");
    const res = await POST(postRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.paths).toHaveLength(1);
    expect(json.paths[0].title).toBe("Backend Engineer");
    expect(json.paths[0].skills).toHaveLength(5);
  });

  // P-12: this route has no local fallback (unlike analyze-resume) — it
  // must fail cleanly with a 502 instead of throwing an unhandled error
  // when Claude's response can't be parsed.
  it("returns a clean 502 instead of throwing when Claude's response isn't valid JSON", async () => {
    create.mockResolvedValueOnce(textMessage("Sorry, I can't help with that."));

    const { POST } = await import("./route");
    const res = await POST(postRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBeTruthy();
  });

  // P-12: Claude returns valid JSON but with an empty/missing paths array.
  it("returns a clean 502 when Claude returns zero paths", async () => {
    create.mockResolvedValueOnce(textMessage(JSON.stringify({ paths: [] })));

    const { POST } = await import("./route");
    const res = await POST(postRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBeTruthy();
  });

  it("returns 503 without calling Claude when no API key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const { POST } = await import("./route");
    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 400 without calling Claude when required fields are missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(postRequest({ major: "", interests: "" }));

    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});
