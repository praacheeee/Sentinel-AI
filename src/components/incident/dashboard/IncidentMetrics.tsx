import React from "react";
import type { LucideIcon } from "lucide-react";

import MetricCard, { type MetricTrend } from "@/components/common/MetricCard";
import EmptyState from "@/components/common/EmptyState";

export interface MetricItem {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export interface IncidentMetricsProps {
  metrics: MetricItem[];
  className?: string;
}

export const IncidentMetrics: React.FC<IncidentMetricsProps> = ({
  metrics,
  className = "",
}) => {
  if (metrics.length === 0) {
    return (
      <EmptyState
        title="No metrics available"
        description="Incident metrics will appear after AI analysis."
        className={className}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((item) => {
        const trendDirection: MetricTrend | undefined = item.trend
          ? item.trend.positive
            ? "up"
            : "down"
          : undefined;

        return (
          <MetricCard
            key={item.id}
            title={item.title}
            value={item.value}
            icon={item.icon}
            trend={trendDirection}
            trendValue={item.trend?.value}
          />
        );
      })}
    </div>
  );
};

export default React.memo(IncidentMetrics);