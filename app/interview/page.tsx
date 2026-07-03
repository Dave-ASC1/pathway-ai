import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { InterviewClient } from "./interview-client";

export default function InterviewPage() {
  return (
    <AppShell active="interview">
      <div className="app-topbar">
        <Link className="text-action" href="/dashboard">
          Back to journey
        </Link>
      </div>
      <InterviewClient />
    </AppShell>
  );
}
