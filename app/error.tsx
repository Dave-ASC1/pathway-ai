"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PathwayLogo } from "./components/PathwayLogo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for monitoring. Wire an error-tracking service
    // (e.g. Sentry) here when a DSN is configured.
    console.error(error);
  }, [error]);

  return (
    <main className="status-page">
      <PathwayLogo href="/" />
      <h1>Something went wrong.</h1>
      <p className="status-text">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="status-actions">
        <button className="primary-action" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="secondary-action" href="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
