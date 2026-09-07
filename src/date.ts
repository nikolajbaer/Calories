/** Local-timezone ISO date string (yyyy-mm-dd), not UTC — so "today" matches the user's clock. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** 1-indexed day number within the campaign (start date is day 1). */
export function dayNumber(startDateISO: string, currentISO: string): number {
  const [sy, sm, sd] = startDateISO.split('-').map(Number);
  const [cy, cm, cd] = currentISO.split('-').map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const current = Date.UTC(cy, cm - 1, cd);
  return Math.round((current - start) / 86_400_000) + 1;
}
