import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  const role = screen.getByPlaceholderText(/enter a role like 'data analyst'/i);
  await user.type(role, "Data Analyst");
}

describe("InterviewClient", () => {
  beforeEach(() => {
    vi.resetModules();
    window.sessionStorage.clear();
  });

  // P-18: a loading state must appear while generating questions.
  it("shows a loading state while the request is in flight", async () => {
    const pending = new Promise(() => {});
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    const { InterviewClient } = await import("./interview-client");
    const user = userEvent.setup();
    render(<InterviewClient />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /generate questions/i }));

    await waitFor(() => {
      expect(screen.getByText(/generating your interview questions/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /^generating…$/i })).toBeDisabled();

    vi.unstubAllGlobals();
  });

  // P-17: a failed request renders a friendly message instead of crashing
  // or throwing an unhandled error mid-interview.
  it("shows a friendly error message instead of crashing when the API call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "AI service is not configured. Please try again later." }),
      }),
    );

    const { InterviewClient } = await import("./interview-client");
    const user = userEvent.setup();
    render(<InterviewClient />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /generate questions/i }));

    await waitFor(() => {
      expect(screen.getByText("We hit a snag.")).toBeInTheDocument();
    });
    expect(
      screen.getByText("AI service is not configured. Please try again later."),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
