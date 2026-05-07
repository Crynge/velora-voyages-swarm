import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { demoBriefs, veloraProfile } from "@/lib/demo-data";
import { parseJson, stringifyJson } from "@/lib/json";
import type {
  AgencyProfile,
  CampaignPack,
  DemoBrief,
  QuoteDraft,
  RunTrace,
  TripPlan,
  TripRunRecord,
  TripWorkspace,
  TravelerBrief,
} from "@/types/travel";

type RunWithTraceEvents = Prisma.TripRunGetPayload<{
  include: {
    traceEvents: true;
  };
}>;

let ensureDemoDataPromise: Promise<void> | null = null;

const emptyWorkspace = (brief: TravelerBrief, profileSlug: string): TripWorkspace => ({
  status: "idle",
  profileSlug,
  travelerBrief: brief,
  notices: [],
});

function mapRun(run: RunWithTraceEvents): TripRunRecord {
  return {
    id: run.id,
    title: run.title,
    status: run.status,
    modelName: run.modelName,
    profileSlug: run.profileSlug,
    travelerBrief: parseJson<TravelerBrief>(run.briefData, {} as TravelerBrief),
    workspace: parseJson<TripWorkspace>(run.workspaceData, {} as TripWorkspace),
    tripPlan: parseJson<TripPlan | undefined>(run.tripPlanData, undefined),
    quoteDraft: parseJson<QuoteDraft | undefined>(run.quoteData, undefined),
    campaignPack: parseJson<CampaignPack | undefined>(run.campaignData, undefined),
    errorMessage: run.errorMessage,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
    traceEvents: run.traceEvents.map(
      (event): RunTrace => ({
        id: event.id,
        runId: event.runId,
        stepIndex: event.stepIndex,
        phase: event.phase,
        agentKey: event.agentKey as RunTrace["agentKey"],
        label: event.label,
        status: event.status,
        summary: event.summary,
        payload: parseJson(event.payloadData, null),
        createdAt: event.createdAt.toISOString(),
      }),
    ),
  };
}

export async function resetDemoData() {
  await prisma.traceEvent.deleteMany();
  await prisma.tripRun.deleteMany();
  await prisma.demoBriefRecord.deleteMany();
  await prisma.agencyProfileRecord.deleteMany();

  await seedDemoData();
}

async function seedDemoData() {
  await prisma.agencyProfileRecord.upsert({
    where: {
      slug: veloraProfile.slug,
    },
    update: {
      version: veloraProfile.version,
      name: veloraProfile.name,
      data: stringifyJson(veloraProfile),
    },
    create: {
      slug: veloraProfile.slug,
      version: veloraProfile.version,
      name: veloraProfile.name,
      data: stringifyJson(veloraProfile),
    },
  });

  for (const item of demoBriefs) {
    await prisma.demoBriefRecord.upsert({
      where: {
        slug: item.slug,
      },
      update: {
        title: item.title,
        blurb: item.blurb,
        data: stringifyJson(item.brief),
      },
      create: {
        slug: item.slug,
        title: item.title,
        blurb: item.blurb,
        data: stringifyJson(item.brief),
      },
    });
  }
}

export async function ensureDemoData() {
  if (!ensureDemoDataPromise) {
    ensureDemoDataPromise = (async () => {
      const profileCount = await prisma.agencyProfileRecord.count();

      if (profileCount === 0) {
        await seedDemoData();
      }
    })().finally(() => {
      ensureDemoDataPromise = null;
    });
  }

  await ensureDemoDataPromise;
}

export async function getAgencyProfile(slug = veloraProfile.slug): Promise<AgencyProfile> {
  await ensureDemoData();

  const record = await prisma.agencyProfileRecord.findUniqueOrThrow({
    where: { slug },
  });

  return parseJson(record.data, veloraProfile);
}

export async function listDemoBriefs(): Promise<DemoBrief[]> {
  await ensureDemoData();

  const records = await prisma.demoBriefRecord.findMany({
    orderBy: { createdAt: "asc" },
  });

  return records.map((record) => ({
    slug: record.slug,
    title: record.title,
    blurb: record.blurb,
    brief: parseJson(record.data, demoBriefs[0]?.brief ?? ({} as TravelerBrief)),
  }));
}

export async function createTripRun(input: {
  title: string;
  modelName: string;
  profileSlug: string;
  brief: TravelerBrief;
}) {
  const workspace = emptyWorkspace(input.brief, input.profileSlug);

  return prisma.tripRun.create({
    data: {
      title: input.title,
      status: "running",
      modelName: input.modelName,
      profileSlug: input.profileSlug,
      briefData: stringifyJson(input.brief),
      workspaceData: stringifyJson({ ...workspace, status: "running" }),
    },
    include: {
      traceEvents: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function appendTraceEvent(input: {
  runId: string;
  stepIndex: number;
  phase: string;
  agentKey: string;
  label: string;
  status: string;
  summary: string;
  payload: unknown;
}) {
  return prisma.traceEvent.create({
    data: {
      runId: input.runId,
      stepIndex: input.stepIndex,
      phase: input.phase,
      agentKey: input.agentKey,
      label: input.label,
      status: input.status,
      summary: input.summary,
      payloadData: stringifyJson(input.payload),
    },
  });
}

export async function updateTripRun(
  runId: string,
  data: {
    status: string;
    workspace: TripWorkspace;
    modelName?: string;
    tripPlan?: TripPlan;
    quoteDraft?: QuoteDraft;
    campaignPack?: CampaignPack;
    errorMessage?: string | null;
    completed?: boolean;
  },
) {
  return prisma.tripRun.update({
    where: { id: runId },
    data: {
      status: data.status,
      modelName: data.modelName,
      workspaceData: stringifyJson(data.workspace),
      tripPlanData: data.tripPlan ? stringifyJson(data.tripPlan) : undefined,
      quoteData: data.quoteDraft ? stringifyJson(data.quoteDraft) : undefined,
      campaignData: data.campaignPack ? stringifyJson(data.campaignPack) : undefined,
      errorMessage: data.errorMessage,
      completedAt: data.completed ? new Date() : undefined,
    },
    include: {
      traceEvents: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getTripRun(runId: string) {
  const run = await prisma.tripRun.findUnique({
    where: { id: runId },
    include: {
      traceEvents: {
        orderBy: [{ stepIndex: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!run) {
    return null;
  }

  return mapRun(run);
}

export async function listLatestRuns(limit = 6) {
  const runs = await prisma.tripRun.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      traceEvents: {
        orderBy: [{ stepIndex: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return runs.map(mapRun);
}

export async function getDashboardData() {
  try {
    const [profile, briefs, runs] = await Promise.all([
      getAgencyProfile(),
      listDemoBriefs(),
      listLatestRuns(4),
    ]);

    return { profile, briefs, runs };
  } catch {
    return {
      profile: veloraProfile,
      briefs: demoBriefs,
      runs: [] as TripRunRecord[],
    };
  }
}
