import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { QuickActionItem } from "@/types/dashboard";



export interface QuickActionsProps {
  /** Section title */
  title?: string;
  /** Section subtitle or contextual hint */
  subtitle?: string;
  /** List of quick action items to display */
  actions: QuickActionItem[];
  /** Optional custom container CSS classes */
  className?: string;
}

// Framer Motion Animation Variants for Staggered Grid Reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const cardVariants = {
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

export const QuickActions: React.FC<QuickActionsProps> = ({
  title,
  subtitle,
  actions = [],
  className = "",
}) => {
  if (!actions.length) return null;

  return (
    <div className={`space-y-4 w-full select-none ${className}`}>
      {/* Header Area */}
      {(title || subtitle) && (
        <div className="flex flex-col gap-0.5">
          {title && (
            <h2 className="text-base font-bold font-mono tracking-tight text-[#F3F4F6]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-[#9CA3AF] font-normal">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
      >
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.id}
              variants={cardVariants}
              whileHover={
                action.disabled
                  ? {}
                  : {
                      y: -3,
                      scale: 1.01,
                      transition: { duration: 0.15, ease: "easeOut" },
                    }
              }
              type="button"
              disabled={action.disabled}
              onClick={action.onClick}
              aria-label={`${action.title}: ${action.description}`}
              className={`group relative flex flex-col justify-between p-4 rounded-xl bg-[#161B22] border border-[#30363D] text-left transition-all duration-200 focus:outline-none focus:border-[#A8E6CF] focus:ring-2 focus:ring-[#A8E6CF]/50 ${
                action.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:border-[#A8E6CF]/40 hover:shadow-lg hover:shadow-[#A8E6CF]/5"
              }`}
            >
              {/* Top Row: Icon, Optional Badge, Navigation Arrow */}
              <div className="flex items-start justify-between gap-2 mb-3 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0D1117] border border-[#30363D] text-gray-400 group-hover:text-[#A8E6CF] group-hover:border-[#A8E6CF]/30 transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  {action.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded-full bg-[#A8E6CF]/10 text-[#A8E6CF] border border-[#A8E6CF]/20">
                      {action.badge}
                    </span>
                  )}

                  <div className="text-gray-500 group-hover:text-[#A8E6CF] group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Bottom Content: Title & Description */}
              <div className="flex flex-col gap-1 w-full">
                <h3 className="text-sm font-semibold text-[#F3F4F6] group-hover:text-white transition-colors truncate">
                  {action.title}
                </h3>
                <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default React.memo(QuickActions);