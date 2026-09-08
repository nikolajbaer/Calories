import type { FoodEntry } from '../types';
import { deleteFoodEntry, foodEntryCalories, updateFoodEntryQuantity } from '../repo';
import { QuantityPicker } from './QuantityPicker';

interface FoodEntryListProps {
  entries: FoodEntry[];
}

export function FoodEntryList({ entries }: FoodEntryListProps) {
  if (entries.length === 0) {
    return <p className="empty-state">No food logged yet today.</p>;
  }

  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li key={entry.id} className="entry-row">
          <span className="entry-name">{entry.name}</span>
          <div className="entry-row-right">
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
          </div>
        </li>
      ))}
    </ul>
  );
}
