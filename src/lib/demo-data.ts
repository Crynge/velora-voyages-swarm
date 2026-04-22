import type {
  AgencyProfile,
  CampaignPack,
  DemoBrief,
  TravelerBrief,
} from "@/types/travel";

export const veloraProfile: AgencyProfile = {
  version: 1,
  slug: "velora-voyages",
  name: "Velora Voyages",
  tagline: "Luxury-adventure itineraries with cinematic taste and concierge precision.",
  positioning:
    "Velora Voyages designs premium bucket-list escapes for clients who want emotional storytelling, smooth logistics, and brag-worthy social moments.",
  voice: {
    tone: ["editorial", "lush", "assured", "concierge-sharp"],
    bannedPhrases: ["cheap deal", "budget hack", "basic package", "once-in-a-lifetime at low cost"],
    promise:
      "Every plan should feel like a sharply edited travel magazine feature backed by meticulous operator detail.",
  },
  signatureDestinations: [
    "Maldives",
    "Kenya",
    "Zanzibar",
    "Japan",
    "Patagonia",
    "French Polynesia",
  ],
  specialties: [
    "honeymoon architecture",
    "safari + coast combinations",
    "food-and-design journeys",
    "premium small-group adventures",
  ],
  budgetBands: [
    {
      label: "Private Escape",
      minUsd: 12000,
      maxUsd: 22000,
      signatureServices: ["boutique hotels", "private transfers", "signature dining"],
    },
    {
      label: "Concierge Gold",
      minUsd: 22000,
      maxUsd: 42000,
      signatureServices: ["villa stays", "VIP arrival handling", "private guides"],
    },
    {
      label: "Iconic Ultra",
      minUsd: 42000,
      maxUsd: 90000,
      signatureServices: ["helicopter or seaplane touches", "charter moments", "white-glove pacing"],
    },
  ],
  policies: [
    "Never recommend itinerary pacing that leaves clients feeling scheduled instead of spoiled.",
    "Keep every proposal honest about exclusions, flight classes, and transfer complexity.",
    "Default to premium but defend value with specificity rather than hype.",
  ],
  upsells: [
    "private photography session",
    "sunset yacht charter",
    "chef-led tasting menu",
    "villa upgrade with plunge pool",
  ],
  exclusions: [
    "mass-market package tours",
    "red-eye-heavy routing without recovery time",
    "generic copy with no destination specificity",
  ],
  visualDirection: {
    palette: ["sandstone", "deep ink", "sea pine", "sunset copper", "champagne gold"],
    typography: "Bodoni Moda headlines with Manrope body copy.",
    texture: "Sun-faded paper, brushed metallic lines, and high-contrast editorial spacing.",
  },
};

const maldivesBrief: TravelerBrief = {
  clientName: "Avery & Jordan",
  occasion: "honeymoon",
  travelers: "couple",
  origin: "San Francisco",
  travelMonth: "November",
  durationNights: 7,
  budgetUsd: 28000,
  destinations: ["Maldives"],
  priorities: ["water villa", "slow luxury", "private dining", "spa", "sunset photos"],
  avoid: ["long property transfers", "family-heavy resorts"],
  style: "cinematic and intimate",
  notes:
    "They want the trip to feel calm, design-led, and deeply romantic, with one standout surprise night.",
};

const kenyaZanzibarBrief: TravelerBrief = {
  clientName: "The Mercer Family",
  occasion: "milestone celebration",
  travelers: "family of four with two teens",
  origin: "New York City",
  travelMonth: "July",
  durationNights: 10,
  budgetUsd: 46000,
  destinations: ["Kenya", "Zanzibar"],
  priorities: ["wildlife", "beach recovery", "photography", "private guide", "light adventure"],
  avoid: ["too many lodge changes", "overnight layovers"],
  style: "bold but polished",
  notes:
    "The parents care about conservation credibility while the teens want a trip that feels worth posting.",
};

const japanBrief: TravelerBrief = {
  clientName: "Nadia Chen",
  occasion: "birthday trip",
  travelers: "solo traveler",
  origin: "Los Angeles",
  travelMonth: "April",
  durationNights: 8,
  budgetUsd: 19000,
  destinations: ["Tokyo", "Kyoto"],
  priorities: ["architecture", "tasting menus", "fashion", "quiet luxury", "photo-worthy cafes"],
  avoid: ["rushed city hopping", "tour bus energy"],
  style: "design-forward and quietly exclusive",
  notes:
    "She wants a trip that feels like a magazine editor's personal black book instead of a standard Japan checklist.",
};

export const demoBriefs: DemoBrief[] = [
  {
    slug: "maldives-honeymoon",
    title: "Maldives Honeymoon",
    blurb: "Water-villa romance with just enough ceremony and spectacle to make the reel explode.",
    brief: maldivesBrief,
  },
  {
    slug: "kenya-zanzibar-luxury-adventure",
    title: "Kenya + Zanzibar Luxury Adventure",
    blurb: "Safari drama up front, Indian Ocean exhale on the back half, tuned for a family that wants style and substance.",
    brief: kenyaZanzibarBrief,
  },
  {
    slug: "japan-food-design-escape",
    title: "Japan Food-and-Design Escape",
    blurb: "A visually exacting solo journey through Tokyo and Kyoto with private tastings, refined retail, and architecture worth slowing down for.",
    brief: japanBrief,
  },
];

export const landingCampaignPreview: CampaignPack = {
  summary: "A social pack built to make the itinerary feel shareable before the bags are packed.",
  hookLine: "The itinerary your followers think was impossible to book.",
  instagramCaptions: [
    "Checked into the kind of villa that makes your camera roll look sponsored.",
    "Safari at dawn, spice-scented coastline by sunset, no compromises in between.",
  ],
  tiktokHooks: [
    "POV: your travel agent built a honeymoon like a film set.",
    "Three reasons this Kenya + Zanzibar route crushes the usual luxury vacation.",
  ],
  xThread: [
    "We asked a seven-agent travel swarm to build a luxury-adventure itinerary.",
    "It returned routing, pricing, social hooks, and a client-ready proposal in one run.",
    "This is what 'travel agency as product demo' should look like.",
  ],
  linkedInPost:
    "Luxury travel agencies are sitting on a storytelling advantage. This repo turns a premium itinerary workflow into a fully demoable, team-based agent system powered by Ollama and Kimi.",
  landingPageBlurb:
    "Turn premium travel briefs into itinerary, quote, and launch-ready content with an AI team that behaves like a modern concierge desk.",
};
