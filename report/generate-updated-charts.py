#!/usr/bin/env python3
"""
Pathway AI - Updated Project Management Charts (as of July 6, 2026)
------------------------------------------------------------------
Regenerates the Gantt chart, Critical Path Analysis, and PERT chart to
reflect current project status:
  - Vercel deployment, Claude API integration, and ALL FOUR modules: COMPLETE
  - Clerk authentication + NeonDB: still PLANNED (moved off the critical path)
  - Testing & QA and Final Documentation: IN PROGRESS

Matches the visual style of the original charts (green = completed,
amber = in progress, blue = planned, navy = final milestone, red = today line).

Usage:
  pip install matplotlib
  python3 generate-updated-charts.py
Outputs: gantt_updated.png, cpa_updated.png, pert_updated.png
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from matplotlib.lines import Line2D
import matplotlib.dates as mdates
from datetime import date

# ---- Palette (matches original) -----------------------------------------
GREEN = "#2ecc71"   # completed
AMBER = "#f0a020"   # in progress
BLUE  = "#4a86f7"   # planned
NAVY  = "#0a1a66"   # final milestone
NAVY_TITLE = "#0f1b4c"
RED   = "#e23b3b"
INK   = "#1f2a44"
PANEL = "#f7f9fc"

TODAY = date(2026, 7, 6)
START = date(2026, 5, 20)
END   = date(2026, 8, 12)

plt.rcParams["font.family"] = "DejaVu Sans"

# =========================================================================
# 1. GANTT CHART
# =========================================================================
def gantt():
    # (label, start, end, status)  status: done / wip / plan
    tasks = [
        ("Project Brief & Literature Review", date(2026,5,20), date(2026,6,3),  "done"),
        ("Midterm Presentation & Paper Demo", date(2026,5,27), date(2026,6,17), "done"),
        ("Prompt Log & Response to Reviewers",date(2026,6,3),  date(2026,6,17), "done"),
        ("Landing Page Design & Branding",    date(2026,6,10), date(2026,6,20), "done"),
        ("Dashboard Route",                   date(2026,6,17), date(2026,6,24), "done"),
        ("Resume Checker MVP",                date(2026,6,17), date(2026,6,27), "done"),
        ("Build Verification (lint/build)",   date(2026,6,26), date(2026,6,30), "done"),
        ("Vercel Deployment & Public URL",    date(2026,6,29), date(2026,7,2),  "done"),
        ("Screenshots & README Update",       date(2026,7,1),  date(2026,7,3),  "done"),
        ("Claude API Integration",            date(2026,7,1),  date(2026,7,4),  "done"),
        ("Career Path Explorer",              date(2026,7,3),  date(2026,7,5),  "done"),
        ("Skill Gap Roadmap",                 date(2026,7,4),  date(2026,7,6),  "done"),
        ("Mock Interview Coach",              date(2026,7,4),  date(2026,7,6),  "done"),
        ("Testing & QA",                      date(2026,7,6),  date(2026,7,20), "wip"),
        ("Final Documentation & Submission",  date(2026,7,6),  date(2026,8,8),  "wip"),
        ("Clerk Authentication (stretch)",    date(2026,7,14), date(2026,7,23), "plan"),
        ("NeonDB + Prisma Setup (stretch)",   date(2026,7,21), date(2026,7,29), "plan"),
        ("Capstone Presentation",             date(2026,8,10), date(2026,8,12), "plan"),
    ]
    cmap = {"done": GREEN, "wip": AMBER, "plan": BLUE}

    fig, ax = plt.subplots(figsize=(13.5, 9), dpi=200)
    ax.set_facecolor(PANEL)
    n = len(tasks)
    for i, (label, s, e, st) in enumerate(tasks):
        y = n - 1 - i
        left = mdates.date2num(s)
        width = mdates.date2num(e) - left
        ax.barh(y, width, left=left, height=0.55, color=cmap[st],
                edgecolor="white", linewidth=0.8, zorder=3)
    ax.set_yticks(range(n))
    ax.set_yticklabels([t[0] for t in reversed(tasks)], fontsize=10.5, color=INK)
    ax.set_ylim(-0.6, n - 0.4)

    # x axis as dates
    ax.set_xlim(mdates.date2num(START), mdates.date2num(END))
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=14))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%-m/%-d"))
    ax.tick_params(axis="x", labelsize=10, colors=INK)
    ax.grid(axis="x", color="#dfe6f0", linewidth=0.8, zorder=0)
    for spine in ["top", "right", "left"]:
        ax.spines[spine].set_visible(False)
    ax.spines["bottom"].set_color("#c5cfdd")

    # today line
    tx = mdates.date2num(TODAY)
    ax.axvline(tx, color=RED, linestyle="--", linewidth=2, zorder=5)
    ax.text(tx + 0.6, n - 0.5, "Today\nJul 6", color=RED, fontsize=11,
            fontweight="bold", va="top")

    ax.set_title("Pathway AI  –  Project Gantt Chart (Updated July 6, 2026)",
                 fontsize=17, fontweight="bold", color=NAVY_TITLE, pad=16)
    ax.set_xlabel("Timeline (May 20 – August 12, 2026)", fontsize=11, color="#5a6b86")

    legend = [Line2D([0],[0], color=GREEN, lw=8, label="Completed"),
              Line2D([0],[0], color=AMBER, lw=8, label="In Progress"),
              Line2D([0],[0], color=BLUE,  lw=8, label="Planned (stretch)")]
    ax.legend(handles=legend, loc="lower right", fontsize=10, framealpha=0.95)
    fig.tight_layout()
    fig.savefig("gantt_updated.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote gantt_updated.png")

# =========================================================================
# 2. CRITICAL PATH ANALYSIS (linear chain of dependent tasks)
# =========================================================================
def cpa():
    boxes = [
        ("Requirements\n& Brief",   "5d",  GREEN),
        ("Design &\nBranding",      "8d",  GREEN),
        ("Dashboard\nMVP",          "5d",  GREEN),
        ("Resume\nChecker",         "8d",  GREEN),
        ("Vercel\nDeploy",          "4d",  GREEN),
        ("Claude API\nIntegration", "12d", GREEN),
        ("4 AI Modules\nBuilt",     "20d", GREEN),
        ("Testing\n& QA",           "10d", AMBER),
        ("Final Docs\n& Submit",    "8d",  NAVY),
    ]
    fig, ax = plt.subplots(figsize=(16, 6.2), dpi=200)
    ax.axis("off")
    ax.set_xlim(0, len(boxes) * 2.15)
    ax.set_ylim(0, 6.6)

    bw, bh, gap = 1.75, 1.7, 0.4
    y = 2.7
    centers = []
    for i, (label, dur, color) in enumerate(boxes):
        x = i * (bw + gap) + 0.3
        box = FancyBboxPatch((x, y), bw, bh, boxstyle="round,pad=0.02,rounding_size=0.12",
                             facecolor=color, edgecolor="white", linewidth=1.5, zorder=3)
        ax.add_patch(box)
        txt_color = "white"
        ax.text(x + bw/2, y + bh/2 + 0.12, label, ha="center", va="center",
                fontsize=9.5, fontweight="bold", color=txt_color, zorder=4)
        ax.text(x + bw/2, y - 0.28, dur, ha="center", va="center",
                fontsize=10, color="#5a6b86")
        centers.append((x, x + bw, y + bh/2))
        if i > 0:
            px = centers[i-1][1]
            arr = FancyArrowPatch((px, y+bh/2), (x, y+bh/2),
                                  arrowstyle="-|>", mutation_scale=14,
                                  color="#3a63c7", linewidth=1.6, zorder=2)
            ax.add_patch(arr)

    # TODAY marker over "Testing & QA" (index 7)
    tx = centers[7][0] + bw/2
    ax.annotate("TODAY\nJul 6", xy=(tx, y + bh + 0.05), xytext=(tx, y + bh + 1.25),
                ha="center", color=RED, fontsize=12, fontweight="bold",
                arrowprops=dict(arrowstyle="-|>", color=RED, lw=2))

    # parallel non-critical track: Auth + Database
    pw = bw*2 + gap + 0.7
    px0 = centers[6][0] - 0.35
    pby = 0.55
    pbox = FancyBboxPatch((px0, pby), pw, 1.15,
                          boxstyle="round,pad=0.02,rounding_size=0.12",
                          facecolor=BLUE, edgecolor="white", linewidth=1.5, zorder=3)
    ax.add_patch(pbox)
    ax.text(px0 + pw/2, pby + 0.575,
            "Auth + Database (Clerk + NeonDB)\nParallel, non-critical track – has slack",
            ha="center", va="center", fontsize=9.5, fontweight="bold", color="white", zorder=4)
    con = FancyArrowPatch((centers[6][0]+bw/2, y), (px0 + pw/2, pby+1.15),
                          arrowstyle="-|>", mutation_scale=12, color="#8aa0d0",
                          linewidth=1.4, linestyle="--", zorder=2)
    ax.add_patch(con)

    ax.set_title("Pathway AI  –  Critical Path Analysis (Updated July 6, 2026)",
                 fontsize=17, fontweight="bold", color=NAVY_TITLE, y=1.02)
    ax.text(ax.get_xlim()[1]/2, 0.08,
            "Core build complete. Remaining critical path: Testing & QA → Final Docs & Submission.  "
            "Auth + Database is now a parallel, non-critical track with slack.",
            ha="center", fontsize=10.5, style="italic", color="#5a6b86")

    legend = [Line2D([0],[0], marker="s", color="w", markerfacecolor=GREEN, markersize=13, label="Completed"),
              Line2D([0],[0], marker="s", color="w", markerfacecolor=AMBER, markersize=13, label="In Progress"),
              Line2D([0],[0], marker="s", color="w", markerfacecolor=BLUE,  markersize=13, label="Planned (parallel)"),
              Line2D([0],[0], marker="s", color="w", markerfacecolor=NAVY,  markersize=13, label="Final Milestone")]
    ax.legend(handles=legend, loc="upper left", fontsize=10, framealpha=0.95)
    fig.savefig("cpa_updated.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote cpa_updated.png")

# =========================================================================
# 3. PERT CHART (dependency network)
# =========================================================================
def pert():
    # node: (id, label, te, color, x, y)
    nodes = {
        "A": ("A\nRequirements\n& Brief",   "5.0",  GREEN, 0.5, 4.2),
        "B": ("B\nLiterature\nReview",       "7.2",  GREEN, 0.5, 1.4),
        "C": ("C\nDesign &\nBranding",       "8.2",  GREEN, 2.7, 5.2),
        "D": ("D\nDashboard\nRoute",         "5.2",  GREEN, 2.7, 2.4),
        "E": ("E\nResume\nChecker",          "8.2",  GREEN, 4.9, 3.8),
        "F": ("F\nVercel\nDeploy",           "4.2",  GREEN, 4.9, 1.0),
        "G": ("G\nClaude API\nIntegration",  "12.2", GREEN, 7.1, 5.0),
        "H": ("H\nAuth &\nDatabase",         "10.3", BLUE,  7.1, 2.2),
        "I": ("I\nCareer Path\nExplorer",    "12.2", GREEN, 9.3, 5.6),
        "J": ("J\nSkill Gap\nRoadmap",       "12.2", GREEN, 9.3, 3.4),
        "K": ("K\nMock Interview\nCoach",    "14.5", GREEN, 9.3, 1.2),
        "L": ("L\nFinal Docs\n& Submission", "8.2",  NAVY,  11.5, 3.4),
    }
    edges = [("A","C"),("A","D"),("B","D"),("C","E"),("D","E"),("D","F"),
             ("E","G"),("F","H"),("G","I"),("G","J"),("H","J"),("H","K"),
             ("I","L"),("J","L"),("K","L")]

    bw, bh = 1.8, 1.5
    fig, ax = plt.subplots(figsize=(16.5, 8.6), dpi=200)
    ax.axis("off")
    ax.set_xlim(0, 13.8)
    ax.set_ylim(0, 7.2)

    def center(nid):
        _, _, _, x, y = nodes[nid]
        return (x + bw/2, y + bh/2)

    for a, b in edges:
        xa, ya = center(a); xb, yb = center(b)
        # start at right edge of a, end at left edge of b
        arr = FancyArrowPatch((nodes[a][3]+bw, ya), (nodes[b][3], yb),
                              arrowstyle="-|>", mutation_scale=13,
                              color="#8a97ad", linewidth=1.3, zorder=1,
                              connectionstyle="arc3,rad=0.02")
        ax.add_patch(arr)

    for nid,(label, te, color, x, y) in nodes.items():
        box = FancyBboxPatch((x, y), bw, bh, boxstyle="round,pad=0.02,rounding_size=0.10",
                             facecolor=color, edgecolor="white", linewidth=1.5, zorder=3)
        ax.add_patch(box)
        ax.text(x + bw/2, y + bh*0.62, label, ha="center", va="center",
                fontsize=9.5, fontweight="bold", color="white", zorder=4)
        ax.text(x + bw/2, y + bh*0.18, f"te = {te}d", ha="center", va="center",
                fontsize=9, color="white", zorder=4)

    ax.set_title("Pathway AI  –  PERT Chart (Updated July 6, 2026)",
                 fontsize=17, fontweight="bold", color=NAVY_TITLE, y=1.0)
    ax.text(6.9, 0.15, "te = (Optimistic + 4 × Most Likely + Pessimistic) / 6      "
            "As of July 6: only H (Auth & Database) remains planned; all build nodes complete.",
            ha="center", fontsize=10, style="italic", color="#5a6b86")

    legend = [Line2D([0],[0], marker="s", color="w", markerfacecolor=GREEN, markersize=13, label="Completed"),
              Line2D([0],[0], marker="s", color="w", markerfacecolor=AMBER, markersize=13, label="In Progress"),
              Line2D([0],[0], marker="s", color="w", markerfacecolor=BLUE,  markersize=13, label="Planned"),
              Line2D([0],[0], marker="s", color="w", markerfacecolor=NAVY,  markersize=13, label="Final Milestone")]
    ax.legend(handles=legend, loc="lower left", fontsize=10, framealpha=0.95)
    fig.savefig("pert_updated.png", bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote pert_updated.png")

if __name__ == "__main__":
    gantt(); cpa(); pert()
    print("done")
