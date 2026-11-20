import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

export type MetricTrend = "up" | "down" | "neutral";
export type MetricStatus = "healthy" | "warning" | "critical";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: MetricTrend;
  trendValue?: string;
  unit?: string;
  loading?: boolean;
  status?: MetricStatus;
  className?: string;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<MetricStatus, { color: string; label: string }> = {
  healthy: { color: "bg-emerald-500", label: "System Operational" },
  warning: { color: "bg-amber-500", label: "Warning Level" },
  critical: { color: "bg-rose-500", label: "Critical Condition" },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  unit,
  loading = false,
  status,
  className = "",
  onClick,
}) => {
  if (loading) {
    return (
      <div
        className={`relative flex flex-col justify-between p-5 rounded-2xl bg-white/70 dark:bg-[#0E1524]/70 border border-slate-200 dark:border-slate-800 animate-pulse min-h-[140px] ${className}`}
        aria-busy="true"
        aria-label={`Loading metric for ${title}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const renderTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />;
      case "neutral":
      default:
        return <Minus className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  };

  const getTrendBadgeStyles = () => {
    switch (trend) {
      case "up":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "down":
        return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "neutral":
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <motion.div
      tabIndex={0}
      onClick={onClick}
      whileHover={{
        y: -3,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 select-none overflow-hidden cursor-pointer ${className}`}
      role="region"
      aria-label={`${title} Metric Card`}
    >
      {/* Top Header Row: Title, Status Node, and Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {status && (
            <span
              className="relative flex h-2 w-2"
              title={STATUS_CONFIG[status].label}
            >
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${STATUS_CONFIG[status].color}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${STATUS_CONFIG[status].color}`}
              />
            </span>
          )}
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono truncate">
            {title}
          </span>
        </div>

        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-colors shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Center Row: Primary Metric Display */}
      <div className="my-2 flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white break-all">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium font-mono text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {/* Footer Row: Trend Badge and Subtitle */}
      <div className="flex items-center justify-between gap-2 text-xs pt-1">
        {trendValue && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-mono font-medium ${getTrendBadgeStyles()}`}
          >
            {renderTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}

        {subtitle && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate ml-auto">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
