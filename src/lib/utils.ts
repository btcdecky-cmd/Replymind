import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newId() {
  return crypto.randomUUID();
}

export function monthKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function friendlyError(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    const msg = err.message.trim();
    if (msg && !msg.includes("\n") && msg.length < 180 && !msg.includes(" at ")) {
      return msg;
    }
  }
  return fallback;
}

export function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const delta = Date.now() - then;
  const min = Math.round(delta / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
