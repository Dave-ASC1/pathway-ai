// Ready-made student profiles that fill every module with one click.
//
// Why these exist: anyone evaluating the app (a TA, a classmate, a recruiter)
// should be able to see real output without first hunting down a job posting
// and writing a resume. Each example carries a matching profile for all four
// modules, so a reviewer can start on any page and get coherent results.
//
// The set deliberately spans the range of real students. Jordan is genuinely
// competitive for the role. Alex is a sophomore with no relevant experience at
// all, which is the more common starting point and the case where the feedback
// actually matters. Priya sits in between. Loading a random one keeps repeat
// demos from looking canned.

export type Example = {
  id: string;
  /** Shown in the UI after loading, so a reviewer knows which profile they got. */
  label: string;
  strength: "strong" | "developing" | "early";
  resumeChecker: { resume: string; jobDescription: string };
  careerPath: {
    major: string;
    year: string;
    interests: string;
    targetIndustries: string;
  };
  skillGap: { currentSkills: string; targetRole: string };
  interview: {
    role: string;
    /**
     * Reusable STAR stories from this person's background, assigned to whatever
     * questions come back (cycling if there are more questions than answers).
     * Real candidates rotate a handful of core stories across an interview, so
     * this stays honest, and the coaching still lands because each answer is
     * scored on how well it actually addresses the question asked.
     */
    sampleAnswers: string[];
  };
};

// ── Job descriptions ───────────────────────────────────────────────────────
// Written to match how postings on Indeed, LinkedIn, and company boards
// actually read: a req ID and pay band up top, distinct responsibility bullets
// (real postings state each duty once), required vs preferred qualifications
// split apart, then benefits and an equal opportunity statement.

const itOperationsJob = `IT Operations Analyst I
Keystone Health Partners | Harrisburg, PA (Hybrid, 3 days onsite)
Full-time | Req ID: KHP-2026-0431 | $58,000 to $71,000 per year

ABOUT THE ROLE
Keystone Health Partners operates 40 outpatient clinics across central Pennsylvania. Our IT Operations team keeps the clinical and business systems that 1,200 staff rely on available and secure. We are hiring an IT Operations Analyst I to join the infrastructure support group. This is an early career position reporting to the Manager of IT Operations, and it is a strong fit for someone starting out who wants exposure to enterprise systems in a regulated environment.

WHAT YOU WILL DO
- Serve as the second level escalation point for incidents routed from the service desk, taking ownership through to resolution and root cause.
- Monitor server and network health using our observability tooling, and respond to alerts within documented service level targets.
- Administer Active Directory user accounts, security groups, and group policy for onboarding, role changes, and offboarding.
- Support Microsoft 365 and Intune device management across Windows and macOS endpoints.
- Perform scheduled backup verification and participate in quarterly disaster recovery testing.
- Write and maintain runbooks and knowledge base articles so recurring issues can be resolved at the service desk level.
- Support patch management cycles and coordinate maintenance windows through our change management process.
- Contribute to HIPAA compliance evidence gathering during internal and external audits.
- Participate in an on call rotation approximately one week in every six.

REQUIRED QUALIFICATIONS
- Bachelor's degree in Information Technology, Information Sciences, Management Information Systems, Computer Science, or equivalent practical experience.
- 0 to 2 years of experience in a technical support, help desk, or IT operations role, including internships and relevant academic project work.
- Working knowledge of Windows Server and Active Directory concepts.
- Familiarity with ticketing systems such as ServiceNow, Jira Service Management, or Zendesk.
- Clear written communication, since much of this role is documentation other people depend on.
- Ability to pass a background check and maintain HIPAA training requirements.

PREFERRED QUALIFICATIONS
- CompTIA A+, Network+, or ITIL 4 Foundation certification.
- Exposure to Azure or another major cloud platform.
- Scripting experience in PowerShell or Python for routine task automation.
- Prior experience in healthcare, financial services, or another regulated industry.

BENEFITS
Medical, dental, and vision coverage effective day one. 401(k) with 4 percent match. 18 days paid time off plus 9 holidays. Tuition assistance up to $5,250 per year and paid certification exam vouchers.

Keystone Health Partners is an equal opportunity employer. All qualified applicants will receive consideration without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, disability, or protected veteran status.`;

const dataAnalystJob = `Data Analyst, Customer Insights
Northbridge Retail Group | Columbus, OH (Onsite)
Full-time, Entry Level | Req ID: NRG-4127 | $62,000 to $74,000 per year

THE OPPORTUNITY
Northbridge Retail Group runs 310 stores and a growing ecommerce channel. The Customer Insights team turns transaction, loyalty, and web behavior data into decisions the merchandising and marketing teams act on every week. You will join a team of six analysts and work directly with business stakeholders who are not technical, so translation matters as much as analysis.

RESPONSIBILITIES
- Build and maintain recurring reporting in Tableau for merchandising, marketing, and store operations partners.
- Write SQL queries against our Snowflake warehouse to answer ad hoc business questions, usually with a same week turnaround.
- Investigate changes in key metrics such as basket size, repeat purchase rate, and promotional lift, and explain what drove them.
- Partner with the data engineering team to validate new data sources before they reach reporting.
- Present findings to non technical stakeholders in clear written summaries and short readouts.
- Document data definitions so metrics stay consistent across teams.
- Support A/B test analysis for ecommerce merchandising experiments.

MINIMUM QUALIFICATIONS
- Bachelor's degree in a quantitative or business field such as Statistics, Economics, Business Analytics, Information Systems, or Mathematics.
- Demonstrated SQL ability, including joins, aggregations, and window functions. This will be assessed in a take home exercise.
- Experience building visualizations in Tableau, Power BI, or Looker, including coursework and personal projects.
- Strong Excel skills including pivot tables and lookup functions.
- Evidence of communicating analytical results to a non technical audience.

PREFERRED QUALIFICATIONS
- Python or R for data manipulation (pandas, dplyr).
- Familiarity with dbt, Snowflake, or another cloud warehouse.
- Retail, ecommerce, or consumer packaged goods exposure.
- Coursework or projects involving experimental design and statistical testing.

WHAT WE OFFER
Comprehensive medical, dental, and vision. 401(k) with company contribution. Hybrid flexibility after the first 90 days. Annual learning stipend of $1,500. Employee merchandise discount.

Northbridge Retail Group is proud to be an equal opportunity workplace and an affirmative action employer.`;

const softwareEngineerJob = `Software Engineer I (New Grad)
Vantage Logistics Technologies | Pittsburgh, PA (Hybrid)
Full-time | Req ID: VLT-ENG-2026-88 | $85,000 to $102,000 per year plus equity

ABOUT US
Vantage builds the routing and freight visibility platform used by mid market carriers moving roughly 900,000 shipments a year. Our engineering organization is 45 people. New engineers join a product team with a dedicated mentor and ship to production within their first three weeks.

WHAT YOU WILL DO
- Build and maintain features across our web application and the services behind it.
- Write unit and integration tests, and treat test coverage as part of the work rather than a follow up task.
- Participate in code review, both giving and receiving feedback.
- Debug production issues alongside your team, including occasional participation in the support rotation.
- Work with product managers and designers to break large problems into shippable increments.
- Contribute to technical design discussions and write short design documents for non trivial changes.

MINIMUM QUALIFICATIONS
- Bachelor's degree in Computer Science, Software Engineering, or a related technical field, or equivalent practical experience.
- Proficiency in at least one modern programming language such as JavaScript, TypeScript, Python, Java, or Go.
- Understanding of data structures, algorithms, and relational database fundamentals.
- Experience with Git in a collaborative setting, including branching and pull requests.
- Portfolio, internship, or substantial coursework demonstrating you have built and shipped something end to end.

PREFERRED QUALIFICATIONS
- Experience with React, Node.js, or a comparable modern web stack.
- Exposure to cloud infrastructure (AWS, GCP, or Azure) and containerization with Docker.
- Familiarity with CI/CD pipelines.
- Open source contributions or a personal project with real users.
- Internship experience at a software company.

BENEFITS
Medical, dental, vision, and life insurance. Unlimited paid time off with a 15 day minimum we actually enforce. $2,000 annual professional development budget. Hybrid schedule of 2 days onsite. Paid parental leave.

Vantage Logistics Technologies is an equal opportunity employer and does not discriminate on the basis of any protected characteristic.`;

// ── Resumes ────────────────────────────────────────────────────────────────

const strongResume = `JORDAN MILES
Harrisburg, PA | jordan.miles@psu.edu | (717) 555-0148
linkedin.com/in/jordanmiles | github.com/jmiles-ops

EDUCATION
The Pennsylvania State University, University Park, PA
B.S. Information Sciences and Technology, Cybersecurity option
Expected May 2027 | GPA: 3.61/4.00
Relevant coursework: Network Administration, Systems Administration, IT Service Management, Database Management, Information Security Management

CERTIFICATIONS
ITIL 4 Foundation (March 2026)
CompTIA A+ (August 2025)
Microsoft Certified: Azure Fundamentals AZ-900 (January 2025)

EXPERIENCE

IT Operations Intern
Keystone Health Systems, Harrisburg, PA | May 2025 to August 2025
- Owned 40 to 55 ServiceNow tickets per week as second level escalation, closing 94 percent within the same day service target.
- Administered Active Directory accounts and security groups for 60 onboarding and offboarding events during a clinic acquisition.
- Investigated recurring VPN disconnects affecting 30 remote clinical staff, traced the cause to a group policy conflict, and documented the fix in a runbook the service desk now uses.
- Wrote 12 knowledge base articles that reduced escalations for password and MFA issues by roughly a third over the summer.
- Verified nightly backup jobs and flagged two silent failures that had gone unnoticed for 11 days.

IT Service Desk Assistant
Penn State IT Service Desk, University Park, PA | September 2024 to present
- Resolve hardware, software, and account issues for students and faculty, averaging 25 contacts per shift.
- Trained 4 new student technicians on ticket triage and escalation criteria.
- Maintain imaging and deployment for a 90 machine lab environment.

PROJECTS

Home Lab: Active Directory and Hybrid Identity
- Built a Windows Server 2022 domain in Hyper-V with 3 domain controllers, DNS, DHCP, and group policy across simulated sites.
- Configured Azure AD Connect for hybrid identity sync and tested conditional access policies.

PowerShell Onboarding Automation
- Wrote a PowerShell script that creates an AD user, assigns group membership, provisions a Microsoft 365 license, and emails setup instructions, reducing a 15 minute manual process to under 2 minutes.
- Published to GitHub with documentation and error handling for duplicate accounts.

TECHNICAL SKILLS
Systems: Windows Server 2019/2022, Active Directory, Group Policy, Microsoft 365, Intune, Hyper-V
Cloud: Azure (AZ-900), Azure AD Connect, basic ARM templates
Networking: TCP/IP, DNS, DHCP, VPN, VLAN fundamentals
Scripting: PowerShell, Python (intermediate), Bash (basic)
Tools: ServiceNow, Jira Service Management, Veeam, Wireshark
Practices: ITIL incident and change management, documentation, HIPAA awareness training`;

const earlyResume = `Alex Rivera
State College, PA
arivera24@psu.edu | (814) 555-0193

EDUCATION
The Pennsylvania State University
Bachelor of Science, Business Administration
Expected graduation May 2029
GPA: 3.14

WORK EXPERIENCE

Sales Associate
Target, State College, PA
June 2025 to present
- Help customers locate products and answer questions about promotions
- Operate register and process returns and exchanges
- Restock shelves and organize backroom inventory
- Trained two new team members on register procedures

Barista
Campus Coffee Co, State College, PA
August 2024 to May 2025
- Prepared drinks and food orders during morning rush
- Handled cash and card transactions
- Kept work areas clean and stocked

ACTIVITIES
Member, Business Student Association (2024 to present)
Intramural soccer

SKILLS
Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Google Workspace, customer service, teamwork, time management, dependable, quick learner

REFERENCES
Available upon request`;

const developingResume = `PRIYA NATARAJAN
Pittsburgh, PA | pnatarajan@psu.edu | (412) 555-0276 | github.com/priya-builds

EDUCATION
The Pennsylvania State University, University Park, PA
B.S. Computer Science, Minor in Mathematics
Expected May 2028 | GPA: 3.42/4.00
Coursework: Data Structures and Algorithms, Object Oriented Programming, Database Systems, Computer Organization, Discrete Mathematics
Currently enrolled: Software Engineering, Web Application Development

EXPERIENCE

Undergraduate Teaching Assistant, CMPSC 121 Introduction to Programming
Penn State Department of Computer Science | January 2026 to present
- Lead two weekly lab sections of 24 students each on Python fundamentals.
- Hold 4 office hours per week and grade weekly assignments for 48 students.
- Rewrote the lab handout on recursion after noticing the same misconception in about half the section.

Front Desk Assistant
Penn State Recreation Services | September 2024 to December 2025
- Managed check in for 400 plus daily visitors and handled membership questions.
- Reconciled the daily cash drawer and reported discrepancies.

PROJECTS

CampusSwap, textbook exchange web app
- Built a full stack marketplace with React, Node.js, Express, and PostgreSQL where students list and search used textbooks by course number.
- Implemented user authentication with hashed passwords and session handling.
- Deployed to Render with a live demo. 40 students from my dorm signed up during a two week trial.

Transit Delay Visualizer
- Python and pandas project analyzing two years of Port Authority bus arrival data to find the routes with the least reliable morning service.
- Produced matplotlib charts and a written summary of findings.

Wordle Solver
- Command line solver in Java using entropy based guess selection. Solves in 3.6 guesses on average across the full answer list.

TECHNICAL SKILLS
Languages: Python, Java, JavaScript, SQL, HTML/CSS
Frameworks and libraries: React, Node.js, Express, pandas, matplotlib
Tools: Git, GitHub, PostgreSQL, VS Code, Postman
Concepts: data structures, algorithms, relational database design, REST APIs

ACTIVITIES
Member, Women in Computer Science
Participant, HackPSU 2025 (built a campus dining hall crowding tracker in 24 hours)`;

// ── The examples ───────────────────────────────────────────────────────────

export const examples: Example[] = [
  {
    id: "jordan",
    label: "Jordan Miles, a senior with an IT internship and certifications",
    strength: "strong",
    resumeChecker: { resume: strongResume, jobDescription: itOperationsJob },
    careerPath: {
      major: "Information Sciences and Technology, Cybersecurity option",
      year: "Senior",
      interests:
        "I like figuring out why systems break and then making sure they cannot break the same way twice. I run a home lab for Windows Server and Azure, and I am the person friends call when their laptop stops working. I am good at writing documentation that people actually use. I would rather go deep on infrastructure and security than build front end features.",
      targetIndustries: "healthcare, financial services, government contracting",
    },
    skillGap: {
      currentSkills:
        "Windows Server 2022, Active Directory, group policy, Microsoft 365, Intune, PowerShell scripting, ServiceNow, basic Azure (AZ-900 certified), TCP/IP and DNS fundamentals, ITIL 4 Foundation, backup verification with Veeam, writing runbooks and knowledge base articles",
      targetRole: "Cloud Security Engineer",
    },
    interview: {
      role: "IT Operations Analyst I at a healthcare provider",
      sampleAnswers: [
        "During my internship at Keystone Health Systems, about 30 remote clinical staff kept getting dropped from the VPN, usually mid afternoon. The service desk had been resetting their connections one at a time for weeks. I pulled the connection logs and noticed the drops clustered around users who had recently moved departments. That pointed me at group policy, and I found a conflicting policy applying two different VPN timeout values depending on which OU the account landed in. I worked with my manager to consolidate the policy, then wrote a runbook so the service desk could recognize the pattern if it came back. The tickets stopped, and the runbook is still in use.",
        "I would start by confirming scope, because how I respond depends a lot on whether it is one user or the whole clinic. I check monitoring first to see if anything is alerting, then I look at recent changes, since in my experience most sudden breakage traces back to something that changed. If it is widespread I escalate early rather than sitting on it, because an hour of me investigating alone is worse for patients than a five minute interruption to a senior engineer. Then I document what I found while it is fresh.",
        "My strongest area is documentation, which sounds unglamorous but it is the thing I get thanked for most. I wrote 12 knowledge base articles over the summer and password and MFA escalations dropped by about a third. My weaker area is depth on networking. I know TCP/IP, DNS, and DHCP well enough to troubleshoot, but I have not worked much with routing or firewall rules at an enterprise level. I am studying for Network+ specifically to close that gap.",
        "I was verifying nightly backup jobs, which was mostly a checkbox task, and I noticed two jobs reporting success but writing suspiciously small files. They had been failing silently for 11 days. Nobody had asked me to look closer than the status column. I flagged it to my manager, we found a permissions change had broken the write path, and we restored the schedule. The lesson I took was that a green status is not the same thing as a verified backup, and I have not trusted a dashboard at face value since.",
        "I am drawn to healthcare specifically because the stakes make the work feel worth doing carefully. When a system goes down at a clinic, someone's appointment gets delayed. I also like that regulated environments force good habits around change management and documentation, which are things I am already strong at. Longer term I want to move toward cloud security, and an operations role in a HIPAA environment is a genuinely good place to learn what secure actually means in practice rather than in a textbook.",
        "In my home lab I built a Windows Server 2022 domain with three domain controllers, DNS, DHCP, and group policy across simulated sites, then connected it to Azure AD with Azure AD Connect to test conditional access. I broke it a lot. Getting hybrid identity sync working taught me more about how authentication actually flows than any course did. I also wrote a PowerShell script that handles the whole onboarding sequence, creating the account, assigning groups, provisioning a license, and emailing setup instructions. It took a 15 minute manual process down to under two minutes.",
      ],
    },
  },
  {
    id: "alex",
    label: "Alex Rivera, a sophomore with no experience in the field yet",
    strength: "early",
    resumeChecker: { resume: earlyResume, jobDescription: dataAnalystJob },
    careerPath: {
      major: "Business Administration",
      year: "Sophomore",
      interests:
        "Honestly I am not sure yet. I am decent with numbers and I liked my statistics class more than I expected. I work retail right now and I am good with people. I do not want to be in sales forever. I have heard data analyst roles pay well but I do not know what they actually do day to day or whether I am too far behind to catch up.",
      targetIndustries: "",
    },
    skillGap: {
      currentSkills:
        "Microsoft Excel (pivot tables and basic formulas), PowerPoint, Google Sheets, customer service, training new employees, one semester of introductory statistics. No programming experience and no internships yet.",
      targetRole: "Data Analyst",
    },
    interview: {
      role: "Data Analyst, Customer Insights (entry level)",
      sampleAnswers: [
        "I think I'm a hard worker and I learn things pretty fast. At my job I picked up the register system in like a day when it usually takes people a week. I'm also really good with people which I think matters even in a data job because you have to explain stuff to people who don't get it.",
        "One time at Target it got really busy during a holiday weekend and we were short staffed. I just stayed calm and kept helping customers and we got through it. My manager said I did a good job. I think that shows I can handle pressure which would probably help in an analyst role too when there are deadlines.",
        "Honestly I don't have a lot of experience with that yet. I've used Excel in my stats class and I know how to do pivot tables. I haven't used SQL but I'm willing to learn it and I feel like I could pick it up pretty quickly based on how fast I learned other things.",
        "I want to get into data because I like numbers and I heard it's a growing field with good pay. My statistics class was more interesting than I expected. I know I'm coming from business and not computer science but I think that could be an advantage because I understand the business side.",
        "I would ask my manager for help or look it up online. I'm not the type to just sit there stuck. At my job if I don't know something about a product I go find someone who does instead of guessing, because giving a customer wrong information is worse than saying you'll check.",
        "In five years I'd want to be established somewhere and maybe moving up into a senior role. I don't have a super specific plan yet honestly, I'm still figuring out what part of this I like best. I just know I want to be doing something more analytical than retail.",
      ],
    },
  },
  {
    id: "priya",
    label: "Priya Natarajan, a junior with projects but no internship yet",
    strength: "developing",
    resumeChecker: { resume: developingResume, jobDescription: softwareEngineerJob },
    careerPath: {
      major: "Computer Science",
      year: "Junior",
      interests:
        "I like building things people actually use. My textbook exchange app got 40 real signups and that felt better than any grade. I enjoy the debugging part more than the design part. I am a teaching assistant and I like explaining things. I am worried that I have projects but no internship, and I do not know if that rules me out for new grad roles.",
      targetIndustries: "software, education technology, transportation",
    },
    skillGap: {
      currentSkills:
        "Python, Java, JavaScript, SQL, React, Node.js, Express, PostgreSQL, Git and GitHub, REST API design, data structures and algorithms, pandas and matplotlib, deployed one full stack app to production, teaching assistant experience",
      targetRole: "Software Engineer I (new grad)",
    },
    interview: {
      role: "Software Engineer I (new grad) at a logistics software company",
      sampleAnswers: [
        "I built CampusSwap, a textbook exchange app, because buying textbooks through the bookstore was costing people in my dorm hundreds of dollars a semester. It is React and Node with a PostgreSQL database, and students list books by course number so search actually matches what they need. The hard part was authentication. I initially stored passwords with a weak hash because it was what a tutorial showed, then read up and moved to bcrypt with proper salting before I let anyone else use it. About 40 students signed up during a two week trial, and watching real people hit edge cases I never considered taught me more than the building did.",
        "I would reproduce it first, because I have wasted time before fixing something I had misunderstood. Then I would narrow down where it breaks, usually by checking logs and adding assertions rather than guessing. If it is in code I did not write, I read the surrounding code and the git history to understand why it is shaped that way before changing it. And if I am stuck for more than 30 minutes or so I ask, because on a team the cost of me being quietly blocked is higher than the cost of the question.",
        "As a teaching assistant I noticed roughly half my lab section had the same misconception about recursion, that the base case runs last. The handout technically covered it but buried it in a paragraph. I rewrote that section to walk through the call stack frame by frame with a diagram. The next quiz on recursion went noticeably better for my sections. I like that kind of problem, where the fix is explaining something more clearly rather than working harder.",
        "My honest weakness is that I have not worked on a codebase with other people in a professional setting. My projects are mine, so I have never had to negotiate a design decision with someone who disagreed, or inherit code with constraints I did not choose. I have done code review as a teaching assistant, but that is different. It is the main reason I want this role rather than another solo project.",
        "For the transit project I had two years of bus arrival data and a vague question about which routes were unreliable. I used pandas to join the scheduled and actual arrival times and computed delay distributions per route per hour. The interesting finding was that the average delay was misleading, since a couple of routes had decent averages but terrible tail behavior, meaning they were usually fine and occasionally 25 minutes late. That is worse for a commuter than being consistently 5 minutes late. It made me careful about reporting means without spread.",
        "Testing is the part I got wrong for a long time. On early projects I wrote tests after the fact, if at all, and they mostly asserted things I already knew worked. On CampusSwap I started writing tests for the search and auth paths as I built them, and they caught a real bug where a course number with a trailing space returned nothing. I would not call myself disciplined about it yet, but I now think of tests as part of finishing a feature rather than a separate chore.",
      ],
    },
  },
];

/** Look up a single example by id. */
export function getExample(id: string): Example | undefined {
  return examples.find((e) => e.id === id);
}

/**
 * Pick an example at random, skipping `currentId` so clicking the button twice
 * in a row always shows something different.
 */
export function pickExample(currentId?: string): Example {
  const pool = currentId ? examples.filter((e) => e.id !== currentId) : examples;
  const from = pool.length > 0 ? pool : examples;
  return from[Math.floor(Math.random() * from.length)];
}
