import Link from "next/link";
import { notFound } from "next/navigation";

import { ExportActions } from "@/components/export-actions";
import { RunTrace } from "@/components/run-trace";
import { getTripRun } from "@/lib/repository";
import type { AgentKey, StreamEvent } from "@/types/travel";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getTripRun(id);

  if (!run) {
    notFound();
  }

  const traceEvents: StreamEvent[] = run.traceEvents.map((event) => {
    if (event.phase === "system" && event.status === "failed") {
      return {
        type: "run.failed",
        runId: event.runId,
        message: event.summary,
      };
    }

    if (event.phase === "system") {
      return {
        type: "run.notice",
        runId: event.runId,
        level: "info",
        message: event.summary,
      };
    }

    if (event.status === "started") {
      return {
        type: "agent.started",
        runId: event.runId,
        stepIndex: event.stepIndex,
        agentKey: event.agentKey as AgentKey,
        label: event.label,
      };
    }

    return {
      type: "agent.completed",
      runId: event.runId,
      stepIndex: event.stepIndex,
      agentKey: event.agentKey as AgentKey,
      label: event.label,
      summary: event.summary,
      payload: event.payload,
      modelName: run.modelName,
    };
  });

  return (
    <main className="px-6 py-6 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="no-print flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-kicker">Run Detail</p>
            <h1 className="section-title text-[color:var(--paper)]">{run.title}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/control-room"
              className="rounded-full border border-white/12 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--paper)] transition hover:-translate-y-0.5"
            >
              Open Control Room
            </Link>
            <ExportActions markdown={run.tripPlan?.markdown ?? ""} tripTitle={run.tripPlan?.tripTitle ?? run.title} />
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)] p-6 shadow-[0_22px_56px_rgba(10,12,16,0.08)]">
            <p className="section-kicker">Itinerary</p>
            <h2 className="section-title text-[color:var(--ink)]">{run.tripPlan?.tripTitle ?? "Travel plan"}</h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--ink)]/76">
              {run.tripPlan?.overview ?? "The itinerary overview will appear here once the run completes."}
            </p>
            <div className="mt-8 space-y-4">
              {run.tripPlan?.days.map((day) => (
                <article
                  key={day.day}
                  className="rounded-[1.5rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/60 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-display text-3xl text-[color:var(--ink)]">
                      Day {day.day}: {day.title}
                    </h3>
                    <span className="rounded-full border border-[color:var(--ink)]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                      {day.stay}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-[color:var(--ink)]/76">
                    <p>
                      <strong>Morning:</strong> {day.morning}
                    </p>
                    <p>
                      <strong>Afternoon:</strong> {day.afternoon}
                    </p>
                    <p>
                      <strong>Evening:</strong> {day.evening}
                    </p>
                    <p>
                      <strong>Highlight:</strong> {day.highlight}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)] p-6 shadow-[0_18px_40px_rgba(10,12,16,0.08)]">
              <p className="section-kicker">Proposal</p>
              <h2 className="section-title text-[color:var(--ink)]">{run.quoteDraft?.headline ?? "Offer package"}</h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--ink)]/76">
                {run.quoteDraft?.investmentRangeUsd ?? "Pricing details pending"}
              </p>
              <div className="mt-5 space-y-2 text-sm leading-7 text-[color:var(--ink)]/76">
                {run.quoteDraft?.inclusions.map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </div>
              <div className="mt-6 whitespace-pre-line rounded-[1.4rem] border border-[color:var(--ink)]/10 bg-[color:var(--sand)]/60 p-4 text-sm leading-7 text-[color:var(--ink)]/76">
                {run.quoteDraft?.emailDraft}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)] p-6 shadow-[0_18px_40px_rgba(10,12,16,0.08)]">
              <p className="section-kicker">Campaign Pack</p>
              <h2 className="section-title text-[color:var(--ink)]">
                {run.campaignPack?.hookLine ?? "Marketing outputs"}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--ink)]/76">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Instagram</p>
                  {run.campaignPack?.instagramCaptions.map((item) => (
                    <p key={item}>- {item}</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">TikTok Hooks</p>
                  {run.campaignPack?.tiktokHooks.map((item) => (
                    <p key={item}>- {item}</p>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--ink)] p-6 text-[color:var(--paper)] shadow-[0_22px_56px_rgba(10,12,16,0.22)]">
          <p className="section-kicker text-[color:var(--sand-muted)]">Run Trace</p>
          <h2 className="font-display text-5xl leading-tight">Every handoff, preserved.</h2>
          <div className="mt-6">
            <RunTrace events={traceEvents} />
          </div>
        </section>

        <section className="rounded-[2rem] border border-[color:var(--ink)]/10 bg-[color:var(--paper)] p-6 shadow-[0_18px_40px_rgba(10,12,16,0.08)]">
          <p className="section-kicker">Markdown View</p>
          <pre className="overflow-x-auto rounded-[1.5rem] bg-[color:var(--sand)]/60 p-5 text-sm leading-7 text-[color:var(--ink)]/76">
            <code>{run.tripPlan?.markdown}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
