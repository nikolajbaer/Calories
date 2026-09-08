export const EXERCISE_TYPES: { emoji: string; label: string }[] = [
  { emoji: '🏃', label: 'Run' },
  { emoji: '🏊', label: 'Swim' },
  { emoji: '🚴', label: 'Bike' },
  { emoji: '🏄', label: 'Surf' },
  { emoji: '🥾', label: 'Hike' },
  { emoji: '🏋️', label: 'Gym' },
  { emoji: '⚡', label: 'Other' },
];

export function composeExerciseLabel(emoji: string, label: string): string {
  return `${emoji} ${label}`;
}

export const DEFAULT_EXERCISE_LABEL = composeExerciseLabel(EXERCISE_TYPES[0].emoji, EXERCISE_TYPES[0].label);
