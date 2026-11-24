import { content } from "../data/content.js";
import { timeSlots } from "../data/slots.js";

export function formatLongDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function makeRef() {
  return `RISK-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readMinutes(blocks: { text?: string; items?: string[] }[]) {
  const words = blocks
    .flatMap((block) => [block.text || "", ...(block.items || [])])
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 180))} min`;
}

export function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 2) return { label: "Weak", level: 1 };
  if (score <= 3) return { label: "Fair", level: 2 };
  return { label: "Strong", level: 3 };
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function serviceById(id: string) {
  return content.services.find((service) => service.id === id);
}

export function resourceById(id: string) {
  return content.resources.find((resource) => resource.id === id);
}

export async function shareText(title: string, text: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared" as const;
    } catch {
      return "dismissed" as const;
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  }
  return "failed" as const;
}

export function downloadIcs(opts: {
  title: string;
  date: string;
  timeLabel: string;
  location: string;
  description: string;
  filename: string;
}) {
  const slot = timeSlots.find((item) => item.label === opts.timeLabel);
  const minutes = slot?.minutes ?? 9 * 60;
  const [y, m, d] = opts.date.split("-");
  const startH = Math.floor(minutes / 60);
  const startM = minutes % 60;
  const end = minutes + 60;
  const endH = Math.floor(end / 60);
  const endM = end % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${y}${m}${d}T${pad(startH)}${pad(startM)}00`;
  const endStamp = `${y}${m}${d}T${pad(endH)}${pad(endM)}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RISK//Appointments//EN",
    "BEGIN:VEVENT",
    `DTSTART:${stamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${opts.title}`,
    `LOCATION:${opts.location}`,
    `DESCRIPTION:${opts.description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = opts.filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function mapsUrl() {
  return `https://maps.apple.com/?address=${encodeURIComponent(content.contact.address)}`;
}

export function telUrl(phone = content.contact.phone) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function smsUrl(phone = content.contact.phone) {
  return `sms:${phone.replace(/[^\d+]/g, "")}`;
}

export function mailUrl(email = content.contact.email) {
  return `mailto:${email}`;
}
