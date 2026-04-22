export type AgentKey =
  | "creative-director"
  | "destination-researcher"
  | "flight-stay-planner"
  | "itinerary-architect"
  | "offer-composer"
  | "social-growth-producer"
  | "concierge-qa";

export interface BudgetBand {
  label: string;
  minUsd: number;
  maxUsd: number;
  signatureServices: string[];
}

export interface AgencyProfile {
  version: number;
  slug: string;
  name: string;
  tagline: string;
  positioning: string;
  voice: {
    tone: string[];
    bannedPhrases: string[];
    promise: string;
  };
  signatureDestinations: string[];
  specialties: string[];
  budgetBands: BudgetBand[];
  policies: string[];
  upsells: string[];
  exclusions: string[];
  visualDirection: {
    palette: string[];
    typography: string;
    texture: string;
  };
}

export interface DemoBrief {
  slug: string;
  title: string;
  blurb: string;
  brief: TravelerBrief;
}

export interface TravelerBrief {
  clientName: string;
  occasion: string;
  travelers: string;
  origin: string;
  travelMonth: string;
  durationNights: number;
  budgetUsd: number;
  destinations: string[];
  priorities: string[];
  avoid: string[];
  style: string;
  notes: string;
}

export interface CreativeDirection {
  summary: string;
  brandPillars: string[];
  clientPromise: string;
  heroNarrative: string;
  socialAngle: string;
  recommendedUpsells: string[];
}

export interface ResearchDossier {
  summary: string;
  idealSeasonWindow: string;
  destinationRationale: string;
  visaNotes: string;
  signatureExperiences: string[];
  neighborhoodTargets: string[];
  riskWatchouts: string[];
}

export interface HotelRecommendation {
  name: string;
  vibe: string;
  nightlyUsd: number;
  whyItFits: string;
}

export interface LogisticsPlan {
  summary: string;
  flightStrategy: string;
  stayStrategy: string;
  transferPlan: string;
  routingNotes: string[];
  hotelShortlist: HotelRecommendation[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
  highlight: string;
}

export interface TripPlan {
  tripTitle: string;
  overview: string;
  days: ItineraryDay[];
  conciergeTouches: string[];
  logisticsSummary: string[];
  researchHighlights: string[];
  markdown: string;
}

export interface QuoteUpsell {
  name: string;
  priceEstimateUsd: number;
  reason: string;
}

export interface QuoteDraft {
  summary: string;
  headline: string;
  investmentRangeUsd: string;
  inclusions: string[];
  exclusions: string[];
  emailDraft: string;
  nextSteps: string[];
  upsellMenu: QuoteUpsell[];
}

export interface CampaignPack {
  summary: string;
  hookLine: string;
  instagramCaptions: string[];
  tiktokHooks: string[];
  xThread: string[];
  linkedInPost: string;
  landingPageBlurb: string;
}

export interface ConciergeQAReport {
  summary: string;
  approved: boolean;
  issues: string[];
  adjustments: string[];
  premiumCheck: string;
}

export interface TripWorkspace {
  status: "idle" | "running" | "needs_revision" | "completed" | "failed";
  profileSlug: string;
  travelerBrief: TravelerBrief;
  notices: string[];
  creativeDirection?: CreativeDirection;
  researchDossier?: ResearchDossier;
  logisticsPlan?: LogisticsPlan;
  tripPlan?: TripPlan;
  quoteDraft?: QuoteDraft;
  campaignPack?: CampaignPack;
  qaReport?: ConciergeQAReport;
}

export interface RunTrace {
  id: string;
  runId: string;
  stepIndex: number;
  phase: string;
  agentKey: AgentKey | "system";
  label: string;
  status: string;
  summary: string;
  payload: unknown;
  createdAt: string;
}

export interface TripRunRecord {
  id: string;
  title: string;
  status: string;
  modelName: string;
  profileSlug: string;
  travelerBrief: TravelerBrief;
  workspace: TripWorkspace;
  tripPlan?: TripPlan;
  quoteDraft?: QuoteDraft;
  campaignPack?: CampaignPack;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  traceEvents: RunTrace[];
}

export interface HealthStatus {
  ok: boolean;
  activeModel: string;
  availableModels: string[];
  baseUrl: string;
  message: string;
}

export type StreamEvent =
  | {
      type: "run.created";
      runId: string;
      title: string;
      modelName: string;
    }
  | {
      type: "run.notice";
      runId: string;
      level: "info" | "warn";
      message: string;
    }
  | {
      type: "agent.started";
      runId: string;
      stepIndex: number;
      agentKey: AgentKey;
      label: string;
    }
  | {
      type: "agent.completed";
      runId: string;
      stepIndex: number;
      agentKey: AgentKey;
      label: string;
      summary: string;
      payload: unknown;
      modelName: string;
    }
  | {
      type: "run.completed";
      runId: string;
      run: TripRunRecord;
    }
  | {
      type: "run.failed";
      runId: string;
      message: string;
    };
