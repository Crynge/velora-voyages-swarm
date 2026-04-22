import Link from "next/link";

import { landingCampaignPreview } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import type { AgencyProfile, DemoBrief, TripRunRecord } from "@/types/travel";

const agents = [
  {
    name: "Creative Director",
    role: "Keeps every proposal premium, specific, and socially magnetic.",
  },
  {
    name: "Destination Researcher",
    role: "Maps the season, neighborhoods, friction points, and signature experiences.",
  },
  {
    name: "Flight & Stay Planner",
    role: "Designs the routing and hotel stack so the luxury never breaks.",
  },
  {
    name: "Itinerary Architect",
    role: "Turns raw intel into a day-by-day sequence with emotional pacing.",
  },
  {
    name: "Offer Composer",
    role: "Packages the trip into a quote, email, and close-ready proposal.",
  },
  {
    name: "Social Growth Producer",
    role: "Cuts the trip into captions, hooks, and launch copy that can travel on its own.",
  },
  {
    name: "Concierge QA",
    role: "Pressure-tests tone, feasibility, and spend before anything ships.",
  },
];

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 shadow-[0_18px_50px_rgba(10,12,16,0.2)] backdrop-blur">
      <div className="font-display text-4xl text-[color:var(--paper)]">{value}</div>
      <p className="mt-2 text-sm uppercase tracking-[0.25em] text-[color:var(--sand-muted)]">
        {label}
      </p>
    </div>
  );
}

export function LandingPage({
  profile,
  demoBriefs,
  recentRuns,
}: {
  profile: AgencyProfile;
  demoBriefs: DemoBrief[];
  recentRuns: TripRunRecord[];
}) {
  return (
    <main className="overflow-hidden">
      <section className="relative isolate border-b border-white/10 px-6 pb-18 pt-6 sm:px-10 lg:px-14 lg:pb-24 lg:pt-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-14">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-2xl text-[color:var(--paper)]">Velora Voyages Swarm</p>
              <p className="mt-2 max-w-xl text-sm text-[color:var(--sand-muted)]">
                A GitHub-ready travel agency demo where seven specialist agents turn a luxury brief into itinerary, quote, and launch content.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/control-room"
                className="rounded-full border border-[color:var(--champagne)]/30 bg-[color:var(--champagne)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--ink)] transition hover:-translate-y-0.5"
              >
                Open Control Room
              </Link>
              <a
                href="#quickstart"
                className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--paper)] transition hover:-translate-y-0.5"
              >
                5-Minute Setup
              </a>
            </div>
          </header>

          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="space-y-8">
              <div className="space-y-5">
                <p className="inline-flex rounded-full border border-[color:var(--copper)]/35 bg-[color:var(--copper)]/12 px-4 py-2 text-xs uppercase tracking-[0.34em] text-[color:var(--sand-muted)]">
                  Luxury-Adventure Agency Demo
                </p>
                <h1 className="font-display max-w-4xl text-6xl leading-[0.92] text-[color:var(--paper)] sm:text-7xl lg:text-[5.4rem]">
                  Build the travel repo people star, clone, and repost.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[color:var(--sand-muted)]">
                  {profile.tagline} This repo shows the whole stack: premium brand system, Ollama-powered orchestration, persistent run history, and a live control room that feels closer to a boutique concierge desk than a generic AI demo.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Metric value="7" label="Specialist Agents" />
                <Metric value="4" label="Public API Routes" />
                <Metric value="5 min" label="Clone to First Demo" />
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.34em] text-[color:var(--sand-muted)]">
                  Brand system
                </p>
                <div className="mt-4 grid gap-5 lg:grid-cols-[0.65fr_0.35fr]">
                  <div>
                    <p className="font-display text-3xl text-[color:var(--paper)]">{profile.name}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--sand-muted)]">
                      {profile.positioning}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {profile.signatureDestinations.slice(0, 6).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--paper)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--sand-muted)]">
                      Sample campaign hook
                    </p>
                    <p className="mt-4 font-display text-2xl leading-tight text-[color:var(--paper)]">
                      {landingCampaignPreview.hookLine}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--sand-muted)]">
                      {landingCampaignPreview.landingPageBlurb}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(4,6,10,0.35)] backdrop-blur">
              <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)]" />
              <p className="text-xs uppercase tracking-[0.34em] text-[color:var(--sand-muted)]">
                Viral demo loop
              </p>
              <ol className="mt-6 space-y-5 text-sm leading-7 text-[color:var(--paper)]">
                <li>
                  <span className="font-display text-2xl">01</span>
                  <p className="mt-2">Drop in a traveler brief or pick a seeded scenario like Maldives honeymoon.</p>
                </li>
                <li>
                  <span className="font-display text-2xl">02</span>
                  <p className="mt-2">Watch the agent swarm stream research, routing, itinerary, quoting, and growth copy live.</p>
                </li>
                <li>
                  <span className="font-display text-2xl">03</span>
                  <p className="mt-2">Open the final run page and export the itinerary as markdown or a browser-generated PDF.</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="section-kicker">Agent Team</p>
              <h2 className="section-title text-[color:var(--ink)]">A full travel agency profile, split into real roles.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
              Each agent receives structured context, writes back into the shared workspace, and leaves a trace the UI can replay or persist.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <article
                key={agent.name}
                className="rounded-[1.8rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)]/80 p-6 shadow-[0_20px_52px_rgba(10,12,16,0.08)]"
              >
                <p className="text-xs uppercase tracking-[0.34em] text-[color:var(--muted)]">Agent role</p>
                <h3 className="mt-4 font-display text-3xl text-[color:var(--ink)]">{agent.name}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--ink)]/76">{agent.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--ink)]/10 bg-[color:var(--paper)]/65 px-6 py-16 backdrop-blur sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="section-kicker">Seeded Scenarios</p>
            <h2 className="section-title text-[color:var(--ink)]">Prebuilt briefs that make the repo demoable on day one.</h2>
          </div>
          <div className="grid gap-4">
            {demoBriefs.map((item) => (
              <article
                key={item.slug}
                className="rounded-[1.7rem] border border-[color:var(--ink)]/10 bg-white p-5 shadow-[0_12px_34px_rgba(13,19,26,0.07)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl text-[color:var(--ink)]">{item.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--ink)]/74">{item.blurb}</p>
                  </div>
                  <div className="rounded-full border border-[color:var(--ink)]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    {formatCurrency(item.brief.budgetUsd)}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.brief.destinations.map((destination) => (
                    <span
                      key={destination}
                      className="rounded-full bg-[color:var(--sand)] px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--ink)]"
                    >
                      {destination}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="quickstart" className="px-6 py-16 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker">Quick Start</p>
            <h2 className="section-title text-[color:var(--ink)]">A repo designed to feel fast, generous, and easy to show off.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[color:var(--muted)]">
              The app uses Prisma + SQLite for persistence, Ollama’s OpenAI-compatible endpoint for model calls, and a built-in demo fallback so the UI is still usable while you finish connecting Kimi.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--ink)] px-6 py-7 text-[color:var(--paper)] shadow-[0_24px_60px_rgba(5,8,10,0.24)]">
            <p className="text-xs uppercase tracking-[0.34em] text-[color:var(--sand-muted)]">
              Terminal
            </p>
            <pre className="mt-5 overflow-x-auto text-sm leading-8 text-[color:var(--paper)]">
              <code>{`cp .env.example .env
npm install
npm run db:setup
npm run dev`}</code>
            </pre>
            <p className="mt-5 text-sm leading-7 text-[color:var(--sand-muted)]">
              Default model: <code>kimi-k2.6:cloud</code>. Fallback model: <code>qwen3.5:latest</code>. If both are unavailable, the repo can still demo with a built-in structured mock path.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-18 sm:px-10 lg:px-14 lg:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)] p-6 shadow-[0_18px_40px_rgba(13,19,26,0.08)]">
            <p className="section-kicker">Recent Runs</p>
            <h2 className="section-title text-[color:var(--ink)]">Persisted outputs turn demos into proof.</h2>
            <div className="mt-6 grid gap-4">
              {recentRuns.length > 0 ? (
                recentRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/runs/${run.id}`}
                    className="rounded-[1.6rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/75 p-5 transition hover:-translate-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">{run.status}</p>
                        <h3 className="mt-3 font-display text-3xl text-[color:var(--ink)]">{run.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--ink)]/72">
                          {run.quoteDraft?.headline ?? run.workspace.qaReport?.summary ?? "Run trace available"}
                        </p>
                      </div>
                      <span className="rounded-full border border-[color:var(--ink)]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                        {run.modelName}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.6rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/70 p-5 text-sm leading-7 text-[color:var(--ink)]/76">
                  No runs yet. Open the control room, load a seeded brief, and launch the swarm to populate this feed.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[color:var(--ink)] p-6 text-[color:var(--paper)] shadow-[0_24px_60px_rgba(4,6,10,0.24)]">
            <p className="section-kicker text-[color:var(--sand-muted)]">Why It Goes Viral</p>
            <h2 className="font-display text-5xl leading-tight">It looks like a product, not a weekend hack.</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-[color:var(--sand-muted)]">
              <li>Premium editorial design direction instead of generic dashboard chrome.</li>
              <li>Agent traces that make the intelligence visible and replayable.</li>
              <li>Seeded travel scenarios that instantly tell a story on socials, demos, and README screenshots.</li>
              <li>Persistent outputs you can open, print, and share after each run.</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/control-room"
                className="rounded-full border border-[color:var(--champagne)]/25 bg-[color:var(--champagne)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--ink)] transition hover:-translate-y-0.5"
              >
                Launch The Demo
              </Link>
              <a
                href="https://ollama.com/library/kimi-k2.6"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--paper)] transition hover:-translate-y-0.5"
              >
                Kimi on Ollama
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
