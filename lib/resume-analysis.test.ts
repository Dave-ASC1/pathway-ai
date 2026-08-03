import { describe, it, expect } from "vitest";
import { analyzeResume, extractKeywords, tokenize } from "@/lib/resume-analysis";
import { examples } from "@/lib/examples";

describe("tokenize", () => {
  it("strips trailing punctuation so a sentence-final word is not its own token", () => {
    expect(tokenize("window functions.")).toEqual(["window", "functions"]);
    // The same word must collapse to one token whether or not it ends a sentence.
    expect(tokenize("uses joins. Uses joins")).toEqual(["uses", "joins", "uses", "joins"]);
  });

  it("keeps punctuation inside a word", () => {
    expect(tokenize("node.js and full-stack work")).toContain("node.js");
    expect(tokenize("node.js and full-stack work")).toContain("full-stack");
  });

  it("drops hiring boilerplate that carries no signal about fit", () => {
    const boilerplate =
      "Minimum qualifications preferred experience including benefits paid annual salary hybrid onsite equal opportunity employer";
    expect(tokenize(boilerplate)).toEqual([]);
  });

  it("keeps real skills", () => {
    expect(tokenize("Snowflake Tableau python pandas")).toEqual([
      "snowflake",
      "tableau",
      "python",
      "pandas",
    ]);
  });
});

describe("extractKeywords", () => {
  it("surfaces skills rather than posting boilerplate on a realistic job description", () => {
    const jd = examples.find((e) => e.id === "alex")!.resumeChecker.jobDescription;
    const keywords = extractKeywords(jd);

    // The boilerplate a frequency count would otherwise rank highly.
    for (const noise of [
      "qualifications",
      "preferred",
      "minimum",
      "including",
      "experience",
      "benefits",
      "paid",
      "hybrid",
      "opportunity",
      "employer",
    ]) {
      expect(keywords).not.toContain(noise);
    }

    // At least some genuinely role-specific terms should survive.
    expect(keywords.some((k) => ["data", "tableau", "merchandising", "ecommerce", "retail"].includes(k))).toBe(
      true,
    );
  });

  it("returns nothing for empty input", () => {
    expect(extractKeywords("")).toEqual([]);
  });
});

describe("analyzeResume", () => {
  it("scores a well-matched resume above a clearly unqualified one", () => {
    const strong = examples.find((e) => e.id === "jordan")!.resumeChecker;
    const early = examples.find((e) => e.id === "alex")!.resumeChecker;

    const strongScore = analyzeResume(strong.resume, strong.jobDescription).score;
    const earlyScore = analyzeResume(early.resume, early.jobDescription).score;

    expect(strongScore).toBeGreaterThan(earlyScore);
  });

  it("keeps every score inside 0 to 100", () => {
    for (const ex of examples) {
      const result = analyzeResume(ex.resumeChecker.resume, ex.resumeChecker.jobDescription);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      for (const section of result.sections) {
        expect(section.score).toBeGreaterThanOrEqual(0);
        expect(section.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("does not report a keyword as both matched and missing", () => {
    for (const ex of examples) {
      const { matchedKeywords, missingKeywords } = analyzeResume(
        ex.resumeChecker.resume,
        ex.resumeChecker.jobDescription,
      );
      const overlap = matchedKeywords.filter((k) => missingKeywords.includes(k));
      expect(overlap).toEqual([]);
    }
  });

  it("handles empty input without throwing", () => {
    const result = analyzeResume("", "");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.sections).toHaveLength(5);
  });
});
