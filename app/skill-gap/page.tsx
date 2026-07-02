import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { SkillGapClient } from "./skill-gap-client";

export default async function SkillGapPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; skills?: string }>;
}) {
  const { role, skills } = await searchParams;

  return (
    <AppShell active="roadmap">
      <div className="app-topbar">
        <Link className="text-action" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
      <SkillGapClient
        initialRole={typeof role === "string" ? role : ""}
        initialSkills={typeof skills === "string" ? skills : ""}
      />
    </AppShell>
  );
}
