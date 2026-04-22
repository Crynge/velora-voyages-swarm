import { NextRequest } from "next/server";
import { z } from "zod";

import { runTravelSwarm } from "@/lib/swarm/orchestrator";
import type { StreamEvent } from "@/types/travel";

const travelerBriefSchema = z.object({
  clientName: z.string().min(1),
  occasion: z.string().min(1),
  travelers: z.string().min(1),
  origin: z.string().min(1),
  travelMonth: z.string().min(1),
  durationNights: z.number().int().min(3).max(21),
  budgetUsd: z.number().int().min(5000).max(200000),
  destinations: z.array(z.string()).min(1),
  priorities: z.array(z.string()).min(1),
  avoid: z.array(z.string()),
  style: z.string().min(1),
  notes: z.string().min(1),
});

const payloadSchema = z.object({
  profileSlug: z.string().optional(),
  brief: travelerBriefSchema,
});

function encodeEvent(event: StreamEvent) {
  return `${JSON.stringify(event)}\n`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = payloadSchema.parse(body);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = async (event: StreamEvent) => {
        controller.enqueue(encoder.encode(encodeEvent(event)));
      };

      try {
        await runTravelSwarm({
          brief: payload.brief,
          profileSlug: payload.profileSlug,
          emit,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to complete the travel-agent workflow.";
        controller.enqueue(
          encoder.encode(
            encodeEvent({
              type: "run.failed",
              runId: "unknown",
              message,
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
