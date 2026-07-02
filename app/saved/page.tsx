import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { SavedClient } from "./saved-client";

export default function SavedPage() {
  return (
    <AppShell active="saved">
      <div className="app-topbar">
        <Link className="text-action" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
      <SavedClient />
    </AppShell>
  );
}
