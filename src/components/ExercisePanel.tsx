import { useState } from 'react';
import type { ExerciseEntry } from '../types';
import { addExerciseEntry, deleteExerciseEntry } from '../repo';

interface ExercisePanelProps {
  campaignId: string;
  date: string;
  entries: ExerciseEntry[];
}

export function ExercisePanel({ campaignId, date, entries }: ExercisePanelProps) {
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cal = Number(calories);
    if (!cal) return;
    await addExerciseEntry({ campaignId, date, description, caloriesBurned: cal });
    setDescription('');
    setCalories('');
  }

  const total = entries.reduce((sum, e) => sum + e.caloriesBurned, 0);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Exercise</h2>
        {total > 0 && <span className="panel-total">+{total} cal</span>}
      </div>
      <form className="entry-form" onSubmit={handleSubmit}>
        <div className="entry-form-row">
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Exercise description"
          />
          <input
            type="number"
            min="0"
            placeholder="Calories burned"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            aria-label="Calories burned"
            style={{ width: '9rem' }}
            required
          />
        </div>
        <button type="submit" className="primary-button">
          Add
        </button>
      </form>
      {entries.length === 0 ? (
        <p className="empty-state">No exercise logged yet today.</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.id} className="entry-row">
              <span className="entry-name">{entry.description || 'Exercise'}</span>
              <div className="entry-row-right">
                <span className="entry-calories">{entry.caloriesBurned} cal</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Remove exercise entry"
                  onClick={() => deleteExerciseEntry(entry.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
