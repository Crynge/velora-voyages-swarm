import { z } from "zod";

export const creativeDirectionSchema = z.object({
  summary: z.string(),
  brandPillars: z.array(z.string()),
  clientPromise: z.string(),
  heroNarrative: z.string(),
  socialAngle: z.string(),
  recommendedUpsells: z.array(z.string()),
});

export const researchDossierSchema = z.object({
  summary: z.string(),
  idealSeasonWindow: z.string(),
  destinationRationale: z.string(),
  visaNotes: z.string(),
  signatureExperiences: z.array(z.string()),
  neighborhoodTargets: z.array(z.string()),
  riskWatchouts: z.array(z.string()),
});

export const logisticsPlanSchema = z.object({
  summary: z.string(),
  flightStrategy: z.string(),
  stayStrategy: z.string(),
  transferPlan: z.string(),
  routingNotes: z.array(z.string()),
  hotelShortlist: z.array(
    z.object({
      name: z.string(),
      vibe: z.string(),
      nightlyUsd: z.number(),
      whyItFits: z.string(),
    }),
  ),
});

export const itinerarySchema = z.object({
  summary: z.string(),
  tripTitle: z.string(),
  overview: z.string(),
  days: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      morning: z.string(),
      afternoon: z.string(),
      evening: z.string(),
      stay: z.string(),
      highlight: z.string(),
    }),
  ),
  conciergeTouches: z.array(z.string()),
});

export const quoteDraftSchema = z.object({
  summary: z.string(),
  headline: z.string(),
  investmentRangeUsd: z.string(),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  emailDraft: z.string(),
  nextSteps: z.array(z.string()),
  upsellMenu: z.array(
    z.object({
      name: z.string(),
      priceEstimateUsd: z.number(),
      reason: z.string(),
    }),
  ),
});

export const campaignPackSchema = z.object({
  summary: z.string(),
  hookLine: z.string(),
  instagramCaptions: z.array(z.string()),
  tiktokHooks: z.array(z.string()),
  xThread: z.array(z.string()),
  linkedInPost: z.string(),
  landingPageBlurb: z.string(),
});

export const conciergeQaSchema = z.object({
  summary: z.string(),
  approved: z.boolean(),
  issues: z.array(z.string()),
  adjustments: z.array(z.string()),
  premiumCheck: z.string(),
});
