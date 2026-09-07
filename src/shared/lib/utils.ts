import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a timestamp/date string into a user-friendly format with local timezone.
 * Handles PostgreSQL timestamps (e.g. '2026-09-05 21:33:35.827127+05:30'),
 * ISO 8601 strings, and date-only strings.
 *
 * Example:
 * '2026-09-05 21:33:35.827127+05:30' -> '05 Sep 2026, 09:33 PM (IST)'
 * '2026-09-05' -> '05 Sep 2026'
 */
export function formatDateTime(raw?: string | null): string {
  if (!raw || raw === "—" || raw === "-") return "—";
  let str = String(raw).trim();
  if (!str) return "—";

  const hasTime = str.includes(":") || (str.includes("T") && str.length > 10);

  // Normalize space separator between date and time (PostgreSQL style)
  if (str.includes(" ") && !str.includes("T")) {
    str = str.replace(" ", "T");
  }
  // Normalize sub-milliseconds to 3 digits (e.g. .827127 -> .827)
  str = str.replace(/(\.\d{3})\d+/, "$1");

  const d = new Date(str);
  if (isNaN(d.getTime())) return String(raw);

  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  if (!hasTime) {
    return `${day} ${month} ${year}`;
  }

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hourStr = String(hours).padStart(2, "0");

  let tzStr = "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(d);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart?.value) {
      tzStr = tzPart.value;
    }
  } catch {}

  // Standardize IST offset representation
  if (tzStr.includes("GMT+5:30") || tzStr.includes("UTC+5:30") || str.includes("+05:30")) {
    tzStr = "IST";
  }

  return `${day} ${month} ${year}, ${hourStr}:${minutes} ${ampm}${tzStr ? ` (${tzStr})` : ""}`;
}


