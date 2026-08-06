// Turning PDF text runs back into readable lines.
//
// A PDF has no notion of a line or a paragraph. It stores positioned runs of
// text, so anything that reads one has to rebuild the layout from coordinates.
// unpdf's own `extractText({ mergePages: true })` collapses every run into a
// single space-separated string, which is why an uploaded resume used to arrive
// as one long paragraph. We rebuild the lines here instead.

export type PdfTextItem = {
  str: string;
  y: number;
  hasEOL: boolean;
};

export type PdfLine = {
  text: string;
  y: number;
};

// How much bigger than the normal line spacing a gap has to be before we read
// it as a deliberate break. An empty line in an evenly spaced document lands at
// exactly 2x, so the threshold sits just under that, with margin for the
// rounding in commonLineGap. Documents that separate sections with margins
// instead of empty lines produce a spread of gaps, and the wider ones clear
// this too. Erring toward a blank line is the safer side of the trade: a spare
// blank line reads fine, a missing one runs two sections together.
const BLANK_LINE_RATIO = 1.8;

// Below this many lines there is not enough spacing data to tell a paragraph
// break apart from ordinary leading, so we do not guess.
const MIN_GAPS_FOR_SPACING = 5;

// pdfjs marks the run at the end of each rendered line with hasEOL, which is
// the one piece of real line information the format gives us. Runs are joined
// exactly as they arrive, since the spacing inside a line is already baked into
// the strings themselves.
export function groupItemsIntoLines(items: PdfTextItem[]): PdfLine[] {
  const lines: PdfLine[] = [];
  let text = "";
  let y: number | null = null;

  const flush = () => {
    if (text.trim()) lines.push({ text: text.trimEnd(), y: y ?? 0 });
    text = "";
    y = null;
  };

  for (const item of items) {
    if (y === null) y = item.y;
    text += item.str;
    if (item.hasEOL) flush();
  }
  flush();

  return lines;
}

// The most common gap is the body text leading. Mean and median both get
// dragged upward by the section spacing we are trying to detect, so neither
// works as the baseline.
function commonLineGap(gaps: number[]): number {
  const counts = new Map<number, number>();
  for (const gap of gaps) {
    const rounded = Math.round(gap);
    counts.set(rounded, (counts.get(rounded) ?? 0) + 1);
  }

  let best = 0;
  let bestCount = 0;
  for (const [value, count] of counts) {
    // Ties go to the tighter spacing, which is the body text.
    if (count > bestCount || (count === bestCount && value < best)) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

// Vertical position runs bottom-up in PDF coordinates, so a gap is the drop
// from the previous line to this one.
export function joinLinesWithSpacing(lines: PdfLine[]): string {
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const gap = lines[i - 1].y - lines[i].y;
    if (gap > 0) gaps.push(gap);
  }

  const leading = gaps.length >= MIN_GAPS_FOR_SPACING ? commonLineGap(gaps) : 0;
  if (leading <= 0) return lines.map((line) => line.text).join("\n");

  return lines
    .map((line, i) => {
      if (i === 0) return line.text;
      const gap = lines[i - 1].y - line.y;
      const separator = gap > leading * BLANK_LINE_RATIO ? "\n\n" : "\n";
      return separator + line.text;
    })
    .join("");
}

export function pdfItemsToText(pages: PdfTextItem[][]): string {
  return pages
    .map((items) => joinLinesWithSpacing(groupItemsIntoLines(items)))
    .filter((page) => page.trim())
    .join("\n\n");
}
