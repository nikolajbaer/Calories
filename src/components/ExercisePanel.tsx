import { useState } from 'react';
import type { ExerciseEntry } from '../types';
import {
  addExerciseEntry,
  deleteExerciseEntry,
  updateExerciseCalories,
  updateExerciseDescription,
} from '../repo';
import { DEFAULT_EXERCISE_LABEL } from '../exerciseTypes';
import { ExerciseTypePicker } from './ExerciseTypePicker';

interface ExercisePanelProps {
  campaignId: string;
  date: string;
  entries: ExerciseEntry[];
}

export function ExercisePanel({ campaignId, date, entries }: ExercisePanelProps) {
  const [type, setType] = useState(DEFAULT_EXERCISE_LABEL);
  const [calories, setCalories] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cal = Number(calories);
    if (!cal) return;
    await addExerciseEntry({ campaignId, date, description: type, caloriesBurned: cal });
    setCalories('');
  }

  const total = entries.reduce((sum, e) => sum + e.caloriesBurned, 0);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Exercise</h2>
        {total > 0 && <span className="panel-total">+{total} cal</span>}
      </div>
      <form className="exercise-row" onSubmit={handleSubmit}>
        <ExerciseTypePicker className="exercise-type-picker" value={type} onChange={setType} />
        <input
          type="number"
          min="0"
          placeholder="calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          aria-label="Calories burned"
          className="calories-input"
          required
        />
        <button type="submit" className="row-icon-button" aria-label="Add exercise">
          ➕
        </button>
      </form>
      {entries.length === 0 ? (
        <p className="empty-state">No exercise logged yet today.</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            // Keying on caloriesBurned remounts the row (fresh initial state) whenever
            // the stored value changes, instead of syncing local state via an effect.
            <ExerciseEntryRow key={`${entry.id}-${entry.caloriesBurned}`} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ExerciseEntryRow({ entry }: { entry: ExerciseEntry }) {
  const [calories, setCalories] = useState(String(entry.caloriesBurned));

  function handleBlur() {
    const value = Number(calories);
    if (value > 0 && value !== entry.caloriesBurned) {
      updateExerciseCalories(entry.id, value);
    } else {
      setCalories(String(entry.caloriesBurned));
    }
  }

  return (
    <li className="exercise-row">
      <ExerciseTypePicker
        className="exercise-type-picker"
        value={entry.description}
        onChange={(v) => updateExerciseDescription(entry.id, v)}
      />
      <input
        type="number"
        min="0"
        className="calories-input"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        onBlur={handleBlur}
        aria-label="Calories burned"
      />
      <button
        type="button"
        className="row-icon-button"
        aria-label="Remove exercise entry"
        onClick={() => deleteExerciseEntry(entry.id)}
      >
        ⛔
      </button>
    </li>
  );
}
