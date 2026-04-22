import { LandingPage } from "@/components/landing-page";
import { getDashboardData } from "@/lib/repository";

export default async function HomePage() {
  const { profile, briefs, runs } = await getDashboardData();

  return <LandingPage profile={profile} demoBriefs={briefs} recentRuns={runs} />;
}
