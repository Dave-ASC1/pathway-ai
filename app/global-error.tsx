"use client";

import { useEffect } from "react";

// Fallback for errors thrown in the root layout itself. It replaces the whole
// document, so it must render its own <html>/<body> and cannot rely on globals.css.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#f7f9fc",
          color: "#0f172a",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.6rem", margin: "0 0 0.75rem", color: "#041336" }}>
            Something went wrong.
          </h1>
          <p style={{ margin: "0 0 1.5rem", color: "#64748b", lineHeight: 1.55 }}>
            An unexpected error occurred. Please refresh the page or try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              cursor: "pointer",
              borderRadius: "999px",
              background: "#041336",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              padding: "0.7rem 1.4rem",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
