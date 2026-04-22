"use client";

import { useState } from "react";

export function ExportActions({
  markdown,
  tripTitle,
}: {
  markdown: string;
  tripTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="no-print flex flex-wrap gap-3">
      <button
        type="button"
        onClick={copyMarkdown}
        className="rounded-full border border-[color:var(--ink)]/12 bg-[color:var(--paper)] px-5 py-3 text-sm font-semibold tracking-[0.2em] text-[color:var(--ink)] transition hover:-translate-y-0.5"
      >
        {copied ? "Markdown Copied" : "Copy Markdown"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full border border-[color:var(--pine)]/30 bg-[color:var(--pine)] px-5 py-3 text-sm font-semibold tracking-[0.2em] text-[color:var(--paper)] transition hover:-translate-y-0.5"
      >
        Export PDF
      </button>
      <p className="self-center text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">
        {tripTitle}
      </p>
    </div>
  );
}
