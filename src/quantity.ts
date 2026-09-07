import type { ServingUnit } from './types';

/** Units where people think in fractions of a whole (a dropdown of presets beats free entry). */
const FRACTIONAL_UNITS: ServingUnit[] = ['cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving'];

export function isFractionalUnit(unit: ServingUnit): boolean {
  return FRACTIONAL_UNITS.includes(unit);
}

/** Quarter-increment options from 0.25 up to `max` (default 3), for fractional units. */
export function fractionOptions(max = 3): number[] {
  const options: number[] = [];
  for (let q = 1; q <= max * 4; q++) {
    options.push(q / 4);
  }
  return options;
}

export function formatFraction(value: number): string {
  const whole = Math.floor(value);
  const frac = value - whole;
  const fracLabels: Record<string, string> = {
    '0.25': '¼',
    '0.50': '½',
    '0.75': '¾',
  };
  const fracLabel = fracLabels[frac.toFixed(2)];
  if (whole === 0 && fracLabel) return fracLabel;
  if (whole > 0 && fracLabel) return `${whole}${fracLabel}`;
  return String(value);
}

export const UNIT_LABELS: Record<ServingUnit, string> = {
  g: 'g',
  ml: 'mL',
  oz: 'oz',
  cup: 'cup',
  tbsp: 'tbsp',
  tsp: 'tsp',
  piece: 'piece',
  slice: 'slice',
  serving: 'serving',
};

export function formatQuantity(quantity: number, unit: ServingUnit): string {
  if (isFractionalUnit(unit)) {
    return `${formatFraction(quantity)} ${UNIT_LABELS[unit]}${quantity !== 1 ? (unit === 'piece' || unit === 'slice' ? 's' : '') : ''}`;
  }
  return `${quantity} ${UNIT_LABELS[unit]}`;
}
