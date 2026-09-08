import { useState } from 'react';
import type { Campaign } from '../types';
import { updateCampaign } from '../repo';

interface CampaignEditFormProps {
  campaign: Campaign;
  onDone: () => void;
}

export function CampaignEditForm({ campaign, onDone }: CampaignEditFormProps) {
  const [startWeight, setStartWeight] = useState(String(campaign.startWeight));
  const [targetWeight, setTargetWeight] = useState(String(campaign.targetWeight));
  const [baseRate, setBaseRate] = useState(String(campaign.baseRate));
  const [deficitTarget, setDeficitTarget] = useState(String(campaign.deficitTarget));

  const dailyGoalPreview = Number(baseRate) - Number(deficitTarget);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sw = Number(startWeight);
    const tw = Number(targetWeight);
    const br = Number(baseRate);
    const dt = Number(deficitTarget);
    if (!sw || !tw || !br) return;
    await updateCampaign(campaign.id, {
      startWeight: sw,
      targetWeight: tw,
      baseRate: br,
      deficitTarget: dt,
    });
    onDone();
  }

  return (
    <form className="setup-form campaign-edit-form" onSubmit={handleSubmit}>
      <label>
        Start weight
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
      <p className="daily-goal-preview">Daily calorie goal: <strong>{dailyGoalPreview || 0}</strong></p>
      <div className="campaign-edit-actions">
        <button type="submit" className="primary-button">
          Save changes
        </button>
        <button type="button" className="link-button" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
