import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { SkillGapClient } from "./skill-gap-client";

export default function SkillGapPage() {
  return (
    <AppShell active="roadmap">
      <div className="app-topbar">
        <Link className="text-action" href="/dashboard">
          Back to journey
        </Link>
      </div>
      <SkillGapClient />
    </AppShell>
  );
}
