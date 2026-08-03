/**
 * Pathway AI - Enhancement & Implementation Report
 * ------------------------------------------------------------------
 * Generates a professional Word (.docx) document using the docx (docx-js)
 * library, with both architectural flowcharts embedded as high-quality PNGs.
 *
 * Usage:
 *   1) cd report
 *   2) npm install docx            (docx v9+ required)
 *   3) node generate-report.js
 *
 * Output: Pathway_AI_Enhancement_Report.docx (same folder)
 *
 * Notes:
 *   - Flowchart PNGs (simple-phase.png, enhanced-phase.png) must sit next to
 *     this script. They are rendered at 2600px wide (300 DPI) so they stay
 *     crisp when displayed at ~6.5in in Word.
 *   - Font: Arial. Headings: dark navy (#041336). No em dashes in content.
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, PageBreak,
} = require("docx");

// ---- Brand palette -------------------------------------------------------
const NAVY = "041336";      // headings
const BLUE = "3b82f6";      // accents
const INK = "0f172a";       // body text
const MUTED = "64748b";     // secondary text
const LINE = "e2e8f0";      // table borders / rules
const HEADER_BG = "041336"; // table header fill
const ALT_BG = "f7f9fc";    // zebra row fill
const FONT = "Arial";

// ---- Small helpers -------------------------------------------------------

// Body paragraph of prose.
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT, size: 22, color: INK, ...opts })],
  });
}

// Section heading (H1-style).
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text, font: FONT, size: 30, bold: true, color: NAVY })],
  });
}

// Sub heading (H2-style).
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: NAVY })],
  });
}

// A single labelled bullet-style line.
function bullet(label, text) {
  return new Paragraph({
    spacing: { after: 100, line: 264 },
    bullet: { level: 0 },
    children: [
      new TextRun({ text: label + ": ", font: FONT, size: 22, bold: true, color: NAVY }),
      new TextRun({ text, font: FONT, size: 22, color: INK }),
    ],
  });
}

// Table cell (header or body).
function cell(text, { header = false, width, bold = false, fill } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: header
      ? { type: ShadingType.CLEAR, fill: HEADER_BG, color: "auto" }
      : fill
      ? { type: ShadingType.CLEAR, fill, color: "auto" }
      : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            size: header ? 20 : 20,
            bold: header || bold,
            color: header ? "ffffff" : INK,
          }),
        ],
      }),
    ],
  });
}

// Build a table from a header row + data rows. `widths` is an array of % numbers.
function makeTable(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
  const borders = { top: border, bottom: border, left: border, right: border,
    insideHorizontal: border, insideVertical: border };
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, { header: true, width: widths[i] })),
  });
  const dataRows = rows.map((r, ri) =>
    new TableRow({
      children: r.map((c, i) =>
        cell(c, { width: widths[i], fill: ri % 2 === 1 ? ALT_BG : undefined })),
    }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [headerRow, ...dataRows],
  });
}

// Embed a PNG flowchart, scaled to a display width in pixels (aspect preserved),
// with a caption and accessibility alt text.
function figure(file, displayWidth, altTitle, altDesc, caption) {
  const data = fs.readFileSync(path.join(__dirname, file));
  // Read intrinsic pixel size from the PNG IHDR chunk to preserve aspect ratio.
  const w = data.readUInt32BE(16);
  const h = data.readUInt32BE(20);
  const displayHeight = Math.round(displayWidth * (h / w));
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [
        new ImageRun({
          type: "png",
          data,
          transformation: { width: displayWidth, height: displayHeight },
          altText: { title: altTitle, description: altDesc, name: altTitle },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [new TextRun({ text: caption, font: FONT, size: 18, italics: true, color: MUTED })],
    }),
  ];
}

// ---- Document content ----------------------------------------------------

const doc = new Document({
  creator: "David Ademoye",
  title: "Pathway AI - Enhancement & Implementation Report",
  description: "IST 440W capstone enhancement and implementation report for Pathway AI.",
  styles: {
    default: {
      document: { run: { font: FONT, size: 22, color: INK } },
    },
  },
  sections: [
    {
      properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      children: [
        // ============ 1. TITLE PAGE ============
        new Paragraph({ spacing: { before: 2600 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "Pathway AI", font: FONT, size: 64, bold: true, color: NAVY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "Enhancement & Implementation Report", font: FONT, size: 34, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [new TextRun({ text: "A Student Career Readiness Web Platform", font: FONT, size: 24, italics: true, color: MUTED })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "IST 440W Capstone Project", font: FONT, size: 24, bold: true, color: INK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "David Ademoye", font: FONT, size: 24, color: INK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "July 6, 2026", font: FONT, size: 22, color: MUTED })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 360, after: 20 },
          children: [new TextRun({ text: "Live Application: https://pathway-aiapp.vercel.app", font: FONT, size: 20, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Source Code: https://github.com/Dave-ASC1/pathway-ai", font: FONT, size: 20, color: BLUE })],
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ============ 2. EXECUTIVE SUMMARY ============
        h1("1. Executive Summary"),
        body("Pathway AI is a free career readiness platform for college students that unifies four preparation tools (an ATS resume checker, a career path explorer, a skill gap roadmap, and a mock interview coach) into a single integrated workspace. Competing products such as Jobscan, Teal, and Final Round AI solve these problems in isolation and charge for them. Pathway AI brings them together at no cost, with the modules sharing data so that a student's resume, skills, and target role flow from one tool to the next."),
        body("The enhancement described in this report replaces the original deterministic, keyword-matching engine with Claude Opus 4.8, applied across all four modules. In the simple phase, only the resume checker worked, and it did so through client-side keyword counting with no understanding of context. The remaining three modules were placeholder cards with no logic behind them. The enhanced phase promotes every module to a fully functional, AI-powered feature served through dedicated, rate-limited backend API routes, so the Claude API key is never exposed to the browser."),
        body("The result is a materially more capable product. Students now receive contextual resume feedback rather than raw keyword counts, generated career paths tailored to their major and interests, prioritized skill gap roadmaps, and interactive interview practice with scored feedback. A local deterministic fallback remains in place for every module, so the application continues to function even if the AI service is unavailable. The live application is deployed publicly on Vercel, and the source is available in a public GitHub repository."),

        // ============ 3. COMPARATIVE ANALYSIS ============
        h1("2. Comparative Analysis: Before and After"),
        body("The table below summarizes how each area of the platform changed between the simple phase (before enhancements) and the enhanced phase (after enhancements)."),
        makeTable(
          ["Capability", "Simple Phase (Before)", "Enhanced Phase (After)"],
          [
            ["Resume Checker", "Client-side keyword matching, deterministic, no context awareness", "Claude Opus 4.8 ATS analysis with contextual scoring and file upload"],
            ["Career Path Explorer", "Placeholder card, non-functional", "AI-generated career paths with progression and required skills"],
            ["Skill Gap Roadmap", "Placeholder card, non-functional", "AI gap analysis with a prioritized, resource-based learning roadmap"],
            ["Interview Coach", "Placeholder card, non-functional", "AI-generated questions with scored responses and model answers"],
            ["Intelligence", "Local keyword logic only", "Claude Opus 4.8 with local deterministic fallback"],
            ["Data flow", "Isolated, no sharing between tools", "Data handoff of resume text and skills across modules"],
            ["File input", "Pasted text only", "PDF and DOCX upload with server-side parsing"],
            ["Backend", "None (all client-side)", "Five server-side, rate-limited API routes"],
            ["Persistence", "None", "Saved results surfaced on the dashboard"],
          ],
          [22, 39, 39]
        ),

        // ============ 4. ARCHITECTURAL FLOWCHARTS ============
        new Paragraph({ children: [new PageBreak()] }),
        h1("3. Architectural Flowcharts"),
        body("The two diagrams below contrast the system architecture before and after the enhancement. The simple phase shows a single functional module and three inactive placeholders. The enhanced phase shows all four modules powered by Claude Opus 4.8 through a rate-limited backend API layer, with data handoff between modules."),
        h2("3.1 Simple Phase (Before Enhancements)"),
        ...figure(
          "simple-phase.png", 620,
          "Simple Phase Architecture",
          "Flowchart of the simple phase. Landing Page connects to a red keyword-matching Resume Checker and then to a blue Dashboard. Below are three gray, non-functional placeholder modules: Career Path Explorer, Skill Gap Roadmap, and Mock Interview Coach. A legend maps blue to functional, red to local or limited with no AI, and gray to placeholder.",
          "Figure 1. Simple phase architecture. Only the resume checker (red) is functional; three modules remain non-functional placeholders (gray)."
        ),
        h2("3.2 Enhanced Phase (After Enhancements)"),
        ...figure(
          "enhanced-phase.png", 620,
          "Enhanced Phase Architecture",
          "Flowchart of the enhanced phase. Landing Page, Dashboard, and Saved Results form a blue functional navigation row. Below sit four cyan Claude AI-powered modules: Resume Checker, Career Path, Skill Gap, and Interview Coach, connected by a dashed data-handoff line. Each module feeds a purple backend API routes layer of five rate-limited routes, which in turn calls the Claude Opus 4.8 API with a local deterministic fallback.",
          "Figure 2. Enhanced phase architecture. All four modules (cyan) are AI-powered, served by five rate-limited API routes (purple), with data handoff between modules."
        ),

        // ============ 5. AI PROMPTS USED ============
        new Paragraph({ children: [new PageBreak()] }),
        h1("4. AI Prompts Used"),
        body("The following five prompts drive the AI features. Each is sent from a server-side API route so the API key stays private. Every prompt requests structured JSON output so responses can be rendered reliably in the interface."),

        h2("Prompt 1: Resume Analysis (/api/analyze-resume)"),
        bullet("Purpose", "Score a resume against a job description and return actionable ATS feedback."),
        body("\"You are a professional ATS resume reviewer. Given the resume text and the target job description, return JSON with: an overall match score from 0 to 100, the top matched keywords, the top missing keywords, a section completeness check for Education, Experience, Projects, Skills, and Impact, three specific strengths, and three specific improvement recommendations. Base every judgment on the actual content, not on keyword frequency alone.\"", { italics: true }),

        h2("Prompt 2: Career Path Generation (/api/career-path)"),
        bullet("Purpose", "Generate tailored career direction options from a student profile."),
        body("\"You are a career advisor for college students. Given the student's major, year, interests, and target industries, return JSON with three distinct career path options. For each path include a role title, a typical progression of roles over five years, and the core skills required. Keep the guidance concrete and realistic for an entry-level candidate.\"", { italics: true }),

        h2("Prompt 3: Skill Gap Roadmap (/api/skill-gap)"),
        bullet("Purpose", "Compare current skills to a target role and produce a prioritized learning plan."),
        body("\"You are a technical mentor. Given the student's current skills and a target role, return JSON with a gap analysis and a prioritized learning roadmap. For each roadmap item include the skill to learn, why it matters for the target role, a priority level, and the type of resource that would help. Order the roadmap from highest to lowest priority.\"", { italics: true }),

        h2("Prompt 4: Interview Question Generation (/api/interview)"),
        bullet("Purpose", "Produce a realistic, role-specific interview question set."),
        body("\"You are a hiring manager preparing an interview. Given a job role or job description, return JSON with five to eight interview questions that mix behavioral and technical topics appropriate to the role. Order them the way a real interview would flow, from warm-up to more demanding questions.\"", { italics: true }),

        h2("Prompt 5: Interview Response Evaluation (/api/interview)"),
        bullet("Purpose", "Score a student's answer and coach them toward a stronger response."),
        body("\"You are an interview coach. Given an interview question and the student's answer, return JSON with a score from 0 to 100, the specific strengths of the answer, what was missing or weak, and a concise model answer that demonstrates a strong response. Keep the feedback encouraging and specific.\"", { italics: true }),

        // ============ 6. TECHNICAL IMPLEMENTATION ============
        new Paragraph({ children: [new PageBreak()] }),
        h1("5. Technical Implementation"),
        h2("5.1 API Routes"),
        body("All AI calls run server-side through dedicated Next.js API routes. Each route validates input, calls the Claude Opus 4.8 API, enforces rate limiting, and falls back to a local deterministic response if the AI call fails."),
        makeTable(
          ["API Route", "Method", "Purpose", "Fallback"],
          [
            ["/api/analyze-resume", "POST", "Resume-to-job ATS scoring and feedback", "Local keyword analyzer"],
            ["/api/career-path", "POST", "Generate three tailored career paths", "Curated static paths"],
            ["/api/skill-gap", "POST", "Gap analysis and learning roadmap", "Rule-based skill map"],
            ["/api/interview", "POST", "Question generation and answer scoring", "Question bank + rubric"],
            ["/api/upload", "POST", "Parse uploaded PDF and DOCX resumes", "Manual text entry"],
          ],
          [30, 12, 40, 18]
        ),
        h2("5.2 Technology Stack"),
        makeTable(
          ["Layer", "Technology"],
          [
            ["Framework", "Next.js 16 (App Router)"],
            ["UI library", "React 19"],
            ["Language", "TypeScript"],
            ["Styling", "Tailwind CSS 4"],
            ["AI", "Claude Opus 4.8 via @anthropic-ai/sdk"],
            ["Authentication", "Clerk"],
            ["Database", "NeonDB (PostgreSQL) with Prisma ORM"],
            ["Hosting", "Vercel"],
            ["Version control", "GitHub"],
          ],
          [30, 70]
        ),

        // ============ 7. RESULTS & SUCCESS METRICS ============
        h1("6. Results and Success Metrics"),
        body("The enhancement met its objectives across functionality, reliability, and deployment."),
        bullet("Functional modules", "increased from one to four, with every placeholder replaced by a working AI feature."),
        bullet("Intelligence", "moved from local keyword counting to Claude Opus 4.8 contextual analysis across all modules."),
        bullet("Reliability", "every AI route retains a local deterministic fallback, so the application never fully breaks."),
        bullet("Integration", "resume text and skills now hand off between modules, delivering the platform's core value proposition."),
        bullet("Input flexibility", "students can upload PDF and DOCX files in addition to pasting text."),
        bullet("Deployment", "the application is live and publicly accessible on Vercel with source in a public GitHub repository."),
        body("The screenshot below shows the enhanced resume checker in action. A student's resume is scored against a target role with an overall match of 82 percent, matched and missing keyword counts, a five-section completeness check, and a radar visualization of section strength. This is the AI-driven output that replaced the earlier keyword-only view."),
        ...figure(
          "results_dashboard.png", 640,
          "Enhanced Resume Checker Results",
          "Screenshot of the enhanced resume checker results dashboard. A circular gauge shows an 82 percent match score. Cards show 10 matched keywords, 10 missing keywords, and 5 of 5 sections strong. A radar chart and progress bars show section strength for Education 70 percent, Experience 88 percent, Projects 80 percent, Skills 85 percent, and Impact 84 percent. A Saved indicator confirms the result was persisted.",
          "Figure 3. Enhanced resume checker results, showing AI match scoring, keyword analysis, and section strength."
        ),

        // ============ 7. USER EXPERIENCE REDESIGN ============
        new Paragraph({ children: [new PageBreak()] }),
        h1("7. User Experience Redesign (Before and After)"),
        body("Following feedback from the course professor about making the platform more captivating and engaging for student users, the interface was redesigned. The original resume checker presented a functional but plain, form-heavy layout. The redesign introduced a visual journey metaphor on the landing page (a winding path with four waypoints and a moving car) that frames the product as a guided route from confused to career-ready, alongside a cleaner, more visual results experience."),
        h2("7.1 Before: Original Resume Checker (Keyword MVP)"),
        body("The original view worked but read as a dense form. It exposed the local keyword-matching mechanics, showed a low demo match score, and offered little visual engagement or sense of progress."),
        ...figure(
          "before_mvp.png", 560,
          "Before Redesign - Original Resume Checker",
          "Screenshot of the original resume checker before the redesign. A form-heavy two-column layout titled Compare your resume to a target role, with resume text and job description input boxes on the left and a 30 percent match score, matched and missing keyword tags, strengths, and recommendations on the right. The interface notes it runs in local demo mode using keyword matching.",
          "Figure 4. Before the redesign. A functional but plain, form-heavy MVP that exposed keyword-matching mechanics."
        ),
        h2("7.2 After: Captivating Journey Landing Page"),
        body("The redesigned landing page leads with a bold headline, a free and no sign up promise, and an interactive journey visual. Each stop (Resume, Career, Roadmap, Interview) is a waypoint on a path, with a clear Start here call to action. The design turns four separate tools into one cohesive, motivating journey and directly answers the feedback to make the experience more captivating."),
        ...figure(
          "after_landing.png", 520,
          "After Redesign - Journey Landing Page",
          "Screenshot of the redesigned landing page. A headline reads From confused to career-ready in 4 steps, with a subhead describing resume checks, career paths, skill roadmaps, and interview practice in one free tool. A winding dotted road connects four labelled waypoints, Resume, Career, Roadmap, Interview, leading to a Career-ready star, with a small car on the path and a Start here button.",
          "Figure 5. After the redesign. A captivating journey landing page that frames the platform as a guided path from confused to career-ready."
        ),
        body("Together with the enhanced results dashboard shown in Figure 3, the redesign shifted the platform from a utilitarian tool into an engaging, student-friendly experience while preserving the intentional brand direction (navy, soft blue accents, and the four-dot pathway logo)."),

        // ============ 8. ENHANCEMENT NARRATIVE ============
        h1("8. Enhancement Narrative"),
        body("The starting point was a working but shallow product. The resume checker matched keywords without understanding whether a candidate had actually demonstrated a skill, and the other three modules existed only as cards on the dashboard. The platform looked complete but delivered real value in just one place."),
        body("The enhancement focused on depth and integration rather than adding surface features. Moving every module onto Claude Opus 4.8 turned static placeholders into genuine tools: the career explorer reasons about a student's major and interests, the skill gap roadmap prioritizes what to learn next, and the interview coach both asks and evaluates. Routing all AI calls through server-side, rate-limited API endpoints kept the API key private and protected the service from abuse, while the local fallbacks preserved reliability."),
        body("The most important change was data handoff. Because the modules now share resume text and extracted skills, a student can analyze a resume, then explore matching career paths, then generate a skill roadmap toward a chosen role, then rehearse interview questions for it, without re-entering information. That connected flow is what separates Pathway AI from the single-purpose paid tools it competes with."),

        // ============ 8b. UPDATED PROJECT MANAGEMENT CHARTS ============
        new Paragraph({ children: [new PageBreak()] }),
        h1("9. Updated Project Management Charts"),
        body("The charts below update the original project management artifacts to reflect status as of July 6, 2026. Vercel deployment, Claude API integration, and all four modules are complete. Testing and final documentation are in progress, and authentication and the database have moved to a parallel, non-critical track with slack."),
        h2("9.1 Gantt Chart (Updated)"),
        ...figure(
          "gantt_updated.png", 630,
          "Updated Gantt Chart",
          "Gantt chart updated to July 6, 2026. Tasks from project brief through the four AI modules are shown completed in green. Testing and QA and final documentation are amber (in progress). Clerk authentication and NeonDB setup are blue planned stretch items later in July. A red dashed line marks today, July 6.",
          "Figure 6. Updated Gantt chart. All build tasks complete (green); testing and documentation in progress (amber); auth and database are planned stretch items (blue)."
        ),
        h2("9.2 Critical Path Analysis (Updated)"),
        ...figure(
          "cpa_updated.png", 630,
          "Updated Critical Path Analysis",
          "Critical path updated to July 6, 2026. A green chain of completed tasks runs from Requirements and Brief through the four AI modules, then to an amber Testing and QA box and a navy Final Docs and Submit milestone. A separate blue box shows Auth and Database as a parallel, non-critical track with slack.",
          "Figure 7. Updated critical path. Only Testing and QA and Final Documentation remain; Auth and Database is now a parallel track with slack."
        ),
        h2("9.3 PERT Chart (Updated)"),
        ...figure(
          "pert_updated.png", 630,
          "Updated PERT Chart",
          "PERT dependency network updated to July 6, 2026. All build nodes (A through G and I, J, K) are green completed. Node H, Auth and Database, is blue planned. Node L, Final Docs and Submission, is the navy final milestone. Arrows show task dependencies converging on the final submission.",
          "Figure 8. Updated PERT chart. Every build node is complete; only node H (Auth and Database) remains planned."
        ),

        // ============ 9. CONCLUSION ============
        h1("10. Conclusion"),
        body("Pathway AI advanced from a single functional module backed by keyword matching to a fully integrated, AI-powered career readiness platform. All four modules now run on Claude Opus 4.8 through a secure, rate-limited backend, share data with one another, accept file uploads, and degrade gracefully through local fallbacks. The platform is deployed publicly and delivers on its central promise: a free, unified alternative to the separate paid tools students would otherwise juggle. The architecture leaves clear room to grow, including deeper personalization, richer history on the dashboard, and additional preparation modules built on the same server-side AI pattern."),
      ],
    },
  ],
});

// ---- Write file ----------------------------------------------------------
Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Pathway_AI_Enhancement_Report.docx");
  fs.writeFileSync(out, buf);
  console.log("Wrote " + out + " (" + Math.round(buf.length / 1024) + " KB)");
});
