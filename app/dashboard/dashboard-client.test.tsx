// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardClient } from "./dashboard-client";

// P-14: the dashboard's four module "stops" (Resume, Career, Roadmap,
// Interview — rendered as the JourneyBoard's interactive nodes) must all
// render with the correct label and link on page load.
describe("DashboardClient", () => {
  it("renders all four module stops with correct links", () => {
    render(<DashboardClient />);

    const expected: [string, string][] = [
      ["Resume tool", "/resume-checker"],
      ["Career tool", "/career-path"],
      ["Roadmap tool", "/skill-gap"],
      ["Interview tool", "/interview"],
    ];

    for (const [label, href] of expected) {
      // Each stop renders twice (wide + tall layout variants).
      const links = screen.getAllByRole("link", { name: label });
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link).toHaveAttribute("href", href);
      }
    }
  });

  it("renders the journey heading and progress copy", () => {
    render(<DashboardClient />);
    expect(screen.getByText("Your journey")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /steps done/i })).toBeInTheDocument();
  });
});
