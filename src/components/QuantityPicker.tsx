import type { ServingUnit } from '../types';
import { fractionOptions, formatFraction, isFractionalUnit, UNIT_LABELS } from '../quantity';

const REMOVE = '__remove__';

interface QuantityPickerProps {
  unit: ServingUnit;
  quantity: number;
  onChange: (q: number) => void;
  /** When provided, a trailing "Remove" option is folded into the dropdown itself. */
  onRemove?: () => void;
  className?: string;
}

export function QuantityPicker({ unit, quantity, onChange, onRemove, className }: QuantityPickerProps) {
  function handleSelect(raw: string) {
    if (raw === REMOVE) {
      onRemove?.();
      return;
    }
    onChange(Number(raw));
  }

  if (isFractionalUnit(unit)) {
    const options = fractionOptions(4);
    return (
      <select aria-label="Quantity" className={className} value={quantity} onChange={(e) => handleSelect(e.target.value)}>
        {options.map((q) => (
          <option key={q} value={q}>
            {formatFraction(q)} {UNIT_LABELS[unit]}
          </option>
        ))}
        {onRemove && <option value={REMOVE}>Remove</option>}
      </select>
    );
  }

  if (onRemove) {
    // Continuous units (g/ml/oz) still need a number input for quantity, so the
    // remove action gets its own small adjacent control instead of a dropdown.
    return (
      <span className={`quantity-with-remove ${className ?? ''}`}>
        <input
          aria-label="Quantity"
          type="number"
          min="0"
          step="0.5"
          value={quantity}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <button type="button" className="remove-button" aria-label="Remove" onClick={onRemove}>
          Remove
        </button>
      </span>
    );
  }

  return (
    <input
      aria-label="Quantity"
      className={className}
      type="number"
      min="0"
      step="0.5"
      value={quantity}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
