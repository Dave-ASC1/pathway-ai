import { chromium } from "@playwright/test";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public", "screenshots");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1 — Landing page
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT_DIR, "landing-page.png"), fullPage: true });
  console.log("✓ landing-page.png");

  // 2 — Dashboard
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT_DIR, "dashboard.png"), fullPage: true });
  console.log("✓ dashboard.png");

  // 3 — Resume checker: "before analyze" state
  // Navigate, wait for page to load with sample data
  await page.goto(`${BASE_URL}/resume-checker`, { waitUntil: "networkidle" });
  // Append a space to the job description textarea — this triggers setHasAnalyzed(false)
  // which flips the score ring back to "--%" showing the pre-analysis state
  const jdTextarea = page.locator('textarea').nth(1);
  await jdTextarea.focus();
  await jdTextarea.press("End");
  await jdTextarea.type(" ");
  await page.screenshot({ path: path.join(OUT_DIR, "resume-checker-input.png"), fullPage: true });
  console.log("✓ resume-checker-input.png");

  // 4 — Resume checker: after clicking Analyze
  await page.locator('button[type="submit"]').click();
  // Brief wait for React state to settle
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, "resume-checker-results.png"), fullPage: true });
  console.log("✓ resume-checker-results.png");

  await browser.close();
  console.log("\nAll screenshots saved to public/screenshots/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
