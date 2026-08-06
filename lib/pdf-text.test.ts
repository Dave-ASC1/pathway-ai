import { describe, it, expect } from "vitest";
import {
  type PdfTextItem,
  groupItemsIntoLines,
  joinLinesWithSpacing,
  pdfItemsToText,
} from "@/lib/pdf-text";

// Builds the shape pdfjs hands back: one entry per run of text, with hasEOL set
// on the run that ends a rendered line.
function line(text: string, y: number): PdfTextItem[] {
  return [{ str: text, y, hasEOL: true }];
}

// Evenly spaced lines, the layout a plain text resume produces.
function evenlySpaced(texts: string[], leading = 12): PdfTextItem[] {
  return texts.flatMap((text, i) => line(text, 800 - i * leading));
}

describe("groupItemsIntoLines", () => {
  it("splits on hasEOL rather than running every item together", () => {
    const items: PdfTextItem[] = [
      { str: "JORDAN ELLIS", y: 800, hasEOL: true },
      { str: "EDUCATION", y: 780, hasEOL: true },
    ];
    expect(groupItemsIntoLines(items)).toEqual([
      { text: "JORDAN ELLIS", y: 800 },
      { text: "EDUCATION", y: 780 },
    ]);
  });

  it("joins the runs inside one line without inserting spaces", () => {
    // A single rendered line often arrives as several runs when the font
    // changes mid-line. The spacing is already part of the strings.
    const items: PdfTextItem[] = [
      { str: "Languages: ", y: 800, hasEOL: false },
      { str: "JavaScript, TypeScript", y: 800, hasEOL: true },
    ];
    expect(groupItemsIntoLines(items)).toEqual([
      { text: "Languages: JavaScript, TypeScript", y: 800 },
    ]);
  });

  it("keeps a trailing run that the PDF never marks as ending a line", () => {
    const items: PdfTextItem[] = [{ str: "Tools: Git", y: 700, hasEOL: false }];
    expect(groupItemsIntoLines(items)).toEqual([{ text: "Tools: Git", y: 700 }]);
  });

  it("drops blank runs so they cannot become stray lines", () => {
    const items: PdfTextItem[] = [
      { str: "SKILLS", y: 800, hasEOL: true },
      { str: "   ", y: 788, hasEOL: true },
      { str: "Git", y: 776, hasEOL: true },
    ];
    expect(groupItemsIntoLines(items).map((l) => l.text)).toEqual(["SKILLS", "Git"]);
  });
});

describe("joinLinesWithSpacing", () => {
  it("reads a doubled gap as the blank line it was", () => {
    // "EXPERIENCE" sits two line heights below, which is what an empty line in
    // the original document looks like once it reaches the PDF.
    const lines = [
      { text: "GPA: 3.6", y: 800 },
      { text: "Coursework: Databases", y: 788 },
      { text: "More coursework", y: 776 },
      { text: "Even more coursework", y: 764 },
      { text: "Still more", y: 752 },
      { text: "EXPERIENCE", y: 728 },
    ];
    expect(joinLinesWithSpacing(lines)).toContain("Still more\n\nEXPERIENCE");
  });

  it("keeps consecutive body lines on single breaks", () => {
    const text = joinLinesWithSpacing(
      groupItemsIntoLines(evenlySpaced(["one", "two", "three", "four", "five", "six"])),
    );
    expect(text).toBe("one\ntwo\nthree\nfour\nfive\nsix");
  });

  it("measures against the most common gap, not the average", () => {
    // One very large gap would drag a mean or median upward far enough that the
    // ordinary section breaks stop registering.
    const lines = [
      { text: "a", y: 800 },
      { text: "b", y: 788 },
      { text: "c", y: 776 },
      { text: "d", y: 764 },
      { text: "e", y: 752 },
      { text: "SECTION", y: 728 },
      { text: "f", y: 716 },
      { text: "FOOTER", y: 300 },
    ];
    const text = joinLinesWithSpacing(lines);
    expect(text).toContain("e\n\nSECTION");
    expect(text).toContain("SECTION\nf");
    expect(text).toContain("f\n\nFOOTER");
  });

  it("does not guess at spacing when there are too few lines to learn from", () => {
    const lines = [
      { text: "JORDAN ELLIS", y: 800 },
      { text: "jordan.ellis@psu.edu", y: 600 },
    ];
    expect(joinLinesWithSpacing(lines)).toBe("JORDAN ELLIS\njordan.ellis@psu.edu");
  });

  it("handles a single line and no lines at all", () => {
    expect(joinLinesWithSpacing([{ text: "only", y: 800 }])).toBe("only");
    expect(joinLinesWithSpacing([])).toBe("");
  });
});

describe("pdfItemsToText", () => {
  it("preserves the line structure of a resume instead of flattening it", () => {
    // The regression this file exists for: the text used to arrive as one
    // paragraph because every line break was collapsed into a space.
    const items = [
      evenlySpaced([
        "JORDAN ELLIS",
        "State College, PA | jordan.ellis@psu.edu",
        "",
        "EDUCATION",
        "Penn State University",
        "B.S. Information Sciences and Technology",
        "",
        "SKILLS",
        "JavaScript, TypeScript, Python",
      ]),
    ];
    const text = pdfItemsToText(items);

    expect(text.split("\n")[0]).toBe("JORDAN ELLIS");
    expect(text).toContain("State College, PA | jordan.ellis@psu.edu\n\nEDUCATION");
    expect(text).toContain("EDUCATION\nPenn State University");
    expect(text).toContain("B.S. Information Sciences and Technology\n\nSKILLS");
  });

  it("separates pages", () => {
    const items = [evenlySpaced(["page one"]), evenlySpaced(["page two"])];
    expect(pdfItemsToText(items)).toBe("page one\n\npage two");
  });

  it("skips pages that hold no text", () => {
    const items = [evenlySpaced(["real content"]), [], evenlySpaced(["more content"])];
    expect(pdfItemsToText(items)).toBe("real content\n\nmore content");
  });

  it("returns an empty string for a document with no extractable text", () => {
    // Scanned resumes land here, and the route turns this into a message
    // telling the student the file looks image based.
    expect(pdfItemsToText([[], []])).toBe("");
  });
});
