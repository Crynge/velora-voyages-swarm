import { veloraProfile } from "@/lib/demo-data";
import { formatCurrency, sentenceList } from "@/lib/utils";
import type {
  CampaignPack,
  ConciergeQAReport,
  CreativeDirection,
  LogisticsPlan,
  QuoteDraft,
  ResearchDossier,
  TravelerBrief,
  TripPlan,
} from "@/types/travel";

function destinationWord(brief: TravelerBrief) {
  return brief.destinations[0] ?? veloraProfile.signatureDestinations[0];
}

export function mockCreativeDirection(brief: TravelerBrief): CreativeDirection {
  const destination = destinationWord(brief);

  return {
    summary: `Frame the ${destination} proposal as a premium ${brief.occasion} story with tactile romance and calm confidence.`,
    brandPillars: ["editorial taste", "ease without blandness", "memorable reveal moments"],
    clientPromise:
      "Every move should feel tailored, photogenic, and deeply well-paced from arrival to final send-off.",
    heroNarrative: `Build the trip around ${sentenceList(brief.priorities.slice(0, 3))} so the client feels they stepped into a travel editorial rather than a package.`,
    socialAngle:
      "Position the itinerary as the kind of insider-planned route followers assume required a private black book.",
    recommendedUpsells: veloraProfile.upsells.slice(0, 3),
  };
}

export function mockResearchDossier(brief: TravelerBrief): ResearchDossier {
  const destination = destinationWord(brief);

  return {
    summary: `${destination} is strongest when we keep the pace selective, protect recovery time, and make every signature experience feel earned.`,
    idealSeasonWindow: `${brief.travelMonth} is workable for ${destination}, with the itinerary tuned around the best light, sea conditions, and premium inventory windows.`,
    destinationRationale: `This route fits ${brief.style} travelers because it blends ${sentenceList(brief.priorities.slice(0, 2))} with a sense of place that feels more bespoke than checklist-driven.`,
    visaNotes:
      "Flag entry requirements early, confirm passport validity buffers, and package any fast-track arrival handling as a premium operational advantage.",
    signatureExperiences: [
      "golden-hour private excursion with photographer-ready timing",
      "chef-led tasting with contextual storytelling",
      "one low-friction surprise designed for social impact",
    ],
    neighborhoodTargets: [
      "the most design-forward stay zone",
      "a quieter enclave for recovery nights",
      "one area with effortless access to signature experiences",
    ],
    riskWatchouts: [
      "avoid overstuffing the middle nights",
      "protect against long transfer fatigue",
      "be explicit about what is and is not included",
    ],
  };
}

export function mockLogisticsPlan(brief: TravelerBrief): LogisticsPlan {
  const destination = destinationWord(brief);
  const budgetBand = brief.budgetUsd > 38000 ? 2400 : brief.budgetUsd > 22000 ? 1600 : 980;

  return {
    summary: `Prioritize smooth routing into ${destination} and keep transfers elegant enough that the premium tone never breaks.`,
    flightStrategy:
      "Aim for the cleanest business-class path with a sensible arrival hour, then protect the first 24 hours with low-friction pacing.",
    stayStrategy:
      "Anchor the trip with one hero property and one optional contrast stay so the trip feels layered rather than repetitive.",
    transferPlan:
      "Bundle all ground and inter-island or intra-city movement into concierge-managed handoffs with minimal self-navigation.",
    routingNotes: [
      "Front-load one spectacular arrival moment.",
      "Save the most photogenic night for the emotional midpoint.",
      "Keep departure day gentle and operationally conservative.",
    ],
    hotelShortlist: [
      {
        name: `${destination} Atelier Retreat`,
        vibe: "quiet luxury with cinematic light",
        nightlyUsd: budgetBand,
        whyItFits: "Balances privacy, design credibility, and strong service recovery.",
      },
      {
        name: `${destination} Horizon House`,
        vibe: "socially magnetic with a premium club energy",
        nightlyUsd: budgetBand + 280,
        whyItFits: "Gives the trip one high-impact setting for content and celebration.",
      },
    ],
  };
}

export function mockTripPlan(brief: TravelerBrief, logistics: LogisticsPlan, research: ResearchDossier): TripPlan {
  const days = Array.from({ length: Math.max(brief.durationNights, 4) }, (_, index) => ({
    day: index + 1,
    title:
      index === 0
        ? "Arrival and atmospheric reset"
        : index === brief.durationNights - 1
          ? "Soft landing into departure"
          : `Signature day ${index}`,
    morning:
      index === 0
        ? "Private arrival, in-suite check-in, and time to decompress."
        : "A guided or self-paced morning that leans into the client's top priority.",
    afternoon:
      index % 2 === 0
        ? "A design-conscious excursion with generous breathing room."
        : "A long lunch and curated discovery session tied to local culture.",
    evening:
      index === Math.floor(brief.durationNights / 2)
        ? "The itinerary's emotional peak: a surprise premium moment built for memory and content."
        : "An elegant dinner rhythm with strong atmosphere and zero rush.",
    stay: logistics.hotelShortlist[index % logistics.hotelShortlist.length]?.name ?? "Velora partner stay",
    highlight:
      index === 0
        ? "First-impression hospitality"
        : research.signatureExperiences[index % research.signatureExperiences.length] ?? "signature experience",
  }));

  const markdown = [
    `# ${brief.destinations.join(" + ")} ${brief.occasion}`,
    "",
    `## Overview`,
    `A ${brief.durationNights}-night plan shaped around ${sentenceList(brief.priorities)}.`,
    "",
    `## Daily Flow`,
    ...days.flatMap((day) => [
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
    tripTitle: `${brief.destinations.join(" + ")} ${brief.occasion} designed by Velora Voyages`,
    overview:
      "A premium, low-friction journey designed to feel intentional from the first arrival ritual to the final departure handoff.",
    days,
    conciergeTouches: [
      "arrival amenity timed to the client's occasion",
      "one private after-hours or low-crowd access moment",
      "departure-day comfort plan with lounge and transfer buffering",
    ],
    logisticsSummary: [logistics.flightStrategy, logistics.transferPlan],
    researchHighlights: [research.destinationRationale, research.idealSeasonWindow],
    markdown,
  };
}

export function mockQuoteDraft(brief: TravelerBrief): QuoteDraft {
  const low = Math.max(Math.round(brief.budgetUsd * 0.9), 12000);
  const high = Math.round(brief.budgetUsd * 1.08);

  return {
    summary: "The quote balances high-touch logistics with one or two emotionally memorable splurges.",
    headline: `A concierge-built ${brief.occasion} route priced for premium clarity`,
    investmentRangeUsd: `${formatCurrency(low)} - ${formatCurrency(high)}`,
    inclusions: [
      "accommodation with breakfast where meaningful",
      "private ground logistics",
      "selected guides, tastings, or signature experiences",
      "Velora pre-departure concierge support",
    ],
    exclusions: ["international airfare unless confirmed separately", "travel insurance", "unlisted personal spend"],
    emailDraft: `Hi ${brief.clientName},\n\nWe've shaped a ${brief.style} journey that keeps ${sentenceList(brief.priorities.slice(0, 3))} at the center while protecting the effortless feel you asked for. The attached concept stays premium without feeling bloated, and we've kept the logistics polished enough that the trip reads as seamless from day one.\n\nIf you'd like, we can hold the hero property and move into confirmation next.\n\nWarmly,\nVelora Voyages`,
    nextSteps: [
      "approve direction and preferred property tier",
      "confirm any must-have dining or celebration moments",
      "lock inventory with deposits",
    ],
    upsellMenu: [
      {
        name: "Sunset charter moment",
        priceEstimateUsd: 2200,
        reason: "Adds cinematic payoff without changing the routing.",
      },
      {
        name: "Private photo session",
        priceEstimateUsd: 900,
        reason: "Turns the trip into evergreen content and keepsakes.",
      },
    ],
  };
}

export function mockCampaignPack(brief: TravelerBrief, plan: TripPlan): CampaignPack {
  return {
    summary: "Social-first cutdowns built from the trip's strongest visual moments and emotional hooks.",
    hookLine: `The ${brief.occasion} itinerary that looks impossible until you see the planning system behind it.`,
    instagramCaptions: [
      `A ${brief.style} ${brief.occasion} through ${brief.destinations.join(" + ")} without one wasted transfer.`,
      `Built for ${sentenceList(brief.priorities.slice(0, 3))}, edited like a magazine spread, run like a concierge desk.`,
    ],
    tiktokHooks: [
      "How an AI travel swarm built this luxury itinerary in minutes",
      `The one routing choice that made this ${brief.destinations[0]} trip feel twice as premium`,
    ],
    xThread: [
      `We gave a travel-agent swarm this brief: ${brief.destinations.join(" + ")}, ${brief.durationNights} nights, ${formatCurrency(brief.budgetUsd)}.`,
      "It split the work across research, logistics, itinerary, quoting, and growth content.",
      `The final trip title: ${plan.tripTitle}.`,
    ],
    linkedInPost:
      "Travel planning gets much more compelling when the same system that builds the itinerary also packages the story, the offer, and the launch-ready content.",
    landingPageBlurb:
      "A coordinated luxury-travel workflow that turns a brief into plan, quote, and campaign without losing taste.",
  };
}

export function mockQaReport(brief: TravelerBrief): ConciergeQAReport {
  const approved = brief.budgetUsd >= 15000;

  return {
    summary: approved
      ? "The proposal holds its premium promise and the pacing feels defensibly luxurious."
      : "The concept is strong, but the quote needs trimming or a narrower scope to stay credible.",
    approved,
    issues: approved
      ? ["No blocking concerns."]
      : ["Budget pressure is too high for the requested scope and service level."],
    adjustments: approved
      ? ["Tighten the hero property rationale in the client-facing copy."]
      : ["Reduce inter-property movement or downgrade one signature add-on."],
    premiumCheck:
      "The trip must feel exact and unhurried; luxury is lost the moment the routing feels like a spreadsheet.",
  };
}
