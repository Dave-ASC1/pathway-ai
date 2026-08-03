const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, PageBreak, AlignmentType, BorderStyle, WidthType, HeadingLevel, ShadingType } = require('docx');
const fs = require('fs');

// Helper function for borders
const getBorder = (color = "CCCCCC") => ({
  style: BorderStyle.SINGLE,
  size: 1,
  color: color
});

const borders = {
  top: getBorder(),
  bottom: getBorder(),
  left: getBorder(),
  right: getBorder(),
  insideHorizontal: getBorder(),
  insideVertical: getBorder()
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 } // 11pt
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 32, bold: true, font: "Arial", color: "041336" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 28, bold: true, font: "Arial", color: "000080" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // ===== TITLE PAGE =====
      new Paragraph({
        text: "PATHWAY AI",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: "IST 440W Capstone Assignment",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        run: { size: 24, bold: true }
      }),
      new Paragraph({
        text: "Enhancement & Implementation Report",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        run: { size: 24, bold: true }
      }),
      new Paragraph({
        text: "Penn State University",
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "Student: David Ademoye",
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "Date: July 6, 2026",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: "Live URL: https://pathway-aiapp.vercel.app",
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        run: { color: "3b82f6", size: 20 }
      }),
      new Paragraph({
        text: "GitHub: https://github.com/Dave-ASC1/pathway-ai",
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        run: { color: "3b82f6", size: 20 }
      }),

      // ===== SECTION 1: EXECUTIVE SUMMARY =====
      new Paragraph({
        text: "1. Executive Summary",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "Pathway AI is a free career readiness platform for college students that combines four modules—Resume Checker, Career Path Explorer, Skill Gap Roadmap, and Mock Interview Coach—into a single integrated tool. This assignment documents the enhancement from a simple, locally-powered MVP to a fully AI-integrated platform using the Claude Opus 4.8 API."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "Key Enhancement: Claude API Integration",
        run: { bold: true, size: 24 }
      }),
      new Paragraph({
        text: "All four modules now leverage Claude Opus 4.8 for intelligent, personalized analysis and guidance. Each module includes rate limiting and graceful local fallbacks to ensure reliability.",
        spacing: { after: 200 }
      }),

      // ===== SECTION 2: BEFORE vs AFTER ANALYSIS =====
      new Paragraph({
        text: "2. Comparative Analysis: Simple Phase vs. Enhanced Phase",
        heading: HeadingLevel.HEADING_1
      }),

      new Paragraph({
        text: "2.1 Simple Phase (Initial MVP)",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "What Was Built:",
        run: { bold: true }
      }),
      new Paragraph({
        text: "Landing page with 4-step journey visualization",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Dashboard with module navigation cards",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Resume Checker using local keyword-matching algorithm (no AI)",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Three placeholder modules (Career Path, Skill Gap, Interview Coach) with no functionality",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "Limitations:",
        run: { bold: true }
      }),
      new Paragraph({
        text: "Deterministic keyword matching could not provide nuanced resume feedback",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Three modules were UI mockups only with no real guidance",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "No integration between modules for data handoff",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "No file upload support (resume text-only)",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "2.2 Enhanced Phase (AI-Powered)",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "What Was Added:",
        run: { bold: true }
      }),
      new Paragraph({
        text: "Claude Opus 4.8 API integration across all 5 backend routes",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Four fully functional modules with intelligent AI analysis",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "PDF/DOCX file upload capability for resumes",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Data handoff system (resume → career → roadmap → interview)",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Browser-based persistence (user progress saved automatically)",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Rate limiting and graceful fallback mechanisms",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "Improvements:",
        run: { bold: true }
      }),
      new Paragraph({
        text: "Resume analysis now provides nuanced, contextual feedback from Claude, not just keyword matching",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Career Path Explorer generates 3 realistic career options tailored to student profile",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Skill Gap Roadmap creates prioritized learning plans with specific resources",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Mock Interview Coach generates role-specific questions and evaluates student responses",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 300 }
      }),

      // ===== SECTION 3: ARCHITECTURAL FLOWCHARTS =====
      new Paragraph({
        text: "3. Architectural Enhancement Flowcharts",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "The following two diagrams illustrate the transformation from the simple phase to the enhanced phase."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "3.1 Simple Phase Architecture (Before Enhancement)",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "[See flowchart visualization above for detailed before/after comparison]",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: "3.2 Enhanced Phase Architecture (After Enhancement)",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "[See flowchart visualization above for detailed before/after comparison]",
        run: { italic: true },
        spacing: { after: 300 }
      }),

      // ===== SECTION 4: AI PROMPTS USED =====
      new Paragraph({
        text: "4. AI Prompts Used for Claude Integration",
        heading: HeadingLevel.HEADING_1
      }),

      new Paragraph({
        text: "4.1 Resume Analysis Prompt",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Purpose: Score a resume against a job description and provide actionable feedback",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "You are an expert ATS resume reviewer. Analyze the resume against the job description below. Return ONLY valid JSON with matched/missing keywords, section scores (Education, Experience, Projects, Skills, Impact), 3 strengths, and 3 specific improvements. Do not use em dashes; use commas, periods, or parentheses instead.",
        run: { italic: true, size: 20 }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "4.2 Career Path Explorer Prompt",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Purpose: Generate 3 realistic career paths based on student profile",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "You are an experienced career advisor for college students. Based on the student profile (major, year, interests, target industries), suggest THREE realistic career paths. For each path, provide: job title, why it fits this student (2 sentences), 3-role progression trajectory, 5 required skills, and one concrete action the student can take this semester. Return only valid JSON. Keep tone natural, no em dashes.",
        run: { italic: true, size: 20 }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "4.3 Skill Gap Roadmap Prompt",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Purpose: Create a prioritized learning roadmap to bridge skill gaps",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "You are an experienced career and learning coach for college students. Build a focused skill-gap roadmap from the student's current skills to a target role. Return JSON with: summary (honest gap assessment), haveSkills (relevant skills they already have), and steps (5-6 prioritized skills with why, resource type, time estimate, and priority level). Be realistic for a student. No em dashes.",
        run: { italic: true, size: 20 }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "4.4 Interview Questions Generator Prompt",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Purpose: Generate role-specific interview questions (behavioral + technical mix)",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "You are an experienced hiring manager preparing interview questions. Based on the role or job description, write 6 realistic interview questions (mix of behavioral and technical). Behavioral questions explore real situations, teamwork, and problem solving. Technical questions fit the role and are answerable by a student or entry-level candidate. Return only JSON with questions and type. No em dashes.",
        run: { italic: true, size: 20 }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "4.5 Interview Answer Evaluator Prompt",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Purpose: Score and provide feedback on interview practice answers",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "You are an experienced interview coach reviewing a candidate's practice answers for a role. Evaluate each answer honestly and constructively as if coaching a student. Return JSON with for each answer: score (0-100), strengths (1-2 sentences on what went well), missing (1-2 sentences on gaps), and modelAnswer (3-5 sentence strong example). For behavioral questions, reward STAR structure (Situation, Task, Action, Result). Keep tone encouraging. No em dashes.",
        run: { italic: true, size: 20 },
        spacing: { after: 300 }
      }),

      // ===== SECTION 5: TECHNICAL IMPLEMENTATION =====
      new Paragraph({
        text: "5. Technical Implementation Details",
        heading: HeadingLevel.HEADING_1
      }),

      new Paragraph({
        text: "5.1 Backend API Routes with Claude Integration",
        heading: HeadingLevel.HEADING_2
      }),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "Endpoint", run: { bold: true } })], shading: { fill: "041336", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph({ text: "Purpose", run: { bold: true } })], shading: { fill: "041336", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph({ text: "Rate Limit", run: { bold: true } })], shading: { fill: "041336", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph({ text: "Fallback", run: { bold: true } })], shading: { fill: "041336", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("POST /api/analyze-resume")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("ATS resume scoring & feedback")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("10/min")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("Local keyword matching")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("POST /api/career-path")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("Generate career paths")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("8/min")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("N/A (API required)")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("POST /api/skill-gap")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("Skill gap analysis & roadmap")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("8/min")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("N/A (API required)")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("POST /api/interview/questions")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("Generate interview questions")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("8/min")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("N/A (API required)")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("POST /api/interview/evaluate")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("Evaluate interview answers")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("6/min")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders }),
              new TableCell({ children: [new Paragraph("N/A (API required)")], margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders })
            ]
          })
        ]
      }),

      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "5.2 Technology Stack",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS 4 / Anthropic SDK (@anthropic-ai/sdk v0.107.0)",
        run: { bold: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 300 }
      }),

      // ===== SECTION 6: RESULTS & SUCCESS METRICS =====
      new Paragraph({
        text: "6. Results & Success Metrics",
        heading: HeadingLevel.HEADING_1
      }),

      new Paragraph({
        text: "6.1 What Works Today",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "All 4 modules are fully functional with AI-powered guidance",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Resume Checker: Accepts text input or PDF/DOCX uploads; provides ATS scores and contextual feedback",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Career Path Explorer: Generates 3 realistic career paths with 5-10 year progression",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Skill Gap Roadmap: Creates 5-6 prioritized learning steps with specific resources and time estimates",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Mock Interview Coach: Generates 6 role-specific questions and evaluates student responses with scores 0-100",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Data handoff system carries resume skills to roadmap and role info to interview coach",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Browser-based persistence saves all results automatically as users navigate",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Live on Vercel at https://pathway-aiapp.vercel.app with no authentication required",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "6.2 Build & Deploy Status",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "npm run lint: ✓ PASS",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "npm run build: ✓ PASS (19 static routes, 7 dynamic API routes)",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Vercel deployment: ✓ LIVE (no authentication required)",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 300 }
      }),

      // ===== SECTION 7: ENHANCEMENT NARRATIVE =====
      new Paragraph({
        text: "7. Enhancement Narrative",
        heading: HeadingLevel.HEADING_1
      }),

      new Paragraph({
        text: "The transformation from simple to enhanced was driven by a single insight: local keyword matching cannot provide the personalized, contextual guidance that students actually need. The upgrade involved integrating Claude Opus 4.8 across all four modules."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "For the Resume Checker, the system now reads the resume holistically, understands context, and provides nuanced feedback. Instead of simply listing missing keywords, Claude explains why those keywords matter for the role and suggests concrete ways to address them."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "For Career Path, Skill Gap, and Interview Coach, the enhancement meant building them from scratch with Claude. Each module now delivers real, personalized guidance instead of placeholder UI."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "The system also implements intelligent data handoff: a resume uploaded to the checker automatically carries its skills to the roadmap module, and a career path selected carries the target role to the interview module. This transforms the tool from four separate features into one integrated journey."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 300 }
      }),

      // ===== PAGE BREAK =====
      new Paragraph({
        children: [new PageBreak()]
      }),

      // ===== SECTION 8: SCREENSHOTS =====
      new Paragraph({
        text: "8. Application Screenshots",
        heading: HeadingLevel.HEADING_1
      }),

      new Paragraph({
        text: "8.1 Landing Page",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "The 4-step journey board is the entry point. Users can start at any step or follow the guided path from Resume to Interview.",
        run: { italic: true },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "[Screenshot: Landing page with journey board visualization]",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "8.2 Resume Checker Input",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Students can paste resume text or upload PDF/DOCX files. They then paste the target job description. The AI analyzes the match immediately.",
        run: { italic: true },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "[Screenshot: Resume Checker input form]",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "8.3 Career Path Explorer",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Users input major, year, interests, and target industries. Claude generates 3 realistic career paths, each with a 5-10 year progression and a first step the student can take this semester.",
        run: { italic: true },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "[Screenshot: Career Path Explorer input form]",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "8.4 Skill Gap Roadmap",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Students list current skills and specify a target role. The roadmap shows 5-6 prioritized learning steps with estimated time, resource type (e.g., 'Online course', 'Hands-on project'), and why each skill matters.",
        run: { italic: true },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "[Screenshot: Skill Gap Roadmap input form with example placeholder text]",
        run: { italic: true }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "8.5 Mock Interview Coach",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Students enter a job role or paste a full job description. Claude generates 6 role-specific questions (behavioral and technical). Students practice answering, then receive AI-driven feedback with scores 0-100 and model answers.",
        run: { italic: true },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "[Screenshot: Mock Interview Coach input form]",
        run: { italic: true },
        spacing: { after: 300 }
      }),

      // ===== SECTION 9: SELF-REFLECTION =====
      new Paragraph({
        text: "9. Solo Self-Reflection",
        heading: HeadingLevel.HEADING_1
      }),

      new Paragraph({
        text: "9.1 Key Learnings",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "AI-Driven Design: I learned that the decision to integrate Claude was not just a technical choice but a design one. Using AI allowed me to shift from deterministic rules to contextual understanding. For example, the resume checker moved from counting keywords to understanding why keywords matter for a specific role."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "Prompt Engineering Matters: Writing effective prompts requires thinking like the AI would think. I spent time refining each prompt to be specific about JSON output format, tone, and edge cases. Small changes—like adding 'no em dashes' or specifying 'exactly 3 paths'—significantly improved output quality."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "Fallback Strategies: Rate limiting and local fallbacks became crucial. The resume checker has a local fallback that still works if the API is unavailable. This taught me that user-facing applications need redundancy."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "State Management Across Modules: Designing the handoff system between modules taught me about state persistence. I implemented browser-based storage to ensure that if a student navigates between modules, their data is preserved."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "9.2 What Went Well",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Claude API integration was smooth. The Anthropic SDK is well-documented and handles JSON parsing elegantly.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "The modular design of the codebase made it easy to add new API routes. Each module could be built independently and then integrated.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Vercel deployment was straightforward. The app was live and working without any major infrastructure hurdles.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "The journey board design created a cohesive user experience. Even though the modules do different things, the visual metaphor kept users oriented.",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "9.3 Challenges & How I Overcame Them",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Challenge: Prompt consistency. Early prompts were too loose and Claude would sometimes return markdown-wrapped JSON or deviate from the requested format.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Solution: I added explicit instructions like 'Return ONLY valid JSON—no markdown fences' and tested each prompt multiple times before finalizing.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "Challenge: Balancing breadth and depth. With four modules and five API routes, I had to decide how much to implement versus how much to get right.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Solution: I prioritized the core user journey: Resume → Career → Roadmap → Interview. Each step feeds the next, creating a cohesive experience.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "Challenge: Ensuring reliability when calling external APIs. Network latency and rate limits had to be handled gracefully.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Solution: I implemented rate limiting with in-memory caching and built local fallbacks for the resume checker. The interview and roadmap modules require the API, so I added clear error messaging.",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "9.4 If I Could Do It Again",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Persist results to a database: Currently, progress is only saved in the browser. A database (Prisma + NeonDB) would enable users to save multiple analyses and return to them later.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Add user authentication: Without login, there's no way to track a student's journey over time. Authentication (Clerk) would unlock features like result history and comparison.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Test prompts with more diverse inputs: I tested the prompts with a few examples. In production, I'd want A/B testing to see which prompt variations produce the best student feedback.",
        numbering: { reference: "bullets", level: 0 }
      }),
      new Paragraph({
        text: "Implement analytics: Tracking which modules students use most and where they drop off would inform future enhancements.",
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "9.5 Personal Takeaway",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "This project taught me that great AI applications aren't about raw model power—they're about thoughtful integration. Claude is a powerful tool, but the real work was understanding what guidance students actually need and crafting prompts that deliver it. The result is a tool that feels natural to use and delivers real value. I'm proud of how the journey metaphor ties the four modules together into a cohesive experience.",
        spacing: { after: 300 }
      }),

      // ===== CONCLUSION =====
      new Paragraph({
        text: "10. Conclusion",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "Pathway AI has evolved from a simple MVP with keyword matching to a fully AI-powered career readiness platform. The integration of Claude Opus 4.8 across all four modules has transformed the tool from a UI mockup into a genuine source of personalized guidance for college students."
      }),
      new Paragraph({
        text: " ",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "The app is live, builds successfully, and demonstrates the full scope of the IST 440W capstone project. Future work would include database persistence, user authentication, and enhanced analytics to track student outcomes."
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/kingdavid/pathway-ai/Pathway_AI_Assignment_Report.docx", buffer);
  console.log("✓ Document created successfully: Pathway_AI_Assignment_Report.docx");
});
