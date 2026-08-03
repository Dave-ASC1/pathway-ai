import { describe, it, expect, vi, afterEach } from "vitest";
import { examples, getExample, matchAnswersToQuestions, pickExample } from "@/lib/examples";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("examples", () => {
  it("populates every module for every example", () => {
    expect(examples.length).toBeGreaterThan(1);

    for (const ex of examples) {
      expect(ex.resumeChecker.resume.trim().length).toBeGreaterThan(40);
      expect(ex.resumeChecker.jobDescription.trim().length).toBeGreaterThan(40);
      expect(ex.careerPath.major.trim().length).toBeGreaterThan(1);
      expect(ex.careerPath.interests.trim().length).toBeGreaterThan(3);
      expect(ex.skillGap.currentSkills.trim().length).toBeGreaterThan(3);
      expect(ex.skillGap.targetRole.trim().length).toBeGreaterThan(1);
      expect(ex.interview.role.trim().length).toBeGreaterThan(2);
      expect(ex.interview.sampleAnswers.length).toBeGreaterThan(0);
      expect(ex.interview.sampleAnswers.every((a) => a.trim().length > 20)).toBe(true);
    }
  });

  it("clears each module's submit guard, so a loaded example is immediately usable", () => {
    // Mirrors the canSubmit / canAnalyze / canGenerate checks in the clients.
    for (const ex of examples) {
      expect(ex.resumeChecker.resume.trim().length > 40).toBe(true);
      expect(ex.resumeChecker.jobDescription.trim().length > 40).toBe(true);
      expect(ex.careerPath.major.trim().length > 1 && ex.careerPath.interests.trim().length > 3).toBe(true);
      expect(ex.skillGap.currentSkills.trim().length > 3 && ex.skillGap.targetRole.trim().length > 1).toBe(true);
      expect(ex.interview.role.trim().length > 2).toBe(true);
    }
  });

  it("uses unique ids", () => {
    const ids = examples.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers a range of candidate strength, not just strong resumes", () => {
    const strengths = new Set(examples.map((e) => e.strength));
    expect(strengths.has("strong")).toBe(true);
    expect(strengths.has("early")).toBe(true);
  });

  it("writes copy without em or en dashes", () => {
    for (const ex of examples) {
      const copy = [
        ex.label,
        ex.resumeChecker.resume,
        ex.resumeChecker.jobDescription,
        ex.careerPath.interests,
        ex.skillGap.currentSkills,
        ...ex.interview.sampleAnswers,
      ].join(" ");
      expect(copy).not.toMatch(/[—–]/);
    }
  });
});

describe("pickExample", () => {
  it("never returns the example that is already loaded", () => {
    for (const ex of examples) {
      for (let i = 0; i < 50; i++) {
        expect(pickExample(ex.id).id).not.toBe(ex.id);
      }
    }
  });

  it("can return any example when nothing is loaded yet", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(pickExample().id);
    expect(seen.size).toBe(examples.length);
  });

  it("falls back to the full set rather than crashing on an unknown id", () => {
    expect(() => pickExample("does-not-exist")).not.toThrow();
    expect(examples.map((e) => e.id)).toContain(pickExample("does-not-exist").id);
  });

  it("still returns an example when the pool would otherwise be empty", () => {
    // Math.random() at its upper bound must not index past the end of the array.
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(pickExample()).toBeDefined();
    expect(pickExample(examples[0].id)).toBeDefined();
  });
});

describe("matchAnswersToQuestions", () => {
  const bank = [
    "I rewrote the recursion handout after noticing students misunderstood the base case.",
    "I traced the network outage to a DNS misconfiguration and documented the fix.",
    "My weakness is that I have never worked on a shared codebase professionally.",
  ];

  it("pairs each question with the story that actually addresses it", () => {
    const questions = [
      "Tell me about a weakness you are working on.",
      "Explain how you would troubleshoot a network problem involving DNS.",
      "Describe a time you improved how something was taught.",
    ];
    const result = matchAnswersToQuestions(questions, bank);

    expect(result[0]).toBe(bank[2]);
    expect(result[1]).toBe(bank[1]);
    expect(result[2]).toBe(bank[0]);
  });

  it("returns one answer per question", () => {
    expect(matchAnswersToQuestions(["a question about DNS"], bank)).toHaveLength(1);
    expect(matchAnswersToQuestions(new Array(8).fill("some question"), bank)).toHaveLength(8);
  });

  it("leaves no question blank when there are more questions than stories", () => {
    const result = matchAnswersToQuestions(new Array(8).fill("a generic question"), bank);
    expect(result.every((answer) => answer.trim().length > 0)).toBe(true);
  });

  it("uses every story once before repeating any", () => {
    const questions = ["one", "two", "three"];
    const result = matchAnswersToQuestions(questions, bank);
    expect(new Set(result).size).toBe(3);
  });

  it("handles empty input without throwing", () => {
    expect(matchAnswersToQuestions([], bank)).toEqual([]);
    expect(matchAnswersToQuestions(["q"], [])).toEqual([]);
  });

  it("fills every question for each real example's answer bank", () => {
    for (const ex of examples) {
      const result = matchAnswersToQuestions(
        new Array(6).fill("Describe a challenge you faced."),
        ex.interview.sampleAnswers,
      );
      expect(result).toHaveLength(6);
      expect(result.every((a) => a.trim().length > 0)).toBe(true);
    }
  });
});

describe("getExample", () => {
  it("finds an example by id", () => {
    expect(getExample(examples[0].id)?.id).toBe(examples[0].id);
  });

  it("returns undefined for an unknown id", () => {
    expect(getExample("nope")).toBeUndefined();
  });
});
