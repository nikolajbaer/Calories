import { db } from './db';
import type { FoodItem } from './types';
import seedFoods from './seedFoods.json';

/**
 * Populates the food library with the starter list from the original spreadsheet.
 * IDs are derived deterministically from the name so re-running this (e.g. React
 * StrictMode's double effect invocation in dev) upserts the same rows instead of
 * creating duplicates.
 */
export async function seedFoodLibraryIfEmpty(): Promise<void> {
  const count = await db.foodItems.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  const items: FoodItem[] = (seedFoods as { name: string; calories: number }[]).map((food) => ({
    id: `seed:${food.name.trim().toLowerCase()}`,
    name: food.name.trim(),
    servingSize: 1,
    servingUnit: 'serving',
    calories: food.calories,
    proteinG: 0,
    cholesterolMg: 0,
    createdAt: now,
  }));
  await db.foodItems.bulkPut(items);
}
