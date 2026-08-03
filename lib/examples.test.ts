import { describe, it, expect, vi, afterEach } from "vitest";
import { examples, getExample, pickExample } from "@/lib/examples";

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

describe("getExample", () => {
  it("finds an example by id", () => {
    expect(getExample(examples[0].id)?.id).toBe(examples[0].id);
  });

  it("returns undefined for an unknown id", () => {
    expect(getExample("nope")).toBeUndefined();
  });
});
