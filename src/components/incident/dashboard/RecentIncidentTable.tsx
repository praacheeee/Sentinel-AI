import React from "react";
import { motion } from "framer-motion";
import { Eye, AlertCircle } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "Open" | "Investigating" | "In Progress" | "Resolved";

export interface Incident {
  id: string;
  location: string;
  category: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  confidence: number;
  detectedAt: string;
}

export interface RecentIncidentsTableProps {
  /** Optional custom section title */
  title?: string;
  /** Optional custom section subtitle */
  subtitle?: string;
  /** Array of recent incident records to render */
  incidents: Incident[];
  /** Callback triggered when viewing incident details */
  onView?: (incident: Incident) => void;
  /** Optional custom container CSS classes */
  className?: string;
}

const SEVERITY_BADGE_STYLES: Record<SeverityLevel, string> = {
  Critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  High: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const STATUS_BADGE_STYLES: Record<
  IncidentStatus,
  { badge: string; dot: string }
> = {
  Open: {
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dot: "bg-rose-400",
  },
  Investigating: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  "In Progress": {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
  },
  Resolved: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
};

export const RecentIncidentsTable: React.FC<RecentIncidentsTableProps> = ({
  title = "Recent Infrastructure Incidents",
  subtitle = "Real-time telemetric detections across active municipal monitoring zones.",
  incidents = [],
  onView,
  className = "",
}) => {
  // Column definitions configured for DataTable
  const columns: ColumnDef<Incident>[] = [
    {
      header: "Location",
      accessorKey: "location",
      cell: (item) => (
        <span className="font-medium text-white">{item.location}</span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (item) => (
        <span className="text-gray-300 font-mono text-xs">{item.category}</span>
      ),
    },
    {
      header: "Severity",
      accessorKey: "severity",
      cell: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${
            SEVERITY_BADGE_STYLES[item.severity]
          }`}
        >
          {item.severity}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => {
        const style = STATUS_BADGE_STYLES[item.status];
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${style.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {item.status}
          </span>
        );
      },
    },
    {
      header: "AI Confidence",
      accessorKey: "confidence",
      cell: (item) => (
        <span className="font-mono text-xs font-semibold text-[#A8E6CF]">
          {item.confidence}%
        </span>
      ),
    },
    {
      header: "Detected",
      accessorKey: "detectedAt",
      cell: (item) => (
        <span className="text-gray-400 text-xs font-mono">
          {item.detectedAt}
        </span>
      ),
    },
    {
      header: "Action",
      id: "actions",
      cell: (item) => (
        <button
          onClick={() => onView && onView(item)}
          type="button"
          aria-label={`View details for incident at ${item.location}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs font-medium text-gray-300 hover:text-white hover:border-[#A8E6CF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]/50"
        >
          <Eye className="w-3.5 h-3.5 text-[#A8E6CF]" />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <SectionContainer className={className}>
      <SectionHeader title={title} subtitle={subtitle} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mt-4"
      >
        {!incidents.length ? (
          <EmptyState
            icon={AlertCircle}
            title="No Recent Incidents"
            description="No infrastructure anomalies detected across active zones."
          />
        ) : (
          <DataTable data={incidents} columns={columns} />
        )}
      </motion.div>
    </SectionContainer>
  );
};

export default React.memo(RecentIncidentsTable);