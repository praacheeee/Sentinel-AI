import React from "react";
import { Activity } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import InfoCard from "@/components/common/InfoCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export interface ImpactMetric {
  id: string;
  title: string;
  value: string;
  description: string;
}

export interface InfrastructureImpactProps {
  overallImpact: string;
  metrics: ImpactMetric[];
  loading?: boolean;
  className?: string;
}

export const InfrastructureImpact: React.FC<InfrastructureImpactProps> = ({
  overallImpact,
  metrics,
  loading = false,
  className = "",
}) => {
  const isEmpty = !overallImpact.trim() && metrics.length === 0;

  return (
    <SectionContainer className={className}>
      <SectionHeader
        title="Infrastructure Impact"
        subtitle="Assessment of operational and public impact."
        icon={Activity}
      />

      {loading ? (
        <LoadingSkeleton variant="card" count={2} />
      ) : isEmpty ? (
        <EmptyState
          title="No impact assessment"
          description="Run an AI analysis to generate infrastructure impact."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {overallImpact.trim() && (
            <InfoCard
              title="Overall Assessment"
              description="Summary of the predicted infrastructure impact."
            >
              <p className="text-base text-[#F0F6FC] leading-relaxed">
                {overallImpact}
              </p>
            </InfoCard>
          )}

          {metrics.length > 0 && (
            <InfoCard
              title="Impact Metrics"
              description="Key operational metrics evaluated by the AI."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#F0F6FC]">
                        {metric.title}
                      </h4>
                      <span className="text-sm font-semibold text-[#58A6FF] shrink-0">
                        {metric.value}
                      </span>
                    </div>

                    <p className="text-xs text-[#8B949E] leading-relaxed">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      )}
    </SectionContainer>
  );
};

export default React.memo(InfrastructureImpact);