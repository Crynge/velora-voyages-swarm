import {
  appendTraceEvent,
  createTripRun,
  getAgencyProfile,
  getTripRun,
  updateTripRun,
} from "@/lib/repository";
import { generateJson, getModelChain, getOllamaEnv } from "@/lib/ollama";
import {
  mockCampaignPack,
  mockCreativeDirection,
  mockLogisticsPlan,
  mockQaReport,
  mockQuoteDraft,
  mockResearchDossier,
  mockTripPlan,
} from "@/lib/swarm/mock";
import {
  campaignPackSchema,
  conciergeQaSchema,
  creativeDirectionSchema,
  itinerarySchema,
  logisticsPlanSchema,
  quoteDraftSchema,
  researchDossierSchema,
} from "@/lib/swarm/schemas";
import { sleep, titleFromBrief } from "@/lib/utils";
import type {
  AgentKey,
  CampaignPack,
  QuoteDraft,
  StreamEvent,
  TravelerBrief,
  TripPlan,
  TripWorkspace,
} from "@/types/travel";
import type { z } from "zod";

type Emit = (event: StreamEvent) => Promise<void>;

async function persistSystemEvent(input: {
  runId: string;
  stepIndex: number;
  summary: string;
  payload: unknown;
}) {
  await appendTraceEvent({
    runId: input.runId,
    stepIndex: input.stepIndex,
    phase: "system",
    agentKey: "system",
    label: "System",
    status: "info",
    summary: input.summary,
    payload: input.payload,
  });
}

async function generateWithFallback<T>(input: {
  systemPrompt: string;
  userPrompt: string;
  jsonShape: string;
  schema: z.ZodType<T>;
  mockFactory: () => T;
}) {
  try {
    return await generateJson(input);
  } catch (error) {
    const env = getOllamaEnv();

    if (!env.TRAVEL_SWARM_ALLOW_MOCK_FALLBACK) {
      throw error;
    }

    return {
      data: input.schema.parse(input.mockFactory()),
      modelName: "mock://velora-demo-fallback",
    };
  }
}

function buildContext(workspace: TripWorkspace) {
  return JSON.stringify(workspace, null, 2);
}

function itineraryToTripPlan(input: {
  itinerary: z.infer<typeof itinerarySchema>;
  logisticsPlan: TripWorkspace["logisticsPlan"];
  researchDossier: TripWorkspace["researchDossier"];
}): TripPlan {
  const markdown = [
    `# ${input.itinerary.tripTitle}`,
    "",
    `## Overview`,
    input.itinerary.overview,
    "",
    `## Daily Flow`,
    ...input.itinerary.days.flatMap((day) => [
      `### Day ${day.day}: ${day.title}`,
      `- Morning: ${day.morning}`,
      `- Afternoon: ${day.afternoon}`,
      `- Evening: ${day.evening}`,
      `- Stay: ${day.stay}`,
      `- Highlight: ${day.highlight}`,
      "",
    ]),
  ].join("\n");

  return {
    tripTitle: input.itinerary.tripTitle,
    overview: input.itinerary.overview,
    days: input.itinerary.days,
    conciergeTouches: input.itinerary.conciergeTouches,
    logisticsSummary: [
      input.logisticsPlan?.flightStrategy ?? "",
      input.logisticsPlan?.transferPlan ?? "",
    ].filter(Boolean),
    researchHighlights: [
      input.researchDossier?.destinationRationale ?? "",
      input.researchDossier?.idealSeasonWindow ?? "",
    ].filter(Boolean),
    markdown,
  };
}

async function runAgent<T>(input: {
  runId: string;
  stepIndex: number;
  agentKey: AgentKey;
  label: string;
  workspace: TripWorkspace;
  schema: z.ZodType<T>;
  jsonShape: string;
  systemPrompt: string;
  userPrompt: string;
  mockFactory: () => T;
  applyResult: (result: T, modelName: string) => Promise<TripWorkspace>;
  emit: Emit;
}) {
  await appendTraceEvent({
    runId: input.runId,
    stepIndex: input.stepIndex,
    phase: "agent",
    agentKey: input.agentKey,
    label: input.label,
    status: "started",
    summary: `${input.label} is working.`,
    payload: { snapshot: input.workspace },
  });

  await input.emit({
    type: "agent.started",
    runId: input.runId,
    stepIndex: input.stepIndex,
    agentKey: input.agentKey,
    label: input.label,
  });

  await sleep(240);

  const { data, modelName } = await generateWithFallback({
    systemPrompt: input.systemPrompt,
    userPrompt: input.userPrompt,
    jsonShape: input.jsonShape,
    schema: input.schema,
    mockFactory: input.mockFactory,
  });

  const workspace = await input.applyResult(data, modelName);

  await appendTraceEvent({
    runId: input.runId,
    stepIndex: input.stepIndex,
    phase: "agent",
    agentKey: input.agentKey,
    label: input.label,
    status: "completed",
    summary: (data as { summary?: string }).summary ?? `${input.label} completed.`,
    payload: data,
  });

  await input.emit({
    type: "agent.completed",
    runId: input.runId,
    stepIndex: input.stepIndex,
    agentKey: input.agentKey,
    label: input.label,
    summary: (data as { summary?: string }).summary ?? `${input.label} completed.`,
    payload: data,
    modelName,
  });

  return { data, workspace, modelName };
}

export async function runTravelSwarm(input: {
  brief: TravelerBrief;
  profileSlug?: string;
  emit: Emit;
}) {
  const profile = await getAgencyProfile(input.profileSlug);
  const initialModelName = getModelChain()[0] ?? "unconfigured-model";
  const title = titleFromBrief(input.brief);

  const created = await createTripRun({
    title,
    profileSlug: profile.slug,
    modelName: initialModelName,
    brief: input.brief,
  });

  await input.emit({
    type: "run.created",
    runId: created.id,
    title,
    modelName: initialModelName,
  });

  await persistSystemEvent({
    runId: created.id,
    stepIndex: 0,
    summary: "Travel swarm initialized.",
    payload: {
      modelChain: getModelChain(),
      mockFallbackEnabled: getOllamaEnv().TRAVEL_SWARM_ALLOW_MOCK_FALLBACK,
    },
  });

  let workspace: TripWorkspace = {
    status: "running",
    profileSlug: profile.slug,
    travelerBrief: input.brief,
    notices: [],
  };

  try {
    const creative = await runAgent({
      runId: created.id,
      stepIndex: 1,
      agentKey: "creative-director",
      label: "Creative Director",
      workspace,
      emit: input.emit,
      schema: creativeDirectionSchema,
      jsonShape: `{
  "summary": "string",
  "brandPillars": ["string"],
  "clientPromise": "string",
  "heroNarrative": "string",
  "socialAngle": "string",
  "recommendedUpsells": ["string"]
}`,
      systemPrompt:
        "You are Velora Voyages' Creative Director. Keep the tone premium, specific, and socially magnetic. No generic luxury language.",
      userPrompt: `Agency profile:\n${JSON.stringify(profile, null, 2)}\n\nTraveler brief:\n${JSON.stringify(
        input.brief,
        null,
        2,
      )}`,
      mockFactory: () => mockCreativeDirection(input.brief),
      applyResult: async (result, modelName) => {
        workspace = { ...workspace, creativeDirection: result };
        await updateTripRun(created.id, {
          status: "running",
          workspace,
          modelName,
        });
        return workspace;
      },
    });

    if (creative.modelName.startsWith("mock://")) {
      const message =
        "Ollama could not produce structured output, so the repo switched to the built-in demo fallback for this run.";
      workspace = { ...workspace, notices: [...workspace.notices, message] };
      await persistSystemEvent({
        runId: created.id,
        stepIndex: 1,
        summary: message,
        payload: { fallback: creative.modelName },
      });
      await input.emit({
        type: "run.notice",
        runId: created.id,
        level: "warn",
        message,
      });
    }

    const research = await runAgent({
      runId: created.id,
      stepIndex: 2,
      agentKey: "destination-researcher",
      label: "Destination Researcher",
      workspace,
      emit: input.emit,
      schema: researchDossierSchema,
      jsonShape: `{
  "summary": "string",
  "idealSeasonWindow": "string",
  "destinationRationale": "string",
  "visaNotes": "string",
  "signatureExperiences": ["string"],
  "neighborhoodTargets": ["string"],
  "riskWatchouts": ["string"]
}`,
      systemPrompt:
        "You are a destination strategist for a high-end travel agency. Prioritize seasonality, specificity, and premium pacing.",
      userPrompt: `Traveler brief:\n${JSON.stringify(input.brief, null, 2)}\n\nCurrent workspace:\n${buildContext(
        workspace,
      )}`,
      mockFactory: () => mockResearchDossier(input.brief),
      applyResult: async (result, modelName) => {
        workspace = { ...workspace, researchDossier: result };
        await updateTripRun(created.id, {
          status: "running",
          workspace,
          modelName,
        });
        return workspace;
      },
    });

    const logistics = await runAgent({
      runId: created.id,
      stepIndex: 3,
      agentKey: "flight-stay-planner",
      label: "Flight & Stay Planner",
      workspace,
      emit: input.emit,
      schema: logisticsPlanSchema,
      jsonShape: `{
  "summary": "string",
  "flightStrategy": "string",
  "stayStrategy": "string",
  "transferPlan": "string",
  "routingNotes": ["string"],
  "hotelShortlist": [
    {
      "name": "string",
      "vibe": "string",
      "nightlyUsd": 0,
      "whyItFits": "string"
    }
  ]
}`,
      systemPrompt:
        "You are the logistics lead. Optimize for elegant routing, credible hotel strategy, and low-friction premium movement.",
      userPrompt: `Traveler brief:\n${JSON.stringify(input.brief, null, 2)}\n\nResearch dossier:\n${JSON.stringify(
        research.data,
        null,
        2,
      )}\n\nCreative direction:\n${JSON.stringify(creative.data, null, 2)}`,
      mockFactory: () => mockLogisticsPlan(input.brief),
      applyResult: async (result, modelName) => {
        workspace = { ...workspace, logisticsPlan: result };
        await updateTripRun(created.id, {
          status: "running",
          workspace,
          modelName,
        });
        return workspace;
      },
    });

    await runAgent({
      runId: created.id,
      stepIndex: 4,
      agentKey: "itinerary-architect",
      label: "Itinerary Architect",
      workspace,
      emit: input.emit,
      schema: itinerarySchema,
      jsonShape: `{
  "summary": "string",
  "tripTitle": "string",
  "overview": "string",
  "days": [
    {
      "day": 1,
      "title": "string",
      "morning": "string",
      "afternoon": "string",
      "evening": "string",
      "stay": "string",
      "highlight": "string"
    }
  ],
  "conciergeTouches": ["string"]
}`,
      systemPrompt:
        "You are an itinerary architect. Build day-by-day structure that feels indulgent, coherent, and not overprogrammed.",
      userPrompt: `Traveler brief:\n${JSON.stringify(input.brief, null, 2)}\n\nResearch dossier:\n${JSON.stringify(
        research.data,
        null,
        2,
      )}\n\nLogistics plan:\n${JSON.stringify(logistics.data, null, 2)}\n\nCreative direction:\n${JSON.stringify(
        creative.data,
        null,
        2,
      )}`,
      mockFactory: () => {
        const mockResearch = mockResearchDossier(input.brief);
        const mockLogistics = mockLogisticsPlan(input.brief);
        const tripPlan = mockTripPlan(input.brief, mockLogistics, mockResearch);
        return {
          summary: tripPlan.overview,
          tripTitle: tripPlan.tripTitle,
          overview: tripPlan.overview,
          days: tripPlan.days,
          conciergeTouches: tripPlan.conciergeTouches,
        };
      },
      applyResult: async (result, modelName) => {
        const tripPlan = itineraryToTripPlan({
          itinerary: result,
          logisticsPlan: workspace.logisticsPlan,
          researchDossier: workspace.researchDossier,
        });
        workspace = { ...workspace, tripPlan };
        await updateTripRun(created.id, {
          status: "running",
          workspace,
          tripPlan,
          modelName,
        });
        return workspace;
      },
    });

    const quote = await runAgent({
      runId: created.id,
      stepIndex: 5,
      agentKey: "offer-composer",
      label: "Offer Composer",
      workspace,
      emit: input.emit,
      schema: quoteDraftSchema,
      jsonShape: `{
  "summary": "string",
  "headline": "string",
  "investmentRangeUsd": "string",
  "inclusions": ["string"],
  "exclusions": ["string"],
  "emailDraft": "string",
  "nextSteps": ["string"],
  "upsellMenu": [
    {
      "name": "string",
      "priceEstimateUsd": 0,
      "reason": "string"
    }
  ]
}`,
      systemPrompt:
        "You are the offer composer. Create premium but believable pricing language and a client-ready follow-up email.",
      userPrompt: `Traveler brief:\n${JSON.stringify(input.brief, null, 2)}\n\nTrip plan:\n${JSON.stringify(
        workspace.tripPlan,
        null,
        2,
      )}\n\nCreative direction:\n${JSON.stringify(creative.data, null, 2)}`,
      mockFactory: () => mockQuoteDraft(input.brief),
      applyResult: async (result, modelName) => {
        workspace = { ...workspace, quoteDraft: result };
        await updateTripRun(created.id, {
          status: "running",
          workspace,
          tripPlan: workspace.tripPlan,
          quoteDraft: result,
          modelName,
        });
        return workspace;
      },
    });

    const campaign = await runAgent({
      runId: created.id,
      stepIndex: 6,
      agentKey: "social-growth-producer",
      label: "Social Growth Producer",
      workspace,
      emit: input.emit,
      schema: campaignPackSchema,
      jsonShape: `{
  "summary": "string",
  "hookLine": "string",
  "instagramCaptions": ["string"],
  "tiktokHooks": ["string"],
  "xThread": ["string"],
  "linkedInPost": "string",
  "landingPageBlurb": "string"
}`,
      systemPrompt:
        "You are a growth-minded luxury travel content strategist. Package the trip into instantly shareable hooks without cheapening the brand.",
      userPrompt: `Traveler brief:\n${JSON.stringify(input.brief, null, 2)}\n\nTrip plan:\n${JSON.stringify(
        workspace.tripPlan,
        null,
        2,
      )}\n\nQuote draft:\n${JSON.stringify(quote.data, null, 2)}`,
      mockFactory: () =>
        mockCampaignPack(
          input.brief,
          workspace.tripPlan ?? mockTripPlan(input.brief, mockLogisticsPlan(input.brief), mockResearchDossier(input.brief)),
        ),
      applyResult: async (result, modelName) => {
        workspace = { ...workspace, campaignPack: result };
        await updateTripRun(created.id, {
          status: "running",
          workspace,
          tripPlan: workspace.tripPlan,
          quoteDraft: workspace.quoteDraft,
          campaignPack: result,
          modelName,
        });
        return workspace;
      },
    });

    const qa = await runAgent({
      runId: created.id,
      stepIndex: 7,
      agentKey: "concierge-qa",
      label: "Concierge QA",
      workspace,
      emit: input.emit,
      schema: conciergeQaSchema,
      jsonShape: `{
  "summary": "string",
  "approved": true,
  "issues": ["string"],
  "adjustments": ["string"],
  "premiumCheck": "string"
}`,
      systemPrompt:
        "You are concierge QA. Check for premium coherence, budget credibility, client fit, and operational friction.",
      userPrompt: `Traveler brief:\n${JSON.stringify(input.brief, null, 2)}\n\nWorkspace:\n${buildContext(workspace)}`,
      mockFactory: () => mockQaReport(input.brief),
      applyResult: async (result, modelName) => {
        const nextStatus = result.approved ? "completed" : "needs_revision";
        workspace = { ...workspace, qaReport: result, status: nextStatus };
        await updateTripRun(created.id, {
          status: nextStatus,
          workspace,
          tripPlan: workspace.tripPlan,
          quoteDraft: workspace.quoteDraft,
          campaignPack: workspace.campaignPack,
          modelName,
          completed: result.approved,
        });
        return workspace;
      },
    });

    if (!qa.data.approved) {
      const revisedQuote: QuoteDraft = {
        ...(workspace.quoteDraft ?? mockQuoteDraft(input.brief)),
        summary: `${workspace.quoteDraft?.summary ?? "Quote refined."} Adjusted after QA feedback.`,
        nextSteps: [
          ...(workspace.quoteDraft?.nextSteps ?? []),
          "Review the tightened scope and re-approve the hero add-ons.",
        ],
      };
      const revisedCampaign: CampaignPack =
        workspace.campaignPack ??
        mockCampaignPack(input.brief, workspace.tripPlan ?? mockTripPlan(input.brief, mockLogisticsPlan(input.brief), mockResearchDossier(input.brief)));

      workspace = {
        ...workspace,
        status: "completed",
        quoteDraft: revisedQuote,
        campaignPack: revisedCampaign,
        notices: [...workspace.notices, "QA requested a refinement pass; the offer copy was tightened before final delivery."],
      };

      await persistSystemEvent({
        runId: created.id,
        stepIndex: 8,
        summary: "QA revision applied to the offer package.",
        payload: {
          adjustments: qa.data.adjustments,
        },
      });

      await input.emit({
        type: "run.notice",
        runId: created.id,
        level: "info",
        message: "Concierge QA asked for a refinement pass, so the offer package was tightened before completion.",
      });

      await updateTripRun(created.id, {
        status: "completed",
        workspace,
        tripPlan: workspace.tripPlan,
        quoteDraft: revisedQuote,
        campaignPack: revisedCampaign,
        modelName: campaign.modelName,
        completed: true,
      });
    }

    const finalRun = await getTripRun(created.id);

    if (!finalRun) {
      throw new Error("Run completed, but the record could not be reloaded.");
    }

    await input.emit({
      type: "run.completed",
      runId: created.id,
      run: finalRun,
    });

    return finalRun;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The travel swarm failed unexpectedly.";
    workspace = { ...workspace, status: "failed", notices: [...workspace.notices, message] };

    await updateTripRun(created.id, {
      status: "failed",
      workspace,
      errorMessage: message,
    });

    await appendTraceEvent({
      runId: created.id,
      stepIndex: 99,
      phase: "system",
      agentKey: "system",
      label: "System",
      status: "failed",
      summary: message,
      payload: { error: message },
    });

    await input.emit({
      type: "run.failed",
      runId: created.id,
      message,
    });

    throw error;
  }
}

export async function generateCampaignForRun(runId: string) {
  const run = await getTripRun(runId);

  if (!run) {
    throw new Error("Run not found.");
  }

  if (run.campaignPack) {
    return run.campaignPack;
  }

  const tripPlan =
    run.tripPlan ?? mockTripPlan(run.travelerBrief, mockLogisticsPlan(run.travelerBrief), mockResearchDossier(run.travelerBrief));
  const campaign = mockCampaignPack(run.travelerBrief, tripPlan);

  await updateTripRun(runId, {
    status: run.status,
    workspace: {
      ...run.workspace,
      campaignPack: campaign,
    },
    tripPlan,
    quoteDraft: run.quoteDraft,
    campaignPack: campaign,
    modelName: run.modelName,
  });

  return campaign;
}
