import React from "react";
import { motion } from "framer-motion";

import MetricCard from "./MetricCard";
import type { StatItem } from "@/types/dashboard";

export interface StatGridProps {
  /** List of metric items to render in the grid */
  metrics: StatItem[];

  /** Optional loading override that renders skeletons across all items */
  loading?: boolean;

  /** Optional custom grid container styles */
  className?: string;
}

// Framer Motion Animation Variants for Staggered Grid Reveal
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

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
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
  // Empty State Guard
  if (!metrics.length && !loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#30363D] bg-[#161B22] p-10 text-sm text-gray-400 select-none w-full">
        No metrics available.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full ${className}`}
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