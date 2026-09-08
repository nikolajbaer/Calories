import { useEffect } from 'react';
import {
  useActiveCampaign,
  useExerciseEntriesForDay,
  useFoodEntriesForDay,
  useLatestWeightEntry,
  useWeightEntryForDay,
} from './hooks';
import { seedFoodLibraryIfEmpty } from './seed';
import { todayISO } from './date';
import { dailyGoal, foodEntryCalories } from './repo';
import { CampaignSetupForm } from './components/CampaignSetupForm';
import { CampaignHeader } from './components/CampaignHeader';
import { ProgressMeter } from './components/ProgressMeter';
import { FoodEntryForm } from './components/FoodEntryForm';
import { FoodEntryList } from './components/FoodEntryList';
import { ExercisePanel } from './components/ExercisePanel';
import { WeightLog } from './components/WeightLog';
import './App.css';

function App() {
  useEffect(() => {
    seedFoodLibraryIfEmpty();
  }, []);

  const campaign = useActiveCampaign();
  const date = todayISO();
  const foodEntries = useFoodEntriesForDay(campaign?.id, date);
  const exerciseEntries = useExerciseEntriesForDay(campaign?.id, date);
  const weightEntry = useWeightEntryForDay(campaign?.id, date);
  const latestWeightEntry = useLatestWeightEntry(campaign?.id);

  if (campaign === undefined) {
    return null; // still loading whether there's an active campaign
  }

  if (campaign === null) {
    return (
      <div className="app-shell">
        <CampaignSetupForm onCreated={() => {}} />
      </div>
    );
  }

  if (
    foodEntries === undefined ||
    exerciseEntries === undefined ||
    weightEntry === undefined ||
    latestWeightEntry === undefined
  ) {
    return null; // campaign is known — still loading its data for today
  }

  const eaten = foodEntries.reduce((sum, e) => sum + foodEntryCalories(e), 0);
  const exerciseCalories = exerciseEntries.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const defaultWeight = weightEntry?.weight ?? latestWeightEntry?.weight ?? campaign.startWeight;

  return (
    <div className="app-shell">
      <CampaignHeader campaign={campaign} date={date} />

      <ProgressMeter eaten={eaten} goal={dailyGoal(campaign)} exerciseCalories={exerciseCalories} />

      <WeightLog
        key={`${campaign.id}-${date}`}
        campaignId={campaign.id}
        date={date}
        defaultWeight={defaultWeight}
      />

      <ExercisePanel campaignId={campaign.id} date={date} entries={exerciseEntries} />

      <section className="panel">
        <div className="panel-header">
          <h2>Food</h2>
          <span className="panel-total">{Math.round(eaten)} cal</span>
        </div>
        <FoodEntryForm campaignId={campaign.id} date={date} onAdded={() => {}} />
        <FoodEntryList entries={foodEntries} />
      </section>
    </div>
  );
}

export default App;
