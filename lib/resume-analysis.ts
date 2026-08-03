// Deterministic resume analysis, shared by the client and the API route.
//
// This runs as the fallback whenever the AI call is unavailable or fails, and
// the client uses the same code so an offline result never disagrees with a
// server one. It previously lived in both files as a copy, which meant a fix in
// one place silently left the other behind.

export type Section = { label: string; score: number };

export type Analysis = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  sections: Section[];
};

// Words that carry no signal about whether a resume fits a role. Real job
// postings are mostly boilerplate by volume (benefits, equal opportunity
// statements, "minimum qualifications" headers, company blurbs), and a plain
// frequency count surfaces that boilerplate ahead of the actual skills. Without
// this list a posting will happily report "including", "minimum", and "paid" as
// the keywords a student is missing.
const stopWords = new Set([
  // general filler
  "about", "after", "also", "and", "are", "back", "been", "both", "but",
  "can", "each", "for", "from", "has", "have", "here", "into", "just",
  "like", "more", "most", "much", "must", "need", "only", "other", "our",
  "over", "same", "some", "such", "than", "that", "the", "their", "them",
  "then", "there", "these", "they", "this", "those", "through", "very",
  "well", "what", "when", "where", "which", "while", "with", "within",
  "will", "would", "could", "should", "you", "your",
  // posting structure and hiring boilerplate
  "ability", "able", "applicants", "apply", "candidate", "candidates",
  "consideration", "employer", "equal", "experience", "hiring", "join",
  "minimum", "offer", "opportunity", "position", "preferred", "proud",
  "qualifications", "receive", "regard", "required", "requirements",
  "responsibilities", "role", "seeking", "status", "team", "workplace",
  // compensation, benefits, and logistics
  "annual", "annually", "based", "benefits", "coverage", "days", "dental",
  "employee", "flexibility", "full-time", "holidays", "hybrid", "insurance",
  "leave", "match", "medical", "onsite", "paid", "parental", "part-time",
  "remote", "salary", "stipend", "time", "vision", "week", "year", "years",
  // vague descriptors that appear in nearly every posting
  "detail", "excellent", "including", "modern", "oriented", "strong",
  "clear", "comfortable", "familiar", "familiarity", "knowledge", "level",
  "practical", "relevant", "working",
]);

export function tokenize(text: string) {
  return text
    .toLowerCase()
    // Keep . + # - inside words so node.js, c++, c#, and full-stack survive.
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    // Strip trailing punctuation, otherwise a word that happens to close a
    // sentence becomes its own token ("functions." != "functions"). Only the
    // trailing end is trimmed so leading-dot names like .net stay intact.
    .map((word) => word.replace(/[.-]+$/, ""))
    .filter((word) => word.length > 3 && !stopWords.has(word));
}

export function extractKeywords(jobDescription: string) {
  const counts = new Map<string, number>();

  tokenize(jobDescription).forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 18)
    .map(([word]) => word);
}

// Scores a section 0-100 from how many of its trigger terms show up in the
// resume, so the local (non-AI) fallback can still show a progress bar
// instead of a flat yes/no.
//
// Matching even one term means the section is present, so the floor for a hit
// sits above the 60 the advice copy treats as adequate. The old floor of 35
// meant a resume with a plain "Skills:" heading scored 57 and got told to add a
// skills section it already had.
export function sectionScore(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  const hits = terms.filter((term) => lower.includes(term)).length;
  if (hits === 0) return 20;
  return Math.min(100, Math.round(62 + (hits / terms.length) * 38));
}

export function analyzeResume(resume: string, jobDescription: string): Analysis {
  const keywords = extractKeywords(jobDescription);
  const resumeWords = new Set(tokenize(resume));
  const matchedKeywords = keywords.filter((keyword) => resumeWords.has(keyword));
  const missingKeywords = keywords.filter((keyword) => !resumeWords.has(keyword));
  const matchRatio = keywords.length ? matchedKeywords.length / keywords.length : 0;

  const sections: Section[] = [
    { label: "Education", score: sectionScore(resume, ["education", "university", "college"]) },
    { label: "Projects", score: sectionScore(resume, ["project", "portfolio", "built", "designed"]) },
    { label: "Skills", score: sectionScore(resume, ["skills", "tools", "technologies"]) },
    { label: "Experience", score: sectionScore(resume, ["experience", "intern", "work", "volunteer"]) },
    { label: "Impact", score: sectionScore(resume, ["improved", "increased", "reduced", "%", "users"]) },
  ];

  const avgSectionScore = sections.reduce((sum, section) => sum + section.score, 0) / sections.length / 100;
  const score = Math.round(matchRatio * 72 + avgSectionScore * 28);

  const findSection = (label: string) => sections.find((section) => section.label === label)?.score ?? 0;

  const strengths = [
    matchedKeywords.length > 0
      ? `The resume already matches ${matchedKeywords.length} important role keyword${matchedKeywords.length === 1 ? "" : "s"}.`
      : "The resume has a foundation, but it needs more language from the target role.",
    findSection("Projects") >= 60
      ? "Project work is visible, which helps students with limited formal experience show proof of ability."
      : "Adding project work would make the resume stronger for student-level roles.",
    findSection("Skills") >= 60
      ? "The skills section helps recruiters quickly understand the student's toolset."
      : "A dedicated skills section would make the resume easier to scan.",
  ];

  const improvements = [
    missingKeywords.length > 0
      ? `Add truthful examples using missing keywords such as ${missingKeywords.slice(0, 5).join(", ")}.`
      : "Keyword coverage is strong. Focus next on clearer outcomes and stronger bullets.",
    findSection("Impact") >= 60
      ? "Keep impact language visible and connect each result to a project or work activity."
      : "Add measurable outcomes where possible, such as users supported, reports built, time saved, or errors reduced.",
    findSection("Experience") >= 60
      ? "Make sure experience bullets begin with action verbs and connect directly to the job description."
      : "If formal work experience is limited, add class projects, volunteer work, or campus leadership as experience.",
  ];

  return { score, matchedKeywords, missingKeywords, strengths, improvements, sections };
}
