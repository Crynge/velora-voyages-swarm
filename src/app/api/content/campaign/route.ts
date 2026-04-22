import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateCampaignForRun } from "@/lib/swarm/orchestrator";

const payloadSchema = z.object({
  runId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { runId } = payloadSchema.parse(body);
  const campaignPack = await generateCampaignForRun(runId);

  return NextResponse.json({ campaignPack });
}
