interface ProgressMeterProps {
  eaten: number;
  goal: number;
  exerciseCalories: number;
}

type Status = 'good' | 'warning' | 'critical';

export function ProgressMeter({ eaten, goal, exerciseCalories }: ProgressMeterProps) {
  const effectiveGoal = goal + exerciseCalories;
  const remaining = effectiveGoal - eaten;
  const ratio = effectiveGoal > 0 ? remaining / effectiveGoal : 0;

  let status: Status = 'good';
  if (ratio < 0) status = 'critical';
  else if (ratio <= 0.2) status = 'warning';

  const fillPct = Math.max(0, Math.min(100, (eaten / Math.max(effectiveGoal, 1)) * 100));

  const statusCopy: Record<Status, { label: string; icon: string }> = {
    good: { label: 'On track', icon: '✓' },
    warning: { label: 'Cutting it close', icon: '!' },
    critical: { label: 'Over budget', icon: '✕' },
  };

  const { label, icon } = statusCopy[status];

  return (
    <div className="meter" data-status={status}>
      <div className="meter-headline">
        <span className="meter-value">
          {Math.abs(Math.round(remaining)).toLocaleString()}
        </span>
        <span className="meter-unit">
          calories {remaining < 0 ? 'over' : 'left'}
        </span>
      </div>
      <div className="meter-track" role="progressbar" aria-valuenow={Math.round(eaten)} aria-valuemin={0} aria-valuemax={Math.round(effectiveGoal)}>
        <div className="meter-fill" style={{ width: `${fillPct}%` }} />
      </div>
      <div className="meter-footer">
        <span className="meter-status">
          <span className="meter-status-icon" aria-hidden="true">{icon}</span>
          {label}
        </span>
        <span className="meter-detail">
          {Math.round(eaten).toLocaleString()} eaten
          {exerciseCalories > 0 ? ` · +${Math.round(exerciseCalories).toLocaleString()} exercise` : ''}
          {' · '}
          {Math.round(effectiveGoal).toLocaleString()} goal
        </span>
      </div>
    </div>
  );
}
