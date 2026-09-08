import Dexie, { type EntityTable } from 'dexie';
import type {
  Campaign,
  ExerciseEntry,
  FoodEntry,
  FoodItem,
  WeightEntry,
} from './types';

class CalorieDB extends Dexie {
  campaigns!: EntityTable<Campaign, 'id'>;
  foodItems!: EntityTable<FoodItem, 'id'>;
  foodEntries!: EntityTable<FoodEntry, 'id'>;
  exerciseEntries!: EntityTable<ExerciseEntry, 'id'>;
  weightEntries!: EntityTable<WeightEntry, 'id'>;

  constructor() {
    super('calorie-tracker');
    this.version(1).stores({
      campaigns: 'id, status, startDate',
      foodItems: 'id, name',
      foodEntries: 'id, campaignId, date, [campaignId+date], foodItemId',
      exerciseEntries: 'id, campaignId, date, [campaignId+date]',
      weightEntries: 'id, campaignId, date, [campaignId+date]',
    });
  }
}

export const db = new CalorieDB();
