import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ResumeCheckerClient } from "./resume-checker-client";

export default function ResumeCheckerPage() {
  return (
    <AppShell active="resume">
      <div className="app-topbar">
        <Link className="text-action" href="/dashboard">
          Back to journey
        </Link>
      </div>
      <ResumeCheckerClient />
    </AppShell>
  );
}
