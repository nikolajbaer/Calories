import { useState } from 'react';
import type { WeightEntry } from '../types';
import { setWeightEntry } from '../repo';

interface WeightLogProps {
  campaignId: string;
  date: string;
  existing: WeightEntry | null;
}

/**
 * Pass `key={`${campaignId}-${date}`}` from the parent — that remounts this
 * component (rather than patching state via an effect) whenever the day or
 * campaign changes, so its initial state is always derived fresh.
 */
export function WeightLog({ campaignId, date, existing }: WeightLogProps) {
  const [value, setValue] = useState(existing?.weight?.toString() ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const weight = Number(value);
    if (!weight) return;
    await setWeightEntry({ campaignId, date, weight });
  }

  return (
    <form className="weight-log" onSubmit={handleSubmit}>
      <label htmlFor="weight-input">Weight</label>
      <input
        id="weight-input"
        type="number"
        min="0"
        step="0.1"
        placeholder="log today's"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="link-button">
        Save
      </button>
    </form>
  );
}
