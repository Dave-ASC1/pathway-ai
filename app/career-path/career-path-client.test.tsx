import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  const major = screen.getByPlaceholderText(/information sciences and technology/i);
  const interests = screen.getByPlaceholderText(/i like solving problems with data/i);
  await user.type(major, "Computer Science");
  await user.type(interests, "backend systems and data");
}

describe("CareerPathClient", () => {
  beforeEach(() => {
    vi.resetModules();
    window.sessionStorage.clear();
  });

  // P-18: a loading state must appear while the request is pending, not a
  // frozen/blank UI.
  it("shows a loading state while the request is in flight", async () => {
    const pending = new Promise(() => {}); // never resolves within the test
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    const { CareerPathClient } = await import("./career-path-client");
    const user = userEvent.setup();
    render(<CareerPathClient />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /explore career paths/i }));

    await waitFor(() => {
      expect(screen.getByText(/mapping your career paths/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /generating paths/i })).toBeDisabled();

    vi.unstubAllGlobals();
  });

  // P-17: a failed request must render a friendly message, not a raw error
  // or blank/crashed UI.
  it("shows a friendly error message instead of crashing when the API call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "AI service is not configured. Please try again later." }),
      }),
    );

    const { CareerPathClient } = await import("./career-path-client");
    const user = userEvent.setup();
    render(<CareerPathClient />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /explore career paths/i }));

    await waitFor(() => {
      expect(screen.getByText("We hit a snag.")).toBeInTheDocument();
    });
    expect(
      screen.getByText("AI service is not configured. Please try again later."),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
