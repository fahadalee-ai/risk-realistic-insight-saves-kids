export const timeSlots = [
  { id: "0900", label: "9:00 AM", minutes: 540, period: "Morning" },
  { id: "0930", label: "9:30 AM", minutes: 570, period: "Morning" },
  { id: "1000", label: "10:00 AM", minutes: 600, period: "Morning" },
  { id: "1030", label: "10:30 AM", minutes: 630, period: "Morning" },
  { id: "1100", label: "11:00 AM", minutes: 660, period: "Morning" },
  { id: "1130", label: "11:30 AM", minutes: 690, period: "Morning" },
  { id: "1300", label: "1:00 PM", minutes: 780, period: "Afternoon" },
  { id: "1330", label: "1:30 PM", minutes: 810, period: "Afternoon" },
  { id: "1400", label: "2:00 PM", minutes: 840, period: "Afternoon" },
  { id: "1500", label: "3:00 PM", minutes: 900, period: "Afternoon" },
  { id: "1600", label: "4:00 PM", minutes: 960, period: "Afternoon" },
  { id: "1700", label: "5:00 PM", minutes: 1020, period: "Evening" },
  { id: "1730", label: "5:30 PM", minutes: 1050, period: "Evening" },
  { id: "1800", label: "6:00 PM", minutes: 1080, period: "Evening" },
  { id: "1830", label: "6:30 PM", minutes: 1110, period: "Evening" },
];

export const periods = ["Morning", "Afternoon", "Evening"];

export function toIso(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function todayIso() {
  const n = new Date();
  return toIso(n.getFullYear(), n.getMonth(), n.getDate());
}

export function parseIso(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateAvailable(iso) {
  if (!iso) return false;
  if (iso < todayIso()) return false;
  const [y, m, d] = iso.split("-").map(Number);
  return (y + m * 3 + d * 5) % 8 !== 0;
}

export function slotAvailable(iso, slot) {
  if (!dateAvailable(iso)) return false;
  const hash = iso.split("-").reduce((sum, part) => sum + Number(part), 0) + slot.minutes;
  if (hash % 7 === 0) return false;
  if (iso === todayIso()) {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (slot.minutes <= minutes + 30) return false;
  }
  return true;
}
