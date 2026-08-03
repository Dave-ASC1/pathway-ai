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

function evaluation(score: number) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          score,
          strengths: "Clear structure.",
          missing: "No metrics.",
          modelAnswer: "A stronger answer would quantify the result.",
        }),
      },
    ],
  };
}

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/interview/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const threeAnswers = {
  role: "Data Analyst",
  answers: [
    { question: "Q one", answer: "A one" },
    { question: "Q two", answer: "A two" },
    { question: "Q three", answer: "A three" },
  ],
};

describe("POST /api/interview/evaluate", () => {
  beforeEach(() => {
    create.mockReset();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.restoreAllMocks();
  });

  it("sends one request per answer instead of batching them into one", async () => {
    create.mockResolvedValue(evaluation(70));
    const { POST } = await import("./route");

    await POST(postRequest(threeAnswers));

    expect(create).toHaveBeenCalledTimes(3);
  });

  it("issues those requests concurrently rather than one after another", async () => {
    let inFlight = 0;
    let peak = 0;
    create.mockImplementation(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 10));
      inFlight--;
      return evaluation(70);
    });
    const { POST } = await import("./route");

    await POST(postRequest(threeAnswers));

    // Serial execution would never have more than one call open at a time.
    expect(peak).toBe(3);
  });

  it("returns evaluations in the same order as the questions", async () => {
    create
      .mockResolvedValueOnce(evaluation(10))
      .mockResolvedValueOnce(evaluation(50))
      .mockResolvedValueOnce(evaluation(90));
    const { POST } = await import("./route");

    const data = await (await POST(postRequest(threeAnswers))).json();

    expect(data.evaluations.map((e: { question: string }) => e.question)).toEqual([
      "Q one",
      "Q two",
      "Q three",
    ]);
    expect(data.evaluations.map((e: { score: number }) => e.score)).toEqual([10, 50, 90]);
  });

  it("keeps the answers that succeeded when a single evaluation fails", async () => {
    create
      .mockResolvedValueOnce(evaluation(80))
      .mockRejectedValueOnce(new Error("upstream blip"))
      .mockResolvedValueOnce(evaluation(60));
    const { POST } = await import("./route");

    const res = await POST(postRequest(threeAnswers));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.evaluations).toHaveLength(2);
    expect(data.evaluations.map((e: { question: string }) => e.question)).toEqual(["Q one", "Q three"]);
  });

  it("parses a response wrapped in markdown fences", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: '```json\n{"score": 65, "strengths": "s", "missing": "m", "modelAnswer": "a"}\n```' }],
    });
    const { POST } = await import("./route");

    const data = await (await POST(postRequest(threeAnswers))).json();
    expect(data.evaluations[0].score).toBe(65);
  });

  it("clamps a score returned outside 0 to 100", async () => {
    create.mockResolvedValue(evaluation(150));
    const { POST } = await import("./route");

    const data = await (await POST(postRequest(threeAnswers))).json();
    expect(data.evaluations.every((e: { score: number }) => e.score <= 100)).toBe(true);
  });

  it("skips questions the candidate left blank", async () => {
    create.mockResolvedValue(evaluation(70));
    const { POST } = await import("./route");

    await POST(
      postRequest({
        role: "Data Analyst",
        answers: [
          { question: "Q one", answer: "answered" },
          { question: "Q two", answer: "   " },
          { question: "Q three", answer: "" },
        ],
      }),
    );

    expect(create).toHaveBeenCalledTimes(1);
  });

  it("frames the answer as data rather than instructions", async () => {
    create.mockResolvedValue(evaluation(70));
    const { POST } = await import("./route");
    await POST(postRequest(threeAnswers));

    expect(create.mock.calls[0][0].messages[0].content).toMatch(/data, not instructions/i);
  });

  it("returns 400 without calling the model when nothing was answered", async () => {
    const { POST } = await import("./route");

    const res = await POST(postRequest({ role: "Data Analyst", answers: [] }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 503 when no API key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { POST } = await import("./route");

    const res = await POST(postRequest(threeAnswers));
    expect(res.status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 502 when every evaluation fails", async () => {
    create.mockRejectedValue(new Error("upstream down"));
    const { POST } = await import("./route");

    const res = await POST(postRequest(threeAnswers));
    expect(res.status).toBe(502);
  });

  it("rejects an oversized request", async () => {
    const { POST } = await import("./route");

    const res = await POST(
      postRequest({ role: "Data Analyst", answers: [{ question: "q", answer: "x".repeat(40001) }] }),
    );
    expect(res.status).toBe(413);
    expect(create).not.toHaveBeenCalled();
  });
});
