import type { FoodEntry, MealCategory } from '../types';
import { deleteFoodEntry, foodEntryCalories, updateFoodEntryQuantity } from '../repo';
import { QuantityPicker } from './QuantityPicker';

const MEAL_ORDER: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

interface FoodEntryListProps {
  entries: FoodEntry[];
}

export function FoodEntryList({ entries }: FoodEntryListProps) {
  if (entries.length === 0) {
    return <p className="empty-state">No food logged yet today.</p>;
  }

  return (
    <div className="meal-groups">
      {MEAL_ORDER.map((meal) => {
        const mealEntries = entries.filter((e) => e.mealCategory === meal);
        if (mealEntries.length === 0) return null;
        const mealTotal = mealEntries.reduce((sum, e) => sum + foodEntryCalories(e), 0);
        return (
          <div key={meal} className="meal-group">
            <div className="meal-group-header">
              <h3>{MEAL_LABELS[meal]}</h3>
              <span>{Math.round(mealTotal)} cal</span>
            </div>
            <ul className="entry-list">
              {mealEntries.map((entry) => (
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
                      className="icon-button"
                      aria-label={`Remove ${entry.name}`}
                      onClick={() => deleteFoodEntry(entry.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
