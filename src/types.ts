export type CampaignStatus = 'active' | 'ended';

export interface Campaign {
  id: string;
  createdAt: string; // ISO datetime
  startDate: string; // ISO date (yyyy-mm-dd)
  endDate: string | null;
  status: CampaignStatus;
  startWeight: number;
  targetWeight: number;
  /** Estimated maintenance calories (no deficit applied). */
  baseRate: number;
  /** Daily calorie deficit target, subtracted from baseRate. */
  deficitTarget: number;
}

/** Units a food's serving size can be expressed in. */
export type ServingUnit =
  | 'g'
  | 'ml'
  | 'oz'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'piece'
  | 'slice'
  | 'serving';

/** Master food library entry — a reusable lookup, edited independently of past log entries. */
export interface FoodItem {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  proteinG: number;
  cholesterolMg: number;
  createdAt: string;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * A logged food entry for a given day. Nutrition fields are denormalized
 * (copied) from the FoodItem at log time so later edits to the library
 * don't rewrite history.
 */
export interface FoodEntry {
  id: string;
  campaignId: string;
  date: string; // ISO date (yyyy-mm-dd)
  mealCategory: MealCategory;
  foodItemId: string | null; // null if the food was deleted from the library since, or entered ad hoc
  name: string;
  servingUnit: ServingUnit;
  /** Quantity in servingUnit's terms, e.g. 0.75 cups. */
  quantity: number;
  /** Nutrition per 1 servingUnit, denormalized at log time. */
  caloriesPerUnit: number;
  proteinPerUnitG: number;
  cholesterolPerUnitMg: number;
  createdAt: string;
}

export interface ExerciseEntry {
  id: string;
  campaignId: string;
  date: string; // ISO date (yyyy-mm-dd)
  description: string;
  caloriesBurned: number;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  campaignId: string;
  date: string; // ISO date (yyyy-mm-dd)
  weight: number;
  createdAt: string;
}
