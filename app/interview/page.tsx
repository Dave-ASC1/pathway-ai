import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { InterviewClient } from "./interview-client";

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  return (
    <AppShell active="interview">
      <div className="app-topbar">
        <Link className="text-action" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
      <InterviewClient initialRole={typeof role === "string" ? role : ""} />
    </AppShell>
  );
}
