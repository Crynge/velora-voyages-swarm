"use client";

import Link from "next/link";
import { useEffect, useDeferredValue, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { RunTrace } from "@/components/run-trace";
import { formatCurrency } from "@/lib/utils";
import type { DemoBrief, HealthStatus, StreamEvent, TripRunRecord } from "@/types/travel";

type FormState = {
  clientName: string;
  occasion: string;
  travelers: string;
  origin: string;
  travelMonth: string;
  durationNights: number;
  budgetUsd: number;
  destinations: string;
  priorities: string;
  avoid: string;
  style: string;
  notes: string;
};

function briefToForm(brief: DemoBrief["brief"]): FormState {
  return {
    clientName: brief.clientName,
    occasion: brief.occasion,
    travelers: brief.travelers,
    origin: brief.origin,
    travelMonth: brief.travelMonth,
    durationNights: brief.durationNights,
    budgetUsd: brief.budgetUsd,
    destinations: brief.destinations.join(", "),
    priorities: brief.priorities.join(", "),
    avoid: brief.avoid.join(", "),
    style: brief.style,
    notes: brief.notes,
  };
}

function formToPayload(form: FormState) {
  return {
    clientName: form.clientName,
    occasion: form.occasion,
    travelers: form.travelers,
    origin: form.origin,
    travelMonth: form.travelMonth,
    durationNights: Number(form.durationNights),
    budgetUsd: Number(form.budgetUsd),
    destinations: form.destinations.split(",").map((value) => value.trim()).filter(Boolean),
    priorities: form.priorities.split(",").map((value) => value.trim()).filter(Boolean),
    avoid: form.avoid.split(",").map((value) => value.trim()).filter(Boolean),
    style: form.style,
    notes: form.notes,
  };
}

export function ControlRoom({
  agencyName,
  initialDemoBriefs,
  initialRuns,
}: {
  agencyName: string;
  initialDemoBriefs: DemoBrief[];
  initialRuns: TripRunRecord[];
}) {
  const router = useRouter();
  const [demoBriefs, setDemoBriefs] = useState(initialDemoBriefs);
  const [recentRuns, setRecentRuns] = useState(initialRuns);
  const [selectedDemo, setSelectedDemo] = useState(initialDemoBriefs[0]?.slug ?? "");
  const [form, setForm] = useState<FormState>(() =>
    briefToForm(initialDemoBriefs[0]?.brief ?? initialDemoBriefs.at(0)!.brief),
  );
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const deferredEvents = useDeferredValue(events);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [activeRun, setActiveRun] = useState<TripRunRecord | null>(initialRuns[0] ?? null);
  const [streaming, setStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const traceShellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/health/ollama")
      .then((response) => response.json())
      .then((value: HealthStatus) => setHealth(value))
      .catch(() =>
        setHealth({
          ok: false,
          activeModel: "kimi-k2.6:cloud",
          availableModels: [],
          baseUrl: "http://localhost:11434/v1",
          message: "Unable to reach the Ollama health route.",
        }),
      );
  }, []);

  useEffect(() => {
    const node = traceShellRef.current;

    if (!node) {
      return;
    }

    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth",
    });
  }, [deferredEvents.length]);

  function loadDemo(slug: string) {
    const nextBrief = demoBriefs.find((item) => item.slug === slug);

    if (!nextBrief) {
      return;
    }

    setSelectedDemo(slug);
    setForm(briefToForm(nextBrief.brief));
    setErrorMessage(null);
  }

  async function resetDemo() {
    setErrorMessage(null);

    const response = await fetch("/api/demo/reset", {
      method: "POST",
    });

    if (!response.ok) {
      setErrorMessage("Unable to reset the demo data.");
      return;
    }

    const payload = await response.json();
    setDemoBriefs(payload.demoBriefs);
    setRecentRuns(payload.runs);

    if (payload.demoBriefs[0]) {
      setSelectedDemo(payload.demoBriefs[0].slug);
      setForm(briefToForm(payload.demoBriefs[0].brief));
    }

    router.refresh();
  }

  async function submitRun(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStreaming(true);
    setErrorMessage(null);
    setEvents([]);

    const response = await fetch("/api/trips/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brief: formToPayload(form),
      }),
    });

    if (!response.ok || !response.body) {
      setStreaming(false);
      setErrorMessage("The travel swarm endpoint did not return a readable stream.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const parsed = JSON.parse(line) as StreamEvent;

        startTransition(() => {
          setEvents((current) => [...current, parsed]);
        });

        if (parsed.type === "run.completed") {
          setActiveRun(parsed.run);
          setRecentRuns((current) => [parsed.run, ...current.filter((item) => item.id !== parsed.run.id)].slice(0, 6));
          router.refresh();
        }

        if (parsed.type === "run.failed") {
          setErrorMessage(parsed.message);
        }
      }
    }

    setStreaming(false);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)]/85 p-6 shadow-[0_22px_56px_rgba(12,17,22,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Agency Control Room</p>
            <h1 className="section-title text-[color:var(--ink)]">Drive the {agencyName} swarm from one brief.</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              void resetDemo();
            }}
            className="rounded-full border border-[color:var(--ink)]/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)] transition hover:-translate-y-0.5"
          >
            Reset Demo
          </button>
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/55 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">Ollama status</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                health?.ok
                  ? "bg-[color:var(--pine)] text-[color:var(--paper)]"
                  : "bg-[color:var(--ember)] text-[color:var(--paper)]"
              }`}
            >
              {health?.ok ? "Live" : "Needs Attention"}
            </span>
            <span className="rounded-full border border-[color:var(--ink)]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
              {health?.activeModel ?? "kimi-k2.6:cloud"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink)]/74">
            {health?.message ?? "Checking Ollama health..."}
          </p>
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Seeded demo briefs</p>
          <div className="mt-4 space-y-3">
            {demoBriefs.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => loadDemo(item.slug)}
                className={`w-full rounded-[1.4rem] border p-4 text-left transition ${
                  selectedDemo === item.slug
                    ? "border-[color:var(--pine)]/35 bg-[color:var(--pine)]/8"
                    : "border-[color:var(--ink)]/10 bg-white hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl text-[color:var(--ink)]">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--ink)]/72">{item.blurb}</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--sand)] px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--ink)]">
                    {formatCurrency(item.brief.budgetUsd)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={submitRun}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field-shell">
              <span>Client Name</span>
              <input value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} />
            </label>
            <label className="field-shell">
              <span>Occasion</span>
              <input value={form.occasion} onChange={(event) => setForm({ ...form, occasion: event.target.value })} />
            </label>
            <label className="field-shell">
              <span>Travelers</span>
              <input value={form.travelers} onChange={(event) => setForm({ ...form, travelers: event.target.value })} />
            </label>
            <label className="field-shell">
              <span>Origin</span>
              <input value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
            </label>
            <label className="field-shell">
              <span>Travel Month</span>
              <input value={form.travelMonth} onChange={(event) => setForm({ ...form, travelMonth: event.target.value })} />
            </label>
            <label className="field-shell">
              <span>Duration (nights)</span>
              <input
                type="number"
                min={3}
                max={21}
                value={form.durationNights}
                onChange={(event) => setForm({ ...form, durationNights: Number(event.target.value) })}
              />
            </label>
            <label className="field-shell md:col-span-2">
              <span>Budget (USD)</span>
              <input
                type="number"
                min={5000}
                max={200000}
                value={form.budgetUsd}
                onChange={(event) => setForm({ ...form, budgetUsd: Number(event.target.value) })}
              />
            </label>
            <label className="field-shell md:col-span-2">
              <span>Destinations (comma separated)</span>
              <input value={form.destinations} onChange={(event) => setForm({ ...form, destinations: event.target.value })} />
            </label>
            <label className="field-shell md:col-span-2">
              <span>Priorities (comma separated)</span>
              <input value={form.priorities} onChange={(event) => setForm({ ...form, priorities: event.target.value })} />
            </label>
            <label className="field-shell md:col-span-2">
              <span>Avoid (comma separated)</span>
              <input value={form.avoid} onChange={(event) => setForm({ ...form, avoid: event.target.value })} />
            </label>
            <label className="field-shell md:col-span-2">
              <span>Style Direction</span>
              <input value={form.style} onChange={(event) => setForm({ ...form, style: event.target.value })} />
            </label>
            <label className="field-shell md:col-span-2">
              <span>Notes</span>
              <textarea
                rows={5}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={streaming}
              className="rounded-full border border-[color:var(--pine)]/24 bg-[color:var(--pine)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--paper)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {streaming ? "Running Swarm" : "Launch Swarm"}
            </button>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
              {streaming ? "Streaming agent trace..." : "Structured JSON flow via Ollama"}
            </p>
          </div>

          {errorMessage ? (
            <div className="rounded-[1.4rem] border border-[color:var(--ember)]/25 bg-[color:var(--ember)]/8 p-4 text-sm leading-7 text-[color:var(--ink)]">
              {errorMessage}
            </div>
          ) : null}
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-[color:var(--ink)] p-6 text-[color:var(--paper)] shadow-[0_28px_72px_rgba(4,6,10,0.28)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker text-[color:var(--sand-muted)]">Live Trace</p>
              <h2 className="font-display text-5xl leading-tight">Watch the team work in public.</h2>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--sand-muted)]">
              {events.length} events
            </div>
          </div>
          <div ref={traceShellRef} className="mt-6 max-h-[32rem] overflow-y-auto pr-1">
            <RunTrace events={deferredEvents} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)] p-6 shadow-[0_18px_42px_rgba(12,17,22,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Current Delivery</p>
                <h2 className="section-title text-[color:var(--ink)]">Latest completed run</h2>
              </div>
              {activeRun ? (
                <Link
                  href={`/runs/${activeRun.id}`}
                  className="rounded-full border border-[color:var(--ink)]/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)] transition hover:-translate-y-0.5"
                >
                  Open Run
                </Link>
              ) : null}
            </div>

            {activeRun ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/65 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">{activeRun.status}</p>
                  <h3 className="mt-3 font-display text-3xl text-[color:var(--ink)]">{activeRun.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]/76">
                    {activeRun.tripPlan?.overview ?? activeRun.workspace.qaReport?.summary}
                  </p>
                </div>
                <div className="grid gap-4">
                  <article className="rounded-[1.5rem] border border-[color:var(--ink)]/10 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Quote Headline</p>
                    <p className="mt-3 font-display text-2xl text-[color:var(--ink)]">
                      {activeRun.quoteDraft?.headline ?? "Awaiting final proposal"}
                    </p>
                  </article>
                  <article className="rounded-[1.5rem] border border-[color:var(--ink)]/10 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Campaign Hook</p>
                    <p className="mt-3 font-display text-2xl text-[color:var(--ink)]">
                      {activeRun.campaignPack?.hookLine ?? "Campaign pack will appear after the run."}
                    </p>
                  </article>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/55 p-5 text-sm leading-7 text-[color:var(--ink)]/76">
                No completed runs yet. Launch one from the left-hand brief form to generate the first itinerary package.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)] p-6 shadow-[0_18px_42px_rgba(12,17,22,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Run Archive</p>
                <h2 className="section-title text-[color:var(--ink)]">Persistent outputs for demos and screenshots</h2>
              </div>
              {isPending ? (
                <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Updating</span>
              ) : null}
            </div>
            <div className="mt-6 space-y-3">
              {recentRuns.length > 0 ? (
                recentRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/runs/${run.id}`}
                    className="block rounded-[1.4rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/55 p-4 transition hover:-translate-y-0.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">{run.modelName}</p>
                        <h3 className="mt-2 font-display text-2xl text-[color:var(--ink)]">{run.title}</h3>
                      </div>
                      <span className="rounded-full border border-[color:var(--ink)]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                        {run.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/55 p-4 text-sm leading-7 text-[color:var(--ink)]/76">
                  Persisted runs will appear here after the first successful demo.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
