import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { CareerPathClient } from "./career-path-client";

export default function CareerPathPage() {
  return (
    <AppShell active="career">
      <div className="app-topbar">
        <Link className="text-action" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
      <CareerPathClient />
    </AppShell>
  );
}
