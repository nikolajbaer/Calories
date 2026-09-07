import { useState } from 'react';
import type { ExerciseEntry } from '../types';
import { addExerciseEntry, deleteExerciseEntry, updateExerciseDescription } from '../repo';
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
      <form className="entry-form-row" onSubmit={handleSubmit}>
        <ExerciseTypePicker value={type} onChange={setType} />
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
        <button type="submit" className="primary-button" aria-label="Add exercise">
          +
        </button>
      </form>
      {entries.length === 0 ? (
        <p className="empty-state">No exercise logged yet today.</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.id} className="entry-row">
              <ExerciseTypePicker
                value={entry.description}
                onChange={(v) => updateExerciseDescription(entry.id, v)}
                onRemove={() => deleteExerciseEntry(entry.id)}
              />
              <span className="entry-calories">{entry.caloriesBurned} cal</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
