import React from "react";
import { FileText, Hash, Users, Calendar, Clock, ShieldAlert, CheckCircle } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import InfoCard from "@/components/common/InfoCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import {
  SEVERITY_BADGE_STYLES,
  type IncidentSeverity,
} from "@/constants/incident";

export interface WorkOrderPreviewProps {
  workOrderId: string;
  assignedTeam: string;
  priority: IncidentSeverity;
  status: string;
  scheduledDate: string;
  estimatedCompletion: string;
  summary: string;
  requiredResources: string[];
  loading?: boolean;
  className?: string;
}

export const WorkOrderPreview: React.FC<WorkOrderPreviewProps> = ({
  workOrderId,
  assignedTeam,
  priority,
  status,
  scheduledDate,
  estimatedCompletion,
  summary,
  requiredResources,
  loading = false,
  className = "",
}) => {
  const isEmpty = !workOrderId.trim();

  return (
    <SectionContainer className={className}>
      <SectionHeader
        title="Work Order Preview"
        subtitle="AI-generated maintenance work order."
        icon={FileText}
      />

      {loading ? (
        <LoadingSkeleton variant="card" count={2} />
      ) : isEmpty ? (
        <EmptyState
          title="No work order"
          description="No work order has been generated."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <InfoCard
            title="Work Order Details"
            description="Primary maintenance assignment information."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Work Order ID */}
              <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#8B949E]">
                  <Hash className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">Work Order ID</span>
                </div>
                <span className="font-mono text-sm font-semibold text-[#58A6FF]">
                  {workOrderId}
                </span>
              </div>

              {/* Assigned Team */}
              <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#8B949E]">
                  <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">Assigned Team</span>
                </div>
                <span className="text-sm font-semibold text-[#F0F6FC]">
                  {assignedTeam}
                </span>
              </div>

              {/* Priority */}
              <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#8B949E]">
                  <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">Priority</span>
                </div>
                <span
                  className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    SEVERITY_BADGE_STYLES[priority]
                  }`}
                >
                  {priority}
                </span>
              </div>

              {/* Status */}
              <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#8B949E]">
                  <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">Status</span>
                </div>
                <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#161B22] text-[#8B949E] border border-[#30363D]">
                  {status}
                </span>
              </div>

              {/* Scheduled Date */}
              <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#8B949E]">
                  <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">Scheduled Date</span>
                </div>
                <span className="text-sm font-semibold text-[#F0F6FC]">
                  {scheduledDate}
                </span>
              </div>

              {/* Estimated Completion */}
              <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#8B949E]">
                  <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">Estimated Completion</span>
                </div>
                <span className="text-sm font-semibold text-[#F0F6FC]">
                  {estimatedCompletion}
                </span>
              </div>
            </div>
          </InfoCard>

          {summary.trim() && (
            <InfoCard
              title="Task Summary"
              description="Overview of the planned maintenance activity."
            >
              <p className="text-base text-[#F0F6FC] leading-relaxed">
                {summary}
              </p>
            </InfoCard>
          )}

          {requiredResources.length > 0 && (
            <InfoCard
              title="Required Resources"
              description="Personnel, equipment and materials required."
            >
              <div className="flex flex-wrap gap-2">
                {requiredResources.map((resource, index) => (
                  <span
                    key={`${resource}-${index}`}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-[#21262D] text-[#F0F6FC] border border-[#30363D]"
                  >
                    {resource}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      )}
    </SectionContainer>
  );
};

export default React.memo(WorkOrderPreview);