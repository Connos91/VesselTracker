export type MeterTone = 'accent' | 'warning';

export interface MetricMeterProps {
  readonly label: string;
  readonly value: string;
  readonly fraction: number;
  readonly caption: string;
  readonly tone: MeterTone;
}

const MetricMeter = ({ label, value, fraction, caption, tone }: MetricMeterProps) => {
  const filled = Math.min(Math.max(fraction, 0), 1);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-[0.8rem]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div
        className={`h-[8px] rounded-[4px] ${tone === 'warning' ? 'bg-warning-soft' : 'bg-accent-soft'}`}
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-r-[4px] ${tone === 'warning' ? 'bg-warning' : 'bg-accent'}`}
          style={{ width: `${(filled * 100).toFixed(2)}%` }}
        />
      </div>
      <p className="text-[0.72rem] text-ink-muted">{caption}</p>
    </div>
  );
};

export default MetricMeter;
