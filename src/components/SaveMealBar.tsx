import { useState } from 'react';

interface SaveMealBarProps {
  selectedCount: number;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function SaveMealBar({ selectedCount, onSave, onCancel }: SaveMealBarProps) {
  const [name, setName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || selectedCount === 0) return;
    onSave(trimmed);
  }

  return (
    <form className="entry-form-row" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Meal name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Meal name"
        className="meal-name-input"
      />
      <button type="submit" className="small-button" disabled={!name.trim() || selectedCount === 0}>
        Save{selectedCount > 0 ? ` (${selectedCount})` : ''}
      </button>
      <button type="button" className="secondary-button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
