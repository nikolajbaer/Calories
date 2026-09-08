import type { FoodEntry } from '../types';
import { deleteFoodEntry, foodEntryCalories, updateFoodEntryQuantity } from '../repo';
import { QuantityPicker } from './QuantityPicker';

interface FoodEntryListProps {
  entries: FoodEntry[];
  /** When set, rows show a checkbox instead of their quantity/remove controls, for building a meal. */
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function FoodEntryList({ entries, selectedIds, onToggleSelect }: FoodEntryListProps) {
  if (entries.length === 0) {
    return <p className="empty-state">No food logged yet today.</p>;
  }

  const selecting = selectedIds !== undefined && onToggleSelect !== undefined;

  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li key={entry.id} className="entry-row">
          {selecting && (
            <input
              type="checkbox"
              aria-label={`Select ${entry.name}`}
              checked={selectedIds.has(entry.id)}
              onChange={() => onToggleSelect(entry.id)}
            />
          )}
          <span className="entry-name">{entry.name}</span>
          <div className="entry-row-right">
            {selecting ? (
              <span className="entry-calories">{Math.round(foodEntryCalories(entry))} cal</span>
            ) : (
              <>
                <QuantityPicker
                  className="entry-quantity-picker"
                  unit={entry.servingUnit}
                  quantity={entry.quantity}
                  onChange={(q) => updateFoodEntryQuantity(entry.id, q)}
                />
                <span className="entry-calories">{Math.round(foodEntryCalories(entry))} cal</span>
                <button
                  type="button"
                  className="row-icon-button"
                  aria-label={`Remove ${entry.name}`}
                  onClick={() => deleteFoodEntry(entry.id)}
                >
                  ⛔
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
