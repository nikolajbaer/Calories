import type { ServingUnit } from '../types';
import { formatQuantity, fractionOptions, isFractionalUnit } from '../quantity';

interface QuantityPickerProps {
  unit: ServingUnit;
  quantity: number;
  onChange: (q: number) => void;
  className?: string;
}

export function QuantityPicker({ unit, quantity, onChange, className }: QuantityPickerProps) {
  if (isFractionalUnit(unit)) {
    const options = fractionOptions(4);
    return (
      <select aria-label="Quantity" className={className} value={quantity} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((q) => (
          <option key={q} value={q}>
            {formatQuantity(q, unit)}
          </option>
        ))}
      </select>
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
