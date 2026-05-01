"use client";

import { getTeamColor } from "@/lib/utils";

interface DriverInfo {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  constructorId: string;
  constructorName: string;
  position: string;
}

interface DriverSelectorProps {
  drivers: DriverInfo[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelection?: number;
}

export default function DriverSelector({
  drivers,
  selected,
  onChange,
  maxSelection = 6,
}: DriverSelectorProps) {
  const toggleDriver = (driverId: string) => {
    if (selected.includes(driverId)) {
      onChange(selected.filter((id) => id !== driverId));
    } else if (selected.length < maxSelection) {
      onChange([...selected, driverId]);
    }
  };

  const selectAll = () => {
    onChange(drivers.slice(0, maxSelection).map((d) => d.driverId));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-medium text-text-secondary">
          Drivers ({selected.length}/{maxSelection})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-text-muted hover:text-f1-red transition-colors"
          >
            Top {maxSelection}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-text-muted hover:text-f1-red transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {drivers.map((driver) => {
          const isSelected = selected.includes(driver.driverId);
          const teamColor = getTeamColor(driver.constructorId);
          const isDisabled = !isSelected && selected.length >= maxSelection;

          return (
            <button
              key={driver.driverId}
              type="button"
              onClick={() => toggleDriver(driver.driverId)}
              disabled={isDisabled}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                isSelected
                  ? "border-transparent bg-opacity-100"
                  : isDisabled
                    ? "border-border-subtle opacity-40 cursor-not-allowed"
                    : "border-border-subtle hover:border-text-muted"
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: `${teamColor}18`,
                      borderColor: `${teamColor}60`,
                    }
                  : undefined
              }
            >
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: teamColor }}
              />
              <span className="flex flex-col min-w-0">
                <span
                  className={`font-semibold truncate ${
                    isSelected ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {driver.code}
                </span>
                <span className="text-xs text-text-muted truncate">
                  {driver.constructorName}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
