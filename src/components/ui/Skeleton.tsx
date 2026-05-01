export function Skeleton({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-5">
      <Skeleton height={14} width="40%" className="mb-3" />
      <Skeleton height={20} width="75%" className="mb-2" />
      <Skeleton height={14} width="60%" className="mb-4" />
      <div className="flex gap-2">
        <Skeleton height={28} width={80} className="rounded-full" />
        <Skeleton height={28} width={60} className="rounded-full" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="chart-container">
      <Skeleton height={16} width="30%" className="mb-4" />
      <Skeleton height={height} className="rounded-lg" />
    </div>
  );
}
