import React from "react";
import { ClipboardCheck } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import InfoCard from "@/components/common/InfoCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export interface AssessmentItem {
  id: string;
  label: string;
  value: string;
}

export interface ExecutiveAssessmentProps {
  summary: string;
  items: AssessmentItem[];
  loading?: boolean;
  className?: string;
}

export const ExecutiveAssessment: React.FC<ExecutiveAssessmentProps> = ({
  summary,
  items,
  loading = false,
  className = "",
}) => {
  const isEmpty = !summary.trim() && items.length === 0;

  return (
    <SectionContainer className={className}>
      <SectionHeader
        title="Executive Assessment"
        subtitle="High-level AI summary for operational decision makers."
        icon={ClipboardCheck}
      />

      {loading ? (
        <LoadingSkeleton variant="card" count={2} />
      ) : isEmpty ? (
        <EmptyState
          title="No executive assessment"
          description="Run AI analysis to generate an executive summary."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {summary.trim() && (
            <InfoCard
              title="Executive Summary"
              description="AI-generated overview of the incident and recommended operational focus."
            >
              <p className="text-base text-[#F0F6FC] leading-relaxed">
                {summary}
              </p>
            </InfoCard>
          )}

          {items.length > 0 && (
            <InfoCard
              title="Key Assessment"
              description="Critical indicators identified during AI evaluation."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-medium text-[#8B949E]">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-[#F0F6FC] shrink-0">
                      {item.value}
                    </span>
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

export default React.memo(ExecutiveAssessment);