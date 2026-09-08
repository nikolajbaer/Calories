import { useEffect, useState } from 'react';
import {
  useActiveCampaign,
  useExerciseEntriesForDay,
  useFoodEntriesForDay,
  useLatestWeightEntry,
  useWeightEntryForDay,
} from './hooks';
import { seedFoodLibraryIfEmpty } from './seed';
import { addDays, todayISO } from './date';
import { dailyGoal, foodEntryCalories } from './repo';
import type { Campaign } from './types';
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

  // Keying on campaign.id remounts DayView (fresh viewedDate = today) whenever
  // the active campaign changes, instead of syncing that state via an effect.
  return <DayView key={campaign.id} campaign={campaign} />;
}

function DayView({ campaign }: { campaign: Campaign }) {
  const [viewedDate, setViewedDate] = useState(todayISO());

  const foodEntries = useFoodEntriesForDay(campaign.id, viewedDate);
  const exerciseEntries = useExerciseEntriesForDay(campaign.id, viewedDate);
  const weightEntry = useWeightEntryForDay(campaign.id, viewedDate);
  const latestWeightEntry = useLatestWeightEntry(campaign.id);

  if (
    foodEntries === undefined ||
    exerciseEntries === undefined ||
    weightEntry === undefined ||
    latestWeightEntry === undefined
  ) {
    return null; // still loading this day's data
  }

  const eaten = foodEntries.reduce((sum, e) => sum + foodEntryCalories(e), 0);
  const exerciseCalories = exerciseEntries.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const defaultWeight = weightEntry?.weight ?? latestWeightEntry?.weight ?? campaign.startWeight;

  return (
    <div className="app-shell">
      <CampaignHeader
        campaign={campaign}
        date={viewedDate}
        onNavigate={(deltaDays) => setViewedDate((d) => addDays(d, deltaDays))}
        onToday={() => setViewedDate(todayISO())}
      />

      <ProgressMeter eaten={eaten} goal={dailyGoal(campaign)} exerciseCalories={exerciseCalories} />

      <WeightLog
        key={`${campaign.id}-${viewedDate}`}
        campaignId={campaign.id}
        date={viewedDate}
        defaultWeight={defaultWeight}
      />

      <ExercisePanel campaignId={campaign.id} date={viewedDate} entries={exerciseEntries} />

      <section className="panel">
        <div className="panel-header">
          <h2>Food</h2>
          <span className="panel-total">{Math.round(eaten)} cal</span>
        </div>
        <FoodEntryForm campaignId={campaign.id} date={viewedDate} onAdded={() => {}} />
        <FoodEntryList entries={foodEntries} />
      </section>
    </div>
  );
}

export default App;
