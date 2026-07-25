import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

export type MetricTrend = "up" | "down" | "neutral";
export type MetricStatus = "healthy" | "warning" | "critical";

export interface MetricCardProps {
  /** Small category title / label */
  title: string;
  /** Primary numeric or textual metric value */
  value: string | number;
  /** Optional secondary subtitle or contextual note */
  subtitle?: string;
  /** Optional Lucide icon component */
  icon?: LucideIcon;
  /** Optional direction for trend indicator */
  trend?: MetricTrend;
  /** Optional trend percentage or change descriptor (e.g. "+12.4%") */
  trendValue?: string;
  /** Optional measurement unit suffix (e.g. "ms", "%", "nodes") */
  unit?: string;
  /** Optional loading skeleton state */
  loading?: boolean;
  /** Optional system node status indicator */
  status?: MetricStatus;
  /** Optional custom class names */
  className?: string;
  /** Optional click handler for interactive card filtering */
  onClick?: () => void;
}

const STATUS_CONFIG: Record<MetricStatus, { color: string; label: string }> = {
  healthy: { color: "bg-emerald-400", label: "System Operational" },
  warning: { color: "bg-amber-400", label: "Warning Level" },
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
  // Render Loading Skeleton State
  if (loading) {
    return (
      <div
        className={`relative flex flex-col justify-between p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-lg animate-pulse min-h-[140px] ${className}`}
        aria-busy="true"
        aria-label={`Loading metric for ${title}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 bg-[#30363D] rounded" />
          <div className="h-8 w-8 bg-[#30363D] rounded-lg" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <div className="h-8 w-28 bg-[#30363D] rounded" />
          <div className="h-4 w-10 bg-[#30363D] rounded" />
        </div>
        <div className="h-3 w-36 bg-[#30363D] rounded" />
      </div>
    );
  }

  const renderTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case "down":
        return <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case "neutral":
      default:
        return <Minus className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
    }
  };

  const getTrendBadgeStyles = () => {
    switch (trend) {
      case "up":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "down":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "neutral":
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <motion.div
      tabIndex={0}
      onClick={onClick}
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
      className={`group relative flex flex-col justify-between p-5 rounded-xl bg-[#161B22] border border-[#30363D] hover:border-[#A8E6CF]/40 hover:shadow-xl hover:shadow-[#A8E6CF]/5 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]/50 transition-all duration-200 select-none overflow-hidden cursor-pointer ${className}`}
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
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase font-mono truncate">
            {title}
          </span>
        </div>

        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0D1117] border border-[#30363D] text-gray-400 group-hover:text-[#A8E6CF] group-hover:border-[#A8E6CF]/30 transition-colors shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Center Row: Primary Metric Display */}
      <div className="my-2.5 flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-[#F3F4F6] break-all">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium font-mono text-[#9CA3AF]">
            {unit}
          </span>
        )}
      </div>

      {/* Footer Row: Trend Badge and Subtitle */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {trendValue && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-mono font-medium ${getTrendBadgeStyles()}`}
          >
            {renderTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}

        {subtitle && (
          <span className="text-[11px] text-[#9CA3AF] truncate ml-auto">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;