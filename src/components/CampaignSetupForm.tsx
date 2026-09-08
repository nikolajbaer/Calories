import { useState } from 'react';
import { createCampaign } from '../repo';

interface CampaignSetupFormProps {
  onCreated: () => void;
}

export function CampaignSetupForm({ onCreated }: CampaignSetupFormProps) {
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [baseRate, setBaseRate] = useState('2000');
  const [deficitTarget, setDeficitTarget] = useState('500');

  const dailyGoal = Number(baseRate) - Number(deficitTarget);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sw = Number(startWeight);
    const tw = Number(targetWeight);
    const br = Number(baseRate);
    const dt = Number(deficitTarget);
    if (!sw || !tw || !br) return;
    await createCampaign({ startWeight: sw, targetWeight: tw, baseRate: br, deficitTarget: dt });
    onCreated();
  }

  return (
    <div className="setup-card">
      <h1>Start a new campaign</h1>
      <p className="subdued">
        A campaign tracks your progress toward a target weight. You can end it any time and start
        a new one, or resume a past one.
      </p>
      <form className="setup-form" onSubmit={handleSubmit}>
        <label>
          Current weight
          <input
            type="number"
            min="0"
            step="0.1"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value)}
            required
          />
        </label>
        <label>
          Target weight
          <input
            type="number"
            min="0"
            step="0.1"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            required
          />
        </label>
        <label>
          Maintenance calories (base rate)
          <input
            type="number"
            min="0"
            value={baseRate}
            onChange={(e) => setBaseRate(e.target.value)}
            required
          />
        </label>
        <label>
          Daily calorie deficit target
          <input
            type="number"
            min="0"
            value={deficitTarget}
            onChange={(e) => setDeficitTarget(e.target.value)}
          />
        </label>
        <p className="daily-goal-preview">Daily calorie goal: <strong>{dailyGoal || 0}</strong></p>
        <button type="submit" className="primary-button">
          Start campaign
        </button>
      </form>
    </div>
  );
}
