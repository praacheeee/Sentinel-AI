import React from "react";
import { motion } from "framer-motion";
import { Clock, ShieldAlert } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";

import { type InspectionRecord } from "@/utils/inspectionHistory";

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";

export type Incident = InspectionRecord;

export interface RecentIncidentsTableProps {
  title?: string;
  subtitle?: string;
  incidents: (Incident | InspectionRecord)[];
  className?: string;
}

const SEVERITY_BADGE_STYLES: Record<SeverityLevel, string> = {
  Critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  High: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export const RecentIncidentsTable: React.FC<RecentIncidentsTableProps> = ({
  title = "Recent Inspection Telemetry",
  subtitle = "Live log of roadway pavement scans processed by the YOLOv8 pothole engine.",
  incidents = [],
  className = "",
}) => {
  const columns: ColumnDef<Incident>[] = [
    {
      header: "Defect Type",
      accessorKey: "category",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">
            {item.category}
          </span>
        </div>
      ),
    },
    {
      header: "Provisional Severity",
      accessorKey: "severity",
      cell: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium shadow-xs ${
            SEVERITY_BADGE_STYLES[item.severity]
          }`}
        >
          {item.severity}
        </span>
      ),
    },
    {
      header: "Peak Raw Confidence",
      accessorKey: "confidence",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden hidden sm:block">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(item.confidence, 100)}%` }}
            />
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {item.confidence.toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (item) => {
        const seconds = Math.floor((Date.now() - item.timestamp) / 1000);

        let timeAgo = "Just now";
        if (seconds >= 86400) {
          const days = Math.floor(seconds / 86400);
          timeAgo = `${days}d ago`;
        } else if (seconds >= 3600) {
          const hours = Math.floor(seconds / 3600);
          timeAgo = `${hours}h ago`;
        } else if (seconds >= 60) {
          const minutes = Math.floor(seconds / 60);
          timeAgo = `${minutes}m ago`;
        }

        return (
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo}</span>
          </div>
        );
      },
    },
  ];

  return (
    <SectionContainer className={className}>
      <SectionHeader title={title} subtitle={subtitle} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mt-4"
      >
        {!incidents.length ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Pothole Inspections Logged"
            description="Run an AI Inspection from the top navigation to analyze a roadway image and view real-time triage telemetry."
          />
        ) : (
          <DataTable data={incidents as any} columns={columns as any} />
        )}
      </motion.div>
    </SectionContainer>
  );
};

export default React.memo(RecentIncidentsTable);
