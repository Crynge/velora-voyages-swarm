import Link from "next/link";

import { ControlRoom } from "@/components/control-room";
import { getDashboardData } from "@/lib/repository";

export default async function ControlRoomPage() {
  const { profile, briefs, runs } = await getDashboardData();

  return (
    <main className="px-6 py-6 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-kicker">Travel Agency Swarm</p>
            <h1 className="section-title text-[color:var(--paper)]">Control room for live itinerary runs.</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--paper)] transition hover:-translate-y-0.5"
          >
            Back To Landing Page
          </Link>
        </div>
        <ControlRoom agencyName={profile.name} initialDemoBriefs={briefs} initialRuns={runs} />
      </div>
    </main>
  );
}
