import dayjs from 'dayjs';

const ISO_DATE = 'YYYY-MM-DD';

/** Local-timezone ISO date string (yyyy-mm-dd), not UTC — so "today" matches the user's clock. */
export function todayISO(): string {
  return dayjs().format(ISO_DATE);
}

export function formatShortDate(iso: string): string {
  return dayjs(iso, ISO_DATE).format('ddd, MMM D');
}

export function addDays(iso: string, delta: number): string {
  return dayjs(iso, ISO_DATE).add(delta, 'day').format(ISO_DATE);
}

/** 1-indexed day number within the campaign (start date is day 1). */
export function dayNumber(startDateISO: string, currentISO: string): number {
  return dayjs(currentISO, ISO_DATE).diff(dayjs(startDateISO, ISO_DATE), 'day') + 1;
}
