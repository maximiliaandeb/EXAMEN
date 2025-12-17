export function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function formatDateISO(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function timeToMinutes(t) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

export function addMinutesToTime(t, minutes) {
  const total = timeToMinutes(t) + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Helpers for recurring availability
export function isoToDate(iso) {
  return new Date(iso + "T00:00:00");
}

// 0..6 => 0=Sun .. 6=Sat
export function weekdayOfISO(iso) {
  return isoToDate(iso).getDay();
}

// Check if weekly rule applies on an ISO date
// rule: { weekday: 0..6 (0=Sun), startDate?: ISO, endDate?: ISO }
export function ruleAppliesOnISO(rule, iso) {
  const d = isoToDate(iso);
  const jsDay = d.getDay();
  if (Array.isArray(rule.exceptions) && rule.exceptions.includes(iso))
    return false;
  if (rule.weekday !== jsDay) return false;
  if (rule.startDate) {
    const from = isoToDate(rule.startDate);
    if (d < from) return false;
  }
  if (rule.endDate) {
    const until = isoToDate(rule.endDate);
    if (d > until) return false;
  }
  return true;
}
