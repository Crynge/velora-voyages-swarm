import { NextResponse } from "next/server";

import { getAgencyProfile, listDemoBriefs, listLatestRuns, resetDemoData } from "@/lib/repository";

export async function POST() {
  await resetDemoData();
  const [profile, demoBriefs, runs] = await Promise.all([
    getAgencyProfile(),
    listDemoBriefs(),
    listLatestRuns(),
  ]);

  return NextResponse.json({
    profile,
    demoBriefs,
    runs,
  });
}
