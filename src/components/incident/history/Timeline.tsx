import React from "react";
import { History } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "Completed" | "Current" | "Pending";
}

export interface TimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
  className?: string;
}

const statusIndicatorStyles: Record<TimelineEvent["status"], { circle: string; innerCircle?: string }> = {
  Completed: {
    circle: "w-4 h-4 bg-[#238636] ring-4 ring-[#238636]/20",
  },
  Current: {
    circle: "w-5 h-5 bg-[#58A6FF] border-2 border-[#0D1117] ring-4 ring-[#58A6FF]/25",
    innerCircle: "w-2 h-2 rounded-full bg-white",
  },
  Pending: {
    circle: "w-4 h-4 bg-[#21262D] border-2 border-[#30363D]",
  },
};

export const Timeline: React.FC<TimelineProps> = ({
  events,
  loading = false,
  className = "",
}) => {
  return (
    <SectionContainer className={className}>
      <SectionHeader
        title="Incident Timeline"
        subtitle="Chronological progression of incident detection and response."
        icon={History}
      />

      {loading ? (
        <LoadingSkeleton variant="line" count={4} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No timeline available"
          description="No timeline events have been recorded."
        />
      ) : (
        <ol className="relative flex flex-col gap-6 pl-3">
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            const style = statusIndicatorStyles[event.status];

            return (
              <li key={event.id} className="relative flex gap-4 items-start group">
                {/* Connector line */}
                {!isLast && (
                  <span
                    className="absolute left-[7px] top-5 -bottom-6 w-0.5 bg-[#30363D]"
                    aria-hidden="true"
                  />
                )}

                {/* Status Indicator Circle */}
                <div className="relative z-10 flex items-center justify-center pt-0.5 shrink-0 w-4">
                  <div
                    className={`rounded-full flex items-center justify-center ${style.circle}`}
                  >
                    {style.innerCircle && <div className={style.innerCircle} />}
                  </div>
                </div>

                {/* Event Content Box */}
                <div className="flex-1 p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex flex-col gap-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-semibold text-[#F0F6FC]">
                      {event.title}
                    </h4>
                    <time className="text-xs font-mono text-[#8B949E] shrink-0">
                      {event.timestamp}
                    </time>
                  </div>

                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionContainer>
  );
};

export default React.memo(Timeline);