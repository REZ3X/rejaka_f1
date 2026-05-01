"use client";

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  accentColor?: string;
}

export default function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  accentColor = "var(--f1-red)",
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
        <span
          className="rounded-md px-2 py-0.5 font-mono text-sm font-semibold"
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}15`,
          }}
        >
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percentage}%, var(--border-primary) ${percentage}%, var(--border-primary) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
