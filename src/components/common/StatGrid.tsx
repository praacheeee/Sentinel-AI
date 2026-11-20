import React from "react";
import { motion } from "framer-motion";

import MetricCard from "./MetricCard";
import type { StatItem } from "@/types/dashboard";

export interface StatGridProps {
  metrics: StatItem[];
  loading?: boolean;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const StatGrid: React.FC<StatGridProps> = ({
  metrics = [],
  loading = false,
  className = "",
}) => {
  if (!metrics.length && !loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0E1524]/80 p-8 text-xs font-mono text-slate-400 select-none w-full">
        No telemetry metrics available.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}
    >
      {metrics.map((metric) => (
        <motion.div key={metric.id} variants={itemVariants}>
          <MetricCard {...metric} loading={loading} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatGrid;
