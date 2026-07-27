// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const RESUME_TEXT =
  "Built a React app using TypeScript, worked as a support intern, wrote documentation.";
const JOB_TEXT =
  "Looking for a React and TypeScript developer with strong debugging and communication skills.";

function mockAnalysis(overrides: Record<string, unknown> = {}) {
  return {
    score: 87,
    matchedKeywords: ["react", "typescript"],
    missingKeywords: ["graphql"],
    strengths: ["Strong project work"],
    improvements: ["Add metrics"],
    sections: [
      { label: "Education", score: 70 },
      { label: "Experience", score: 60 },
      { label: "Projects", score: 90 },
      { label: "Skills", score: 85 },
      { label: "Impact", score: 40 },
    ],
    source: "claude",
    ...overrides,
  };
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  const resumeBox = screen.getByPlaceholderText(/paste your resume here/i);
  const jobBox = screen.getByPlaceholderText(/paste the job description here/i);
  await user.type(resumeBox, RESUME_TEXT);
  await user.type(jobBox, JOB_TEXT);
}

describe("ResumeCheckerClient", () => {
  beforeEach(() => {
    vi.resetModules();
    window.sessionStorage.clear();
  });

  // P-15: once a mock API response comes back, the score and keyword list
  // render with the values from that response.
  it("renders the score and keyword lists from a mock API response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnalysis(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { ResumeCheckerClient } = await import("./resume-checker-client");
    const user = userEvent.setup();
    render(<ResumeCheckerClient />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /analyze resume/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/resume match score 87%/i)).toBeInTheDocument();
    });
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("graphql")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  // P-16: the submit button must be disabled while the request is in
  // flight, so a second click can't fire a duplicate request.
  it("disables the submit button while the request is in progress", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(pending);
    vi.stubGlobal("fetch", fetchMock);

    const { ResumeCheckerClient } = await import("./resume-checker-client");
    const user = userEvent.setup();
    render(<ResumeCheckerClient />);

    await fillForm(user);
    const button = screen.getByRole("button", { name: /analyze resume/i });
    expect(button).not.toBeDisabled();

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // A second click while pending must not fire a second request.
    await user.click(screen.getByRole("button", { name: /analyzing/i }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({ ok: true, json: async () => mockAnalysis() });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /analyze resume/i })).not.toBeDisabled();
    });

    vi.unstubAllGlobals();
  });
});
