/** Sorted candidate weights around `center`, e.g. for a day-to-day weigh-in dropdown. */
export function weightOptions(center: number, range = 10, step = 0.1): number[] {
  const start = Math.round((center - range) / step) * step;
  const count = Math.round((range * 2) / step) + 1;
  const options: number[] = [];
  for (let i = 0; i < count; i++) {
    options.push(Math.round((start + i * step) * 10) / 10);
  }
  return options;
}
