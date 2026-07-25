import React from "react";
import type { LucideIcon } from "lucide-react";

import MetricCard from "@/components/common/MetricCard";
import StatGrid from "@/components/common/StatGrid";
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
    <StatGrid className={className}>
      {metrics.map(({ id, ...metricProps }) => (
        <MetricCard key={id} {...metricProps} />
      ))}
    </StatGrid>
  );
};

export default React.memo(IncidentMetrics);