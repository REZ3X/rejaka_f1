import { TIRE_COMPOUNDS } from "@/lib/constants";
import type { TireCompound } from "@/lib/types";

export default function Badge({
  compound,
  size = "md",
}: {
  compound: TireCompound;
  size?: "sm" | "md" | "lg";
}) {
  const config = TIRE_COMPOUNDS[compound];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold skew-x-[-10deg] ${sizeClasses[size]}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}33`,
      }}
    >
      <span
        className="h-2 w-2 skew-x-[10deg]"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
