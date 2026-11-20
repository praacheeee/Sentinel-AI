import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  RefreshCw,
  Cpu,
  Activity,
  AlertTriangle,
  ShieldX,
} from "lucide-react";

export type SystemStatus = "Operational" | "Degraded" | "Offline";

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  lastUpdated?: string;
  status?: SystemStatus;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  SystemStatus,
  {
    label: string;
    badgeStyle: string;
    dotStyle: string;
    icon: React.ElementType;
  }
> = {
  Operational: {
    label: "YOLOv8 Engine Operational",
    badgeStyle:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotStyle: "bg-emerald-500",
    icon: Activity,
  },
  Degraded: {
    label: "Telemetry Degraded",
    badgeStyle: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    dotStyle: "bg-amber-500",
    icon: AlertTriangle,
  },
  Offline: {
    label: "Engine Disconnected",
    badgeStyle: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    dotStyle: "bg-rose-500",
    icon: ShieldX,
  },
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  icon: HeaderIcon,
  lastUpdated = "Just now",
  status = "Operational",
  refreshing = false,
  onRefresh,
  className = "",
}) => {
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const statusMeta = STATUS_CONFIG[status];
  const StatusIcon = statusMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        flex flex-col md:flex-row md:items-center justify-between gap-4
        p-6 rounded-2xl
        bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md
        border border-slate-200/90 dark:border-slate-800/80
        shadow-sm hover:shadow-md transition-shadow
        select-none ${className}
      `}
    >
      {/* Ambient Top Glow Accent */}
      <div className="pointer-events-none absolute -top-12 left-1/4 w-72 h-20 bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl" />

      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <div className="flex items-center gap-3 flex-wrap">
          {HeaderIcon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <HeaderIcon className="w-5 h-5" />
            </div>
          )}

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>

          {/* AI System Status */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium shadow-xs ${statusMeta.badgeStyle}`}
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
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 self-start md:self-center flex-wrap shrink-0 relative z-10">
        {/* Date / Sync Telemetry Pill */}
        <div
          className="
            flex items-center gap-3 px-3.5 py-2 rounded-xl
            bg-slate-100/70 dark:bg-slate-900/60
            border border-slate-200 dark:border-slate-800
            text-xs font-mono text-slate-600 dark:text-slate-400
            shadow-xs
          "
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Sync: {lastUpdated}</span>
          </div>
        </div>

        {/* Manual Refresh Trigger */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh telemetry data"
          className="
            flex items-center justify-center p-2.5 rounded-xl
            bg-slate-100/70 dark:bg-slate-900/60
            border border-slate-200 dark:border-slate-800
            text-slate-600 dark:text-slate-300
            hover:text-emerald-600 dark:hover:text-emerald-400
            hover:border-emerald-500/40
            transition-all cursor-pointer shadow-xs
            focus:outline-none focus:ring-2 focus:ring-emerald-500/30
            disabled:opacity-50
          "
        >
          <RefreshCw
            className={`w-4 h-4 text-emerald-500 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default React.memo(DashboardHeader);
