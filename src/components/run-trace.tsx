import type { StreamEvent } from "@/types/travel";
import { cn } from "@/lib/utils";

const styles = {
  started: "border-[color:var(--copper)]/40 bg-[color:var(--paper)]/70",
  completed: "border-[color:var(--pine)]/40 bg-[color:var(--pine)]/8",
  info: "border-white/12 bg-white/6",
  failed: "border-[color:var(--ember)]/40 bg-[color:var(--ember)]/8",
} as const;

function summaryForEvent(event: StreamEvent) {
  switch (event.type) {
    case "run.notice":
      return event.message;
    case "run.created":
      return `${event.title} initialized on ${event.modelName}.`;
    case "agent.started":
      return `${event.label} is entering the run.`;
    case "agent.completed":
      return event.summary;
    case "run.completed":
      return `${event.run.title} is complete.`;
    case "run.failed":
      return event.message;
    default:
      return "";
  }
}

export function RunTrace({ events }: { events: StreamEvent[] }) {
  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-[color:var(--muted)]">
          Start a run to watch the swarm report each decision in sequence.
        </div>
      ) : null}
      {events.map((event, index) => {
        const status =
          event.type === "run.failed"
            ? "failed"
            : event.type === "agent.started"
              ? "started"
              : event.type === "run.notice" || event.type === "run.created"
                ? "info"
                : "completed";
        const textTone =
          status === "info"
            ? "text-[color:var(--paper)]"
            : "text-[color:var(--ink)]";
        const label =
          event.type === "agent.completed" || event.type === "agent.started"
            ? event.label
            : event.type === "run.notice"
              ? event.level === "warn"
                ? "System Notice"
                : "System Update"
              : event.type === "run.created"
                ? "Swarm Init"
                : event.type === "run.completed"
                  ? "Final Delivery"
                  : "Run Failure";

        return (
          <article
            key={`${event.type}-${index}`}
            className={cn(
              "rounded-[1.6rem] border p-4 shadow-[0_16px_42px_rgba(8,10,13,0.14)] backdrop-blur",
              styles[status],
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.35em] text-[color:var(--muted)]">
                  {label}
                </p>
                <p className={cn("mt-2 text-sm leading-6", textTone)}>
                  {summaryForEvent(event)}
                </p>
              </div>
              <div className="rounded-full border border-white/15 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-[color:var(--muted)]">
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
