/** Standard rule-of-thumb approximation: a 3,500 calorie deficit equals about a pound of fat. */
const CALORIES_PER_POUND = 3500;

/**
 * Days until `latestWeight` reaches `targetWeight` at `dailyDeficit` calories/day.
 * `null` when a projection isn't meaningful: no deficit configured, or the
 * target has already been reached (weight at or below target).
 */
export function projectedDaysToGoal(
  latestWeight: number,
  targetWeight: number,
  dailyDeficit: number,
): number | null {
  const poundsToLose = latestWeight - targetWeight;
  if (poundsToLose <= 0) return null;
  if (dailyDeficit <= 0) return null;
  return (poundsToLose * CALORIES_PER_POUND) / dailyDeficit;
}

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

function formatUnitCount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Renders a day count as the largest unit that reads naturally, rounded to
 * the nearest half — e.g. 10 days -> "1.5 weeks", 75 days -> "2.5 months".
 */
export function formatProjection(days: number): string {
  if (days < 7) {
    const whole = Math.round(days);
    return `${whole} day${whole === 1 ? '' : 's'}`;
  }
  if (days < 56) {
    const weeks = roundToHalf(days / 7);
    return `${formatUnitCount(weeks)} week${weeks === 1 ? '' : 's'}`;
  }
  const months = roundToHalf(days / 30);
  return `${formatUnitCount(months)} month${months === 1 ? '' : 's'}`;
}
