import { useState } from 'react';
import { setWeightEntry } from '../repo';
import { weightOptions } from '../weightOptions';

interface WeightLogProps {
  campaignId: string;
  date: string;
  /** Today's already-logged weight if any, else the most recently logged weight, else the campaign's start weight. */
  defaultWeight: number;
}

/**
 * Pass `key={`${campaignId}-${date}`}` from the parent — that remounts this
 * component (rather than patching state via an effect) whenever the day or
 * campaign changes, so its initial state is always derived fresh.
 */
export function WeightLog({ campaignId, date, defaultWeight }: WeightLogProps) {
  const [value, setValue] = useState(defaultWeight);
  const options = weightOptions(defaultWeight);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await setWeightEntry({ campaignId, date, weight: value });
  }

  return (
    <form className="weight-log" onSubmit={handleSubmit}>
      <label htmlFor="weight-select">Weight</label>
      <select id="weight-select" value={value} onChange={(e) => setValue(Number(e.target.value))}>
        {options.map((w) => (
          <option key={w} value={w}>
            {w.toFixed(1)}
          </option>
        ))}
      </select>
      <button type="submit" className="link-button">
        Update
      </button>
    </form>
  );
}
