import { useEffect, useRef, useState } from 'react';
import type { FoodItem, MealCategory, ServingUnit } from '../types';
import {
  addFoodEntryFromLibraryItem,
  searchFoodItems,
  upsertFoodItem,
} from '../repo';
import { UNIT_LABELS } from '../quantity';
import { QuantityPicker } from './QuantityPicker';

const MEAL_OPTIONS: { value: MealCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const UNIT_OPTIONS: ServingUnit[] = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving'];

function defaultMealForNow(): MealCategory {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

interface FoodEntryFormProps {
  campaignId: string;
  date: string;
  onAdded: () => void;
}

export function FoodEntryForm({ campaignId, date, onAdded }: FoodEntryFormProps) {
  const [mealCategory, setMealCategory] = useState<MealCategory>(defaultMealForNow());
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showNewFoodForm, setShowNewFoodForm] = useState(false);
  const [newFood, setNewFood] = useState({
    servingSize: '1',
    servingUnit: 'serving' as ServingUnit,
    calories: '',
    proteinG: '',
    cholesterolMg: '',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // selectFood() already clears suggestions eagerly on selection, so this
    // effect only needs to handle the free-typing search case.
    if (selectedFood) return;
    let cancelled = false;
    searchFoodItems(query).then((results) => {
      if (!cancelled) setSuggestions(results);
    });
    return () => {
      cancelled = true;
    };
  }, [query, selectedFood]);

  function selectFood(food: FoodItem) {
    setSelectedFood(food);
    setQuery(food.name);
    setQuantity(food.servingSize);
    setSuggestions([]);
  }

  function resetForm() {
    setQuery('');
    setSelectedFood(null);
    setQuantity(1);
    setShowNewFoodForm(false);
    setNewFood({ servingSize: '1', servingUnit: 'serving', calories: '', proteinG: '', cholesterolMg: '' });
    inputRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedFood) {
      await addFoodEntryFromLibraryItem({
        campaignId,
        date,
        mealCategory,
        foodItem: selectedFood,
        quantity,
      });
      resetForm();
      onAdded();
      return;
    }

    if (showNewFoodForm) {
      const calories = Number(newFood.calories);
      const servingSize = Number(newFood.servingSize);
      if (!query.trim() || !calories || !servingSize) return;
      const food = await upsertFoodItem({
        name: query,
        servingSize,
        servingUnit: newFood.servingUnit,
        calories,
        proteinG: Number(newFood.proteinG) || 0,
        cholesterolMg: Number(newFood.cholesterolMg) || 0,
      });
      await addFoodEntryFromLibraryItem({
        campaignId,
        date,
        mealCategory,
        foodItem: food,
        quantity: servingSize,
      });
      resetForm();
      onAdded();
      return;
    }

    // Fallback: no library match, no detailed food form opened — log a quick ad hoc entry if a plain
    // name + implied calories isn't available, prompt the user to add details instead.
    setShowNewFoodForm(true);
  }

  const noMatchAndTyped = !selectedFood && query.trim().length > 0 && suggestions.length === 0;

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="entry-form-row">
        <select
          value={mealCategory}
          onChange={(e) => setMealCategory(e.target.value as MealCategory)}
          aria-label="Meal"
        >
          {MEAL_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="autocomplete">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or add a food…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedFood(null);
              setShowNewFoodForm(false);
            }}
            aria-label="Food name"
          />
          {suggestions.length > 0 && (
            <ul className="autocomplete-list">
              {suggestions.map((food) => (
                <li key={food.id}>
                  <button type="button" onClick={() => selectFood(food)}>
                    <span>{food.name}</span>
                    <span className="autocomplete-meta">
                      {food.calories} cal / {food.servingSize} {UNIT_LABELS[food.servingUnit]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedFood && (
          <QuantityPicker
            unit={selectedFood.servingUnit}
            quantity={quantity}
            onChange={setQuantity}
          />
        )}
      </div>

      {selectedFood && (
        <div className="entry-form-preview">
          {Math.round((quantity / selectedFood.servingSize) * selectedFood.calories)} cal
        </div>
      )}

      {noMatchAndTyped && !showNewFoodForm && (
        <button type="button" className="link-button" onClick={() => setShowNewFoodForm(true)}>
          + Add "{query.trim()}" to your food library
        </button>
      )}

      {showNewFoodForm && !selectedFood && (
        <div className="new-food-form">
          <label>
            Serving size
            <input
              type="number"
              min="0"
              step="any"
              value={newFood.servingSize}
              onChange={(e) => setNewFood({ ...newFood, servingSize: e.target.value })}
              required
            />
          </label>
          <label>
            Unit
            <select
              value={newFood.servingUnit}
              onChange={(e) => setNewFood({ ...newFood, servingUnit: e.target.value as ServingUnit })}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABELS[u]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Calories
            <input
              type="number"
              min="0"
              step="any"
              value={newFood.calories}
              onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
              required
            />
          </label>
          <label>
            Protein (g)
            <input
              type="number"
              min="0"
              step="any"
              value={newFood.proteinG}
              onChange={(e) => setNewFood({ ...newFood, proteinG: e.target.value })}
            />
          </label>
          <label>
            Cholesterol (mg)
            <input
              type="number"
              min="0"
              step="any"
              value={newFood.cholesterolMg}
              onChange={(e) => setNewFood({ ...newFood, cholesterolMg: e.target.value })}
            />
          </label>
        </div>
      )}

      <button type="submit" className="primary-button" disabled={!selectedFood && !showNewFoodForm && !query.trim()}>
        Add
      </button>
    </form>
  );
}

