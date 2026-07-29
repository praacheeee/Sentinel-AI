import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, RefreshCw, Cpu, Activity, AlertTriangle, ShieldX } from "lucide-react";

export type SystemStatus = "Operational" | "Degraded" | "Offline";

export interface DashboardHeaderProps {
  /** Primary page or view title */
  title: string;
  /** Secondary subtitle or view summary description */
  subtitle?: string;
  /** ISO string or pre-formatted timestamp for last AI engine sync */
  lastUpdated?: string;
  /** Overall operational state of AI system nodes */
  status?: SystemStatus;
  /** Parent-controlled refreshing indicator state */
  refreshing?: boolean;
  /** Callback fired when user triggers manual telemetry refresh */
  onRefresh?: () => void;
  /** Optional custom container CSS classes */
  className?: string;
}

const STATUS_CONFIG: Record<
  SystemStatus,
  { label: string; badgeStyle: string; dotStyle: string; icon: React.ElementType }
> = {
  Operational: {
    label: "YOLOv8 Operational",
    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotStyle: "bg-emerald-400",
    icon: Activity,
  },
  Degraded: {
    label: "System Degraded",
    badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotStyle: "bg-amber-400",
    icon: AlertTriangle,
  },
  Offline: {
    label: "AI Engine Offline",
    badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotStyle: "bg-rose-500",
    icon: ShieldX,
  },
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  lastUpdated = "Just now",
  status = "Operational",
  refreshing = false,
  onRefresh,
  className = "",
}) => {
  // Memoized date string formatted as "Tue, 21 Jul 2026"
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const statusMeta = STATUS_CONFIG[status];
  const StatusIcon = statusMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-lg select-none ${className}`}
    >
      {/* Title & Subtitle Area */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-[#F3F4F6]">
            {title}
          </h1>

          {/* AI System Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-xs font-mono font-medium ${statusMeta.badgeStyle}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusMeta.dotStyle}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${statusMeta.dotStyle}`}
              />
            </span>
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{statusMeta.label}</span>
          </div>
        </div>

        {subtitle && (
          <p className="text-xs md:text-sm text-[#9CA3AF] max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls Area: Date, Sync Time, and Refresh */}
      <div className="flex items-center gap-3 self-start md:self-center flex-wrap shrink-0">
        {/* Telemetry Metadata Pills */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs font-mono text-[#9CA3AF]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <span className="text-[#30363D]">|</span>

          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#A8E6CF] shrink-0" />
            <span>Sync: {lastUpdated}</span>
          </div>
        </div>

        {/* Manual Telemetry Refresh Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh telemetry data"
          className="flex items-center justify-center p-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-gray-300 hover:text-white hover:border-[#A8E6CF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]/50 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#A8E6CF] ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default React.memo(DashboardHeader);