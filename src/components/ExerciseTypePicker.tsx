import { composeExerciseLabel, EXERCISE_TYPES } from '../exerciseTypes';

const REMOVE = '__remove__';

interface ExerciseTypePickerProps {
  value: string;
  onChange: (value: string) => void;
  /** When provided, a trailing "Remove" option is folded into the dropdown itself. */
  onRemove?: () => void;
  className?: string;
}

export function ExerciseTypePicker({ value, onChange, onRemove, className }: ExerciseTypePickerProps) {
  function handleSelect(raw: string) {
    if (raw === REMOVE) {
      onRemove?.();
      return;
    }
    onChange(raw);
  }

  return (
    <select aria-label="Exercise type" className={className} value={value} onChange={(e) => handleSelect(e.target.value)}>
      {EXERCISE_TYPES.map((t) => {
        const composed = composeExerciseLabel(t.emoji, t.label);
        return (
          <option key={t.label} value={composed}>
            {composed}
          </option>
        );
      })}
      {onRemove && <option value={REMOVE}>Remove</option>}
    </select>
  );
}
