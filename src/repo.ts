import { v4 as uuid } from 'uuid';
import { db } from './db';
import type {
  Campaign,
  ExerciseEntry,
  FoodEntry,
  FoodItem,
  ServingUnit,
  WeightEntry,
} from './types';
import { todayISO } from './date';

// ---------- Campaigns ----------

export async function createCampaign(input: {
  startWeight: number;
  targetWeight: number;
  baseRate: number;
  deficitTarget: number;
}): Promise<Campaign> {
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: uuid(),
    createdAt: now,
    startDate: todayISO(),
    endDate: null,
    status: 'active',
    startWeight: input.startWeight,
    targetWeight: input.targetWeight,
    baseRate: input.baseRate,
    deficitTarget: input.deficitTarget,
  };
  await db.campaigns.add(campaign);
  return campaign;
}

export async function endCampaign(id: string): Promise<void> {
  await db.campaigns.update(id, {
    status: 'ended',
    endDate: todayISO(),
  });
}

export async function resumeCampaign(id: string): Promise<void> {
  // Only one campaign can be active at a time — end any other active one first.
  const currentlyActive = await db.campaigns.where('status').equals('active').toArray();
  await db.transaction('rw', db.campaigns, async () => {
    for (const c of currentlyActive) {
      if (c.id !== id) {
        await db.campaigns.update(c.id, { status: 'ended', endDate: todayISO() });
      }
    }
    await db.campaigns.update(id, { status: 'active', endDate: null });
  });
}

/** Permanently deletes a campaign and every food/exercise/weight entry logged under it. */
export async function deleteCampaign(id: string): Promise<void> {
  await db.transaction(
    'rw',
    db.campaigns,
    db.foodEntries,
    db.exerciseEntries,
    db.weightEntries,
    async () => {
      await db.foodEntries.where('campaignId').equals(id).delete();
      await db.exerciseEntries.where('campaignId').equals(id).delete();
      await db.weightEntries.where('campaignId').equals(id).delete();
      await db.campaigns.delete(id);
    },
  );
}

export function dailyGoal(campaign: Campaign): number {
  return campaign.baseRate - campaign.deficitTarget;
}

export async function updateCampaign(
  id: string,
  input: {
    startWeight: number;
    targetWeight: number;
    baseRate: number;
    deficitTarget: number;
  },
): Promise<void> {
  await db.campaigns.update(id, {
    startWeight: input.startWeight,
    targetWeight: input.targetWeight,
    baseRate: input.baseRate,
    deficitTarget: input.deficitTarget,
  });
}

// ---------- Food library ----------

export async function upsertFoodItem(input: {
  id?: string;
  name: string;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  proteinG: number;
  cholesterolMg: number;
}): Promise<FoodItem> {
  const item: FoodItem = {
    id: input.id ?? uuid(),
    name: input.name.trim(),
    servingSize: input.servingSize,
    servingUnit: input.servingUnit,
    calories: input.calories,
    proteinG: input.proteinG,
    cholesterolMg: input.cholesterolMg,
    createdAt: new Date().toISOString(),
  };
  await db.foodItems.put(item);
  return item;
}

export async function deleteFoodItem(id: string): Promise<void> {
  await db.foodItems.delete(id);
}

export async function searchFoodItems(query: string, limit = 8): Promise<FoodItem[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await db.foodItems.toArray();
  return all
    .filter((f) => f.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

// ---------- Food entries (log) ----------

export async function addFoodEntryFromLibraryItem(input: {
  campaignId: string;
  date: string;
  foodItem: FoodItem;
  quantity: number;
}): Promise<FoodEntry> {
  const perUnit = 1 / input.foodItem.servingSize;
  const entry: FoodEntry = {
    id: uuid(),
    campaignId: input.campaignId,
    date: input.date,
    foodItemId: input.foodItem.id,
    name: input.foodItem.name,
    servingUnit: input.foodItem.servingUnit,
    quantity: input.quantity,
    caloriesPerUnit: input.foodItem.calories * perUnit,
    proteinPerUnitG: input.foodItem.proteinG * perUnit,
    cholesterolPerUnitMg: input.foodItem.cholesterolMg * perUnit,
    createdAt: new Date().toISOString(),
  };
  await db.foodEntries.add(entry);
  return entry;
}

export async function deleteFoodEntry(id: string): Promise<void> {
  await db.foodEntries.delete(id);
}

export async function updateFoodEntryQuantity(id: string, quantity: number): Promise<void> {
  await db.foodEntries.update(id, { quantity });
}

export function foodEntryCalories(entry: FoodEntry): number {
  return entry.quantity * entry.caloriesPerUnit;
}

export function foodEntryProtein(entry: FoodEntry): number {
  return entry.quantity * entry.proteinPerUnitG;
}

export function foodEntryCholesterol(entry: FoodEntry): number {
  return entry.quantity * entry.cholesterolPerUnitMg;
}

/**
 * Bundles a set of today's food entries into a single reusable FoodItem —
 * e.g. turn "oatmeal + apple + bacon" into one "Breakfast" library entry with
 * their combined calories/protein/cholesterol. Only adds to the library; the
 * source entries are left exactly as logged. Pass existingId to update an
 * existing library item in place instead of creating a new one.
 */
export async function createMealFromEntries(
  name: string,
  entries: FoodEntry[],
  existingId?: string,
): Promise<FoodItem> {
  const calories = entries.reduce((sum, e) => sum + foodEntryCalories(e), 0);
  const proteinG = entries.reduce((sum, e) => sum + foodEntryProtein(e), 0);
  const cholesterolMg = entries.reduce((sum, e) => sum + foodEntryCholesterol(e), 0);
  return upsertFoodItem({
    id: existingId,
    name,
    servingSize: 1,
    servingUnit: 'serving',
    calories,
    proteinG,
    cholesterolMg,
  });
}

/** Case-insensitive exact match on food item name, for duplicate detection before saving. */
export async function findFoodItemByName(name: string): Promise<FoodItem | undefined> {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return undefined;
  const all = await db.foodItems.toArray();
  return all.find((f) => f.name.trim().toLowerCase() === trimmed);
}

// ---------- Exercise entries ----------

export async function addExerciseEntry(input: {
  campaignId: string;
  date: string;
  description: string;
  caloriesBurned: number;
}): Promise<ExerciseEntry> {
  const entry: ExerciseEntry = {
    id: uuid(),
    campaignId: input.campaignId,
    date: input.date,
    description: input.description.trim(),
    caloriesBurned: input.caloriesBurned,
    createdAt: new Date().toISOString(),
  };
  await db.exerciseEntries.add(entry);
  return entry;
}

export async function deleteExerciseEntry(id: string): Promise<void> {
  await db.exerciseEntries.delete(id);
}

export async function updateExerciseDescription(id: string, description: string): Promise<void> {
  await db.exerciseEntries.update(id, { description });
}

export async function updateExerciseCalories(id: string, caloriesBurned: number): Promise<void> {
  await db.exerciseEntries.update(id, { caloriesBurned });
}

// ---------- Weight entries ----------

export async function setWeightEntry(input: {
  campaignId: string;
  date: string;
  weight: number;
}): Promise<WeightEntry> {
  const existing = await db.weightEntries
    .where('[campaignId+date]')
    .equals([input.campaignId, input.date])
    .first();
  const entry: WeightEntry = {
    id: existing?.id ?? uuid(),
    campaignId: input.campaignId,
    date: input.date,
    weight: input.weight,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  await db.weightEntries.put(entry);
  return entry;
}
