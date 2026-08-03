# Pathway AI — Solo Self-Reflection
## IST 440W Capstone Project

**Student:** David Ademoye  
**Project:** Pathway AI  
**Date:** July 6, 2026  
**Duration:** May 20 – July 6 (6.5 weeks of active development)

---

## 1. The Journey: From Vision to Implementation

When I started this capstone project, the goal was clear: build a free career readiness tool for college students. But the question that drove my work was more nuanced: How can I make guidance feel personal and actionable rather than generic or cookie-cutter?

Initially, the Resume Checker used local keyword matching. It worked—the logic was sound—but it felt hollow. It could tell a student "You're missing the word 'Python' from your resume," but it couldn't explain why Python mattered for their specific role, or suggest how they might truthfully add it.

That's when I decided to integrate Claude AI. This decision transformed the project from a well-engineered UI wrapper around simple algorithms into a genuinely useful tool.

---

## 2. What I Learned (And What Surprised Me)

### 2.1 Prompt Engineering is a Craft

I expected Claude to "just work" once I fed it a prompt. What I learned is that effective prompts require thinking like the model would think. Early prompts were too loose. Claude would sometimes:
- Wrap JSON in markdown code fences even though I asked for raw JSON
- Return 2 career paths instead of exactly 3
- Use em dashes in feedback (which can look AI-written and cheap)

The fix wasn't magical. It was iterative refinement: being specific about format, adding constraints, and testing with diverse inputs. Small changes made huge differences. For example, adding "Return ONLY valid JSON—no markdown fences, no explanation" changed the output reliability from ~80% to ~99%.

### 2.2 The Value of Fallback Strategies

Building the local fallback for the resume checker taught me something important: production-ready systems need redundancy. If the Claude API is unavailable or rate-limited, the app doesn't break—it falls back to the local keyword matching algorithm. This isn't a perfect solution, but it keeps the app usable.

This philosophy extended to rate limiting. I added per-endpoint rate limits (10 requests/min for resume analysis, 8/min for others) to protect the API and ensure fair usage. But the app doesn't hard-fail when limits are hit; it queues or informs the user gracefully.

### 2.3 State Persistence Across Modules Matters

The "journey board" metaphor only works if data flows between steps. I implemented browser-based storage so that:
- A resume uploaded to the checker carries its parsed skills to the skill gap module
- A career path selected carries the target role to the interview coach
- Interview answers and their scores are saved for the user to review

This transformed four separate tools into one cohesive flow. Users don't have to re-enter information; it flows naturally from one module to the next.

### 2.4 Design Choices Have Outsized Impact

The journey board visual—the four dots connected by a path, with the ability to jump to any step—was a design choice, but it fundamentally changed how students interact with the tool. Instead of feeling like four separate apps, it feels like one journey with four waypoints. This is a lesson I'll carry: good design makes complex systems feel simple.

---

## 3. What Went Well

### 3.1 The Anthropic SDK is Excellent
The `@anthropic-ai/sdk` library is clean, well-documented, and handles edge cases gracefully. Integrating Claude into the API routes was straightforward. The library abstracts away HTTP details and lets me focus on prompt design and response parsing.

### 3.2 Modular Architecture Paid Off
Each module (Resume Checker, Career Path, Skill Gap, Interview Coach) is independent. I could build them in parallel, test them separately, then integrate them. The modular structure also made it easy to add new API routes without affecting existing ones.

### 3.3 Vercel Deployment Was Seamless
Deployment to Vercel required minimal setup. The app was live within minutes. No struggling with infrastructure, no surprise deployment issues. This freed me to focus on features rather than DevOps.

### 3.4 The Project Scope Was Achievable
Six weeks to build four interconnected AI-powered modules and get them live is ambitious but achievable. I didn't try to build authentication, databases, or complex analytics. I focused on the core value: helping students get real career guidance.

---

## 4. What Was Challenging (And How I Overcame It)

### Challenge #1: Balancing Breadth vs. Depth

**The Problem:**  
With four modules and five API routes, I had to constantly decide: Should I implement more features, or should I get the existing features right?

**How I Overcame It:**  
I prioritized the critical path: the user's journey from Resume → Career → Roadmap → Interview. Each step had to work well because it sets up the next step. Features outside this path (like a "Saved Results" page or analytics) were nice-to-haves that I built only after the core flow was solid.

### Challenge #2: Prompt Consistency

**The Problem:**  
Claude sometimes returned inconsistent output. Different runs of the same prompt with different inputs would produce dramatically different quality. For example, the career path module sometimes generated only 2 paths instead of 3, or included aspirational rather than realistic paths.

**How I Overcame It:**  
I created a "prompt refinement loop": write a prompt, test it 5-10 times with diverse inputs, identify failure modes, and iterate. I also added explicit constraints like "Exactly 3 paths, ordered from most realistic to most ambitious" and validation logic to ensure the response had the right structure before returning it to the user.

### Challenge #3: Handling API Failures Gracefully

**The Problem:**  
What happens if the Claude API times out? Or the student's network disconnects? Or the API hits a rate limit? The app can't just show an error and crash.

**How I Overcame It:**  
For the resume checker, I built a local fallback. For other modules, I added clear error messages and rate limiting. I also implemented in-memory request tracking to enforce per-endpoint limits without requiring a database.

### Challenge #4: Designing for Diverse Student Backgrounds

**The Problem:**  
A computer science major's career path looks nothing like a business major's. But the prompt needed to work for both. Similarly, a student with 10 internships has different skill gaps than a freshman with none.

**How I Overcame It:**  
I kept the prompts flexible but detailed. For example, the career path prompt says "Be realistic and achievable for a student with this background—not aspirational fantasy." This cues Claude to contextualize its suggestions. I also tested with diverse inputs: a CS major interested in machine learning, a business major interested in product management, a non-traditional student changing careers.

---

## 5. If I Could Do It Again

### 5.1 Persist to a Database
Right now, results are saved only in the browser. If a student clears their cache or uses a different device, their work is gone. A production system would use Prisma + NeonDB to persist results. This would unlock features like result history, comparison between attempts, and long-term tracking.

### 5.2 Add User Authentication
Clerk authentication would enable:
- Per-user result history
- Comparing old vs. new resume scores
- Sharing results with mentors
- Privacy and data ownership

Without authentication, the tool is powerful for a single session, but doesn't support long-term student development.

### 5.3 A/B Test Prompts
I tested prompts with a small set of examples. In production, I'd want to:
- Run the same input through multiple prompt variants
- Have real students rate which feedback is most useful
- Iterate based on user feedback rather than my intuition

### 5.4 Add Analytics
Knowing which modules students use most, where they drop off, how many return, and what they say in interviews would inform the next iteration. But I prioritized user experience over metrics.

### 5.5 Build a Mobile-First UI
The app works on mobile, but I optimized for desktop. A mobile-first redesign would make the journey feel more natural on the small screen where many students browse.

---

## 6. The Hardest Part (And What I'm Proud Of)

### The Hardest Part
The hardest part wasn't the code—it was deciding what to build. With so many possible features (authentication, databases, payments, analytics), the challenge was staying focused on the core: helping a student get real guidance in one session.

There were moments of doubt: "Should I add Clerk authentication? Should I add a database? Should I build a dashboard that shows results over time?" Each of these would have been good features. But each would have taken 1-2 weeks, and I had six weeks total. I had to make peace with the MVP.

### What I'm Proud Of
I'm proud that the tool actually works and feels natural to use. When a student uploads their resume, they get real feedback within seconds. When they explore a career path, Claude understands their background and gives personalized suggestions. When they practice for an interview, they get honest coaching.

I'm also proud of the integration. The modules don't feel like four separate tools glued together. The journey metaphor ties them together. Passing data between modules so the student doesn't have to re-enter information—that's a small UX detail, but it makes the tool feel thoughtful.

---

## 7. Personal Growth

### What I Learned About Myself
This project taught me that I'm drawn to user-facing problems. I cared deeply about whether the guidance felt genuine or generic. I spent more time on the prompts and UX than on the backend infrastructure because that's where the student experiences value.

I also learned that I can scope-manage. I resisted the urge to add every feature. I stayed focused on the core journey. This discipline kept the project on track and shipped.

### What I'd Do Differently Next Time
I would spend more time understanding the user before building. I talked to a few students about what they needed, but I'd want to do more user research. What do students actually ask when they prepare for interviews? What frustrates them about resume tools? This would have informed prompt design and feature prioritization.

---

## 8. The Bigger Picture

This capstone asked: "Can you build a real product in six weeks?" The answer is yes—if you scope ruthlessly and focus on core user value.

Pathway AI started as an idea on a whiteboard. It's now live at `pathway-aiapp.vercel.app`, open to anyone, and delivering real career guidance powered by Claude. That feels good.

The tool isn't perfect. Future work will add persistence, authentication, analytics, and more modules. But the foundation is solid. The architecture is modular. The prompts are refined. The UX is intentional.

Most importantly, the tool delivers on its promise: it takes students from confused to career-ready in a structured, AI-powered way.

---

## 9. Final Thoughts

If I had to summarize this project in one sentence: **I learned that the magic of AI isn't in the model—it's in thoughtful integration and sharp prompt design.**

Claude is powerful, but it's a tool. The real work was understanding what students need, crafting prompts that deliver it, and building an experience that feels natural. The result is a tool I'm genuinely proud of.

To any student reading this who wants to build with AI: Start with a problem you care about. Build a basic version. Get feedback. Iterate. Don't get lost in optimizing things that don't matter. Focus on user value. The rest follows.

---

## Recording Notes for Self-Reflection

When recording your self-reflection, consider touching on these points:

1. **Opening (30 seconds):** "Hi, I'm David Ademoye, and I built Pathway AI, a free career readiness tool for college students. This is my capstone reflection on what I learned, what was hard, and how I approached building with AI."

2. **The Transformation (1-2 minutes):** Describe the shift from keyword matching to Claude AI. Explain why this mattered—how it changed the tool from generic to personalized.

3. **Key Learnings (2-3 minutes):** Talk about prompt engineering, fallback strategies, and state management. Pick 2-3 concepts and explain why they matter.

4. **Challenges (1-2 minutes):** Describe 1-2 tough problems and how you solved them. Be honest about what didn't work on the first try.

5. **Pride & Growth (1 minute):** What are you most proud of? What surprised you about yourself as a builder?

6. **Future Vision (30 seconds):** What would you add next? What are the limits of the current version?

7. **Closing (30 seconds):** "Building Pathway AI taught me that great products come from user empathy and iterative refinement. I'm excited to see how students use it and how it evolves."

**Total time:** 7-10 minutes

---

End of Self-Reflection
