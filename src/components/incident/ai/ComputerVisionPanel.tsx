import React from "react";
import { Eye } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import InfoCard from "@/components/common/InfoCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import {
  SEVERITY_BADGE_STYLES,
  formatConfidence,
  type IncidentSeverity,
} from "@/constants/incident";

export interface DetectionResult {
  id: string;
  label: string;
  confidence: number;
  severity: IncidentSeverity;
}

export interface ComputerVisionPanelProps {
  imageUrl?: string;
  detections: DetectionResult[];
  loading?: boolean;
  className?: string;
}

export const ComputerVisionPanel: React.FC<ComputerVisionPanelProps> = ({
  imageUrl,
  detections,
  loading = false,
  className = "",
}) => {
  return (
    <SectionContainer className={className}>
      <SectionHeader
        title="Computer Vision Analysis"
        subtitle="AI-powered infrastructure defect detection"
        icon={Eye}
      />

      {loading ? (
        <LoadingSkeleton variant="card" count={2} />
      ) : !imageUrl ? (
        <EmptyState
          title="No image available"
          description="Upload an infrastructure image to begin AI analysis."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="rounded-xl overflow-hidden border border-[#30363D] bg-[#0D1117] aspect-video w-full">
            <img
              src={imageUrl}
              alt="Infrastructure inspection target"
              className="w-full h-full object-cover"
            />
          </div>

          <InfoCard
            title="Detection Results"
            description="Objects detected by the computer vision model."
          >
            {detections.length === 0 ? (
              <EmptyState
                title="No detections"
                description="The AI model did not detect any infrastructure issues."
              />
            ) : (
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {detections.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#21262D] border border-[#30363D]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#F0F6FC]">
                        {item.label}
                      </span>
                      <span className="text-xs text-[#8B949E] bg-[#161B22] px-2 py-0.5 rounded-full border border-[#30363D]">
                        {formatConfidence(item.confidence)}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        SEVERITY_BADGE_STYLES[item.severity]
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>
        </div>
      )}
    </SectionContainer>
  );
};

export default React.memo(ComputerVisionPanel);