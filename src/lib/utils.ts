import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function sentenceList(items: string[]) {
  return items.filter(Boolean).join(", ");
}

export function titleFromBrief(brief: {
  occasion: string;
  destinations: string[];
  travelMonth: string;
}) {
  const place = brief.destinations.slice(0, 2).join(" + ");
  return `${place} ${brief.occasion} for ${brief.travelMonth}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
