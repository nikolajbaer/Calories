interface ProgressMeterProps {
  eaten: number;
  goal: number;
  exerciseCalories: number;
}

export function ProgressMeter({ eaten, goal, exerciseCalories }: ProgressMeterProps) {
  const effectiveGoal = goal + exerciseCalories;
  const remaining = effectiveGoal - eaten;
  const over = remaining < 0;

  const fillPct = Math.max(0, Math.min(100, (eaten / Math.max(effectiveGoal, 1)) * 100));

  return (
    <div className="meter" data-status={over ? 'over' : 'good'}>
      <div className="meter-headline">
        <span className="meter-value">
          {Math.abs(Math.round(remaining)).toLocaleString()}
        </span>
        <span className="meter-unit">
          calories {over ? 'over' : 'left'}
        </span>
      </div>
      <div
        className="meter-track"
        role="progressbar"
        aria-valuenow={Math.round(eaten)}
        aria-valuemin={0}
        aria-valuemax={Math.round(effectiveGoal)}
      >
        <div className="meter-fill" style={{ width: `${fillPct}%` }} />
      </div>
      <div className="meter-detail">
        {Math.round(eaten).toLocaleString()} eaten
        {exerciseCalories > 0 ? ` · +${Math.round(exerciseCalories).toLocaleString()} exercise` : ''}
        {' · '}
        {Math.round(effectiveGoal).toLocaleString()} goal
      </div>
    </div>
  );
}
