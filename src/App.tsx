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
import { createMealFromEntries, dailyGoal, findFoodItemByName, foodEntryCalories } from './repo';
import type { Campaign } from './types';
import { CampaignSetupForm } from './components/CampaignSetupForm';
import { CampaignHeader } from './components/CampaignHeader';
import { ProgressMeter } from './components/ProgressMeter';
import { FoodEntryForm } from './components/FoodEntryForm';
import { FoodEntryList } from './components/FoodEntryList';
import { FoodLibraryScreen } from './components/FoodLibraryScreen';
import { SaveMealBar } from './components/SaveMealBar';
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
  const [showFoodLibrary, setShowFoodLibrary] = useState(false);
  const [mealMode, setMealMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  if (showFoodLibrary) {
    return <FoodLibraryScreen onClose={() => setShowFoodLibrary(false)} />;
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitMealMode() {
    setMealMode(false);
    setSelectedIds(new Set());
  }

  const handleSaveMeal = async (name: string) => {
    const selected = foodEntries.filter((e) => selectedIds.has(e.id));
    if (selected.length === 0) return;
    const existing = await findFoodItemByName(name);
    if (existing) {
      const confirmed = confirm(
        `"${existing.name}" already exists (${Math.round(existing.calories)} cal) — update it with these new values instead of creating a duplicate?`,
      );
      if (!confirmed) return;
    }
    await createMealFromEntries(name, selected, existing?.id);
    exitMealMode();
  };

  const eaten = foodEntries.reduce((sum, e) => sum + foodEntryCalories(e), 0);
  const exerciseCalories = exerciseEntries.reduce((sum, e) => sum + e.caloriesBurned, 0);
  // The most recently logged weight overall, regardless of which day is being viewed —
  // the goal projection reflects "where you are now," not the viewed day's own reading.
  const latestWeight = latestWeightEntry?.weight ?? campaign.startWeight;
  const defaultWeight = weightEntry?.weight ?? latestWeight;

  return (
    <div className="app-shell">
      <CampaignHeader
        campaign={campaign}
        date={viewedDate}
        latestWeight={latestWeight}
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
          <div className="panel-header-right">
            <button
              type="button"
              className="plate-toggle"
              data-active={mealMode}
              aria-label={mealMode ? 'Cancel building a meal' : 'Build a meal from today\'s food'}
              onClick={() => (mealMode ? exitMealMode() : setMealMode(true))}
            >
              🍽️
            </button>
            <button type="button" className="link-button" onClick={() => setShowFoodLibrary(true)}>
              Manage
            </button>
            <span className="panel-total">{Math.round(eaten)} cal</span>
          </div>
        </div>
        {mealMode ? (
          <SaveMealBar selectedCount={selectedIds.size} onSave={handleSaveMeal} onCancel={exitMealMode} />
        ) : (
          <FoodEntryForm campaignId={campaign.id} date={viewedDate} onAdded={() => {}} />
        )}
        <FoodEntryList
          entries={foodEntries}
          selectedIds={mealMode ? selectedIds : undefined}
          onToggleSelect={mealMode ? toggleSelect : undefined}
        />
      </section>
    </div>
  );
}

export default App;
