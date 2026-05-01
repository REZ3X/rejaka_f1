"use client";

import Select from "@/components/ui/Select";
import { SEASONS } from "@/lib/constants";

interface SeasonSelectorProps {
  value: string;
  onChange: (season: string) => void;
}

export default function SeasonSelector({ value, onChange }: SeasonSelectorProps) {
  const options = SEASONS.map((s) => ({
    value: String(s),
    label: String(s),
  }));

  return (
    <Select
      id="season-selector"
      label="Season"
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select season..."
    />
  );
}
