import { composeExerciseLabel, EXERCISE_TYPES } from '../exerciseTypes';

interface ExerciseTypePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ExerciseTypePicker({ value, onChange, className }: ExerciseTypePickerProps) {
  return (
    <select aria-label="Exercise type" className={className} value={value} onChange={(e) => onChange(e.target.value)}>
      {EXERCISE_TYPES.map((t) => {
        const composed = composeExerciseLabel(t.emoji, t.label);
        return (
          <option key={t.label} value={composed}>
            {composed}
          </option>
        );
      })}
    </select>
  );
}
