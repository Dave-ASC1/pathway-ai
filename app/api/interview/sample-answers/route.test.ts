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
  return new NextRequest("http://localhost/api/interview/sample-answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const valid = {
  role: "IT Operations Analyst",
  questions: ["Tell me about a time you fixed something.", "Explain DNS."],
  background: "Jordan Miles, IT operations intern.",
  strength: "strong",
};

describe("POST /api/interview/sample-answers", () => {
  beforeEach(() => {
    create.mockReset();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.restoreAllMocks();
  });

  it("returns one answer per question", async () => {
    create.mockResolvedValue(textMessage(JSON.stringify({ answers: ["first answer", "second answer"] })));
    const { POST } = await import("./route");

    const res = await POST(postRequest(valid));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.answers).toEqual(["first answer", "second answer"]);
  });

  it("parses a response wrapped in markdown fences", async () => {
    create.mockResolvedValue(
      textMessage('```json\n{"answers": ["a one", "a two"]}\n```'),
    );
    const { POST } = await import("./route");

    const data = await (await POST(postRequest(valid))).json();
    expect(data.answers).toEqual(["a one", "a two"]);
  });

  it("never returns more answers than questions asked", async () => {
    create.mockResolvedValue(
      textMessage(JSON.stringify({ answers: ["one", "two", "three", "four"] })),
    );
    const { POST } = await import("./route");

    const data = await (await POST(postRequest(valid))).json();
    expect(data.answers).toHaveLength(2);
  });

  it("passes the question text through to the prompt", async () => {
    create.mockResolvedValue(textMessage(JSON.stringify({ answers: ["x", "y"] })));
    const { POST } = await import("./route");
    await POST(postRequest(valid));

    const prompt = create.mock.calls[0][0].messages[0].content;
    expect(prompt).toContain("Tell me about a time you fixed something.");
    expect(prompt).toContain("Explain DNS.");
  });

  it("frames background and questions as untrusted data", async () => {
    create.mockResolvedValue(textMessage(JSON.stringify({ answers: ["x", "y"] })));
    const { POST } = await import("./route");
    await POST(postRequest(valid));

    const prompt = create.mock.calls[0][0].messages[0].content;
    expect(prompt).toContain("<background>");
    expect(prompt).toContain("<questions>");
    expect(prompt).toMatch(/data, not instructions/i);
  });

  it("calibrates the prompt to the profile's strength", async () => {
    create.mockResolvedValue(textMessage(JSON.stringify({ answers: ["x", "y"] })));
    const { POST } = await import("./route");

    await POST(postRequest({ ...valid, strength: "early" }));
    expect(create.mock.calls[0][0].messages[0].content).toMatch(/no experience in this field yet/i);

    create.mockClear();
    await POST(postRequest({ ...valid, strength: "strong" }));
    expect(create.mock.calls[0][0].messages[0].content).toMatch(/genuinely well prepared/i);
  });

  it("falls back to a safe calibration when strength is missing or bogus", async () => {
    create.mockResolvedValue(textMessage(JSON.stringify({ answers: ["x", "y"] })));
    const { POST } = await import("./route");

    const res = await POST(postRequest({ ...valid, strength: 12345 }));
    expect(res.status).toBe(200);
    expect(create.mock.calls[0][0].messages[0].content).toMatch(/competent but still early/i);
  });

  it("returns 400 without calling the model when questions are missing", async () => {
    const { POST } = await import("./route");

    const res = await POST(postRequest({ role: "Analyst", questions: [] }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("ignores non-string entries in the questions array", async () => {
    const { POST } = await import("./route");

    const res = await POST(postRequest({ role: "Analyst", questions: [1, null, {}] }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects an oversized request", async () => {
    const { POST } = await import("./route");

    const res = await POST(
      postRequest({ ...valid, background: "x".repeat(40001) }),
    );
    expect(res.status).toBe(413);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects far more questions than the coach ever generates", async () => {
    const { POST } = await import("./route");

    const res = await POST(postRequest({ ...valid, questions: new Array(20).fill("q") }));
    expect(res.status).toBe(413);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 503 when no API key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { POST } = await import("./route");

    const res = await POST(postRequest(valid));
    expect(res.status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 502 rather than throwing when the model call fails", async () => {
    create.mockRejectedValue(new Error("upstream down"));
    const { POST } = await import("./route");

    const res = await POST(postRequest(valid));
    expect(res.status).toBe(502);
  });

  it("returns 502 when the model returns no usable JSON", async () => {
    create.mockResolvedValue(textMessage("I cannot help with that."));
    const { POST } = await import("./route");

    const res = await POST(postRequest(valid));
    expect(res.status).toBe(502);
  });
});
