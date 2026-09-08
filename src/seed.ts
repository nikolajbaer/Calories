import { db } from './db';
import type { FoodItem, ServingUnit } from './types';
import seedFoods from './seedFoods.json';

/**
 * Populates the food library with the starter list from the original spreadsheet.
 * IDs are derived from array position (not name — several entries share a name
 * after stripping their serving amount, e.g. "1 cup chili" and "1/2 cup chili"
 * both become "chili") so re-running this (e.g. React StrictMode's double effect
 * invocation in dev) upserts the same rows instead of creating duplicates, without
 * one variant silently overwriting another.
 */
export async function seedFoodLibraryIfEmpty(): Promise<void> {
  const count = await db.foodItems.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  type SeedFood = { name: string; servingSize: number; servingUnit: ServingUnit; calories: number };
  const items: FoodItem[] = (seedFoods as SeedFood[]).map((food, index) => ({
    id: `seed:${index}`,
    name: food.name.trim(),
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    calories: food.calories,
    proteinG: 0,
    cholesterolMg: 0,
    createdAt: now,
  }));
  await db.foodItems.bulkPut(items);
}
