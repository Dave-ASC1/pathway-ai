import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  const skills = screen.getByPlaceholderText(/html, css, basic javascript/i);
  const role = screen.getByPlaceholderText(/front-end developer, data analyst/i);
  await user.type(skills, "HTML, CSS, basic JavaScript");
  await user.type(role, "Front-End Developer");
}

describe("SkillGapClient", () => {
  beforeEach(() => {
    vi.resetModules();
    window.sessionStorage.clear();
  });

  // P-18: a loading state must appear while the request is pending.
  it("shows a loading state while the request is in flight", async () => {
    const pending = new Promise(() => {});
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    const { SkillGapClient } = await import("./skill-gap-client");
    const user = userEvent.setup();
    render(<SkillGapClient />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /build my roadmap/i }));

    await waitFor(() => {
      expect(screen.getByText(/building your roadmap/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /building roadmap/i })).toBeDisabled();

    vi.unstubAllGlobals();
  });

  // P-17: a failed request renders a friendly message instead of crashing.
  it("shows a friendly error message instead of crashing when the API call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Something went wrong building your roadmap. Please try again." }),
      }),
    );

    const { SkillGapClient } = await import("./skill-gap-client");
    const user = userEvent.setup();
    render(<SkillGapClient />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /build my roadmap/i }));

    await waitFor(() => {
      expect(screen.getByText("We hit a snag.")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Something went wrong building your roadmap. Please try again."),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
