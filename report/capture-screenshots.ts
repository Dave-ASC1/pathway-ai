/**
 * Regenerates the screenshots in public/screenshots/ from the live site.
 *
 * The committed set was captured on June 30 and shows the pre-redesign landing
 * page, with three of the four modules still badged "Planned module". That
 * actively contradicts the shipped app, which is the worst state for a
 * screenshot deliverable to be in.
 *
 * Run:  npx tsx report/capture-screenshots.ts
 * Against local instead:  SITE=http://localhost:3000 npx tsx report/capture-screenshots.ts
 *
 * The AI-backed shots need a real key, so this must point at production (or a
 * local server with ANTHROPIC_API_KEY set) to capture populated results.
 */
import { chromium, type Page } from "playwright";
import path from "node:path";
import { examples } from "../lib/examples";

const SITE = process.env.SITE ?? "https://pathway-aiapp.vercel.app";
const OUT = path.resolve(__dirname, "../public/screenshots");

// Jordan: the strong profile, so results views show a healthy score rather than
// a wall of red, which reads better as a deliverable.
const jordan = examples.find((e) => e.id === "jordan")!;

// The sidebar is `position: sticky; height: 100vh`. In a fullPage capture
// Playwright stretches the viewport, which leaves it stranded partway down the
// image. Dropping it to static with auto height renders it at the top and keeps
// it a grid item, so the 280px/1fr layout survives. (Going `absolute` instead
// pulls it out of the grid and collapses the content column.) Screenshot only,
// the app is untouched.
const PIN_SIDEBAR = `.app-sidebar {
  position: static !important;
  height: auto !important;
  align-self: start !important;
}`;

async function shot(page: Page, name: string) {
  await page.addStyleTag({ content: PIN_SIDEBAR });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log(`  saved ${name}.png`);
}

/** Waits for a selector, but never lets one slow AI call stall the whole run. */
async function settle(page: Page, selector: string, timeout = 90000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.waitForTimeout(1200); // let charts and transitions finish
    return true;
  } catch {
    console.warn(`  WARNING: "${selector}" never appeared, capturing as-is`);
    return false;
  }
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  console.log(`Capturing from ${SITE}`);

  // ── Landing ──────────────────────────────────────────────────────────────
  await page.goto(SITE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500); // the journey path animates in
  await shot(page, "landing-page");

  // ── Resume checker, filled but not yet analyzed ───────────────────────────
  await page.goto(`${SITE}/resume-checker`, { waitUntil: "networkidle" });
  const boxes = page.locator("textarea");
  await boxes.nth(0).fill(jordan.resumeChecker.resume);
  await boxes.nth(1).fill(jordan.resumeChecker.jobDescription);
  await page.waitForTimeout(500);
  await shot(page, "resume-checker-input");

  // ── Resume checker results ───────────────────────────────────────────────
  await page.getByRole("button", { name: /^Analyze resume$/ }).click();
  await settle(page, ".keyword");
  await shot(page, "resume-checker-results");

  // ── Dashboard (after a step is done, so progress is visible) ─────────────
  await page.goto(`${SITE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot(page, "dashboard");

  // ── Career paths ─────────────────────────────────────────────────────────
  await page.goto(`${SITE}/career-path`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Try an example/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /Explore career paths/ }).click();
  await settle(page, ".path-card");
  await shot(page, "career-path-results");

  // ── Skill gap roadmap ────────────────────────────────────────────────────
  await page.goto(`${SITE}/skill-gap`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Try an example/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /Build my roadmap/ }).click();
  await settle(page, ".roadmap-step");
  await shot(page, "skill-gap-results");

  // ── Interview coach ──────────────────────────────────────────────────────
  await page.goto(`${SITE}/interview`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Try an example/ }).click();
  await settle(page, ".interview-q-text");
  await shot(page, "interview-questions");

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
