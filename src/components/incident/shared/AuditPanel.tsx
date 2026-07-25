import React from "react";
import { ShieldCheck } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface AuditPanelProps {
  entries: AuditEntry[];
  loading?: boolean;
  className?: string;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({
  entries,
  loading = false,
  className = "",
}) => {
  return (
    <SectionContainer className={className}>
      <SectionHeader
        title="Audit Trail"
        subtitle="Chronological record of system and user activity."
        icon={ShieldCheck}
      />

      {loading ? (
        <LoadingSkeleton variant="line" count={4} />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No audit records"
          description="No activity has been recorded."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex flex-col gap-2"
            >
              {/* Top Row: Actor & Timestamp */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded-md border border-[#58A6FF]/20 break-words">
                  {entry.actor}
                </span>
                <time className="text-xs font-mono text-[#8B949E] shrink-0 pt-0.5">
                  {entry.timestamp}
                </time>
              </div>

              {/* Second Row: Action */}
              <h4 className="text-sm font-semibold text-[#F0F6FC]">
                {entry.action}
              </h4>

              {/* Third Row: Details */}
              <p className="text-xs text-[#8B949E] leading-relaxed">
                {entry.details}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionContainer>
  );
};

export default React.memo(AuditPanel);