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
    <div
      className="meter"
      data-status={over ? 'over' : 'good'}
      role="progressbar"
      aria-valuenow={Math.round(eaten)}
      aria-valuemin={0}
      aria-valuemax={Math.round(effectiveGoal)}
    >
      <div className="meter-fill" style={{ width: `${fillPct}%` }} />
      <div className="meter-content">
        <span className="meter-value">
          {Math.abs(Math.round(remaining)).toLocaleString()} {over ? 'over' : 'left'}
        </span>
        <span className="meter-sub">
          {Math.round(eaten).toLocaleString()} / {Math.round(effectiveGoal).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
