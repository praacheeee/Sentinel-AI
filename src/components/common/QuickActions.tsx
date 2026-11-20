import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { QuickActionItem } from "@/types/dashboard";

export type { QuickActionItem };

export interface QuickActionsProps {
  title?: string;
  subtitle?: string;
  actions: QuickActionItem[];
  className?: string;
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const cardVariants: any = {
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

export const QuickActions: React.FC<QuickActionsProps> = ({
  title,
  subtitle,
  actions = [],
  className = "",
}) => {
  if (!actions.length) return null;

  return (
    <div className={`space-y-3 w-full select-none ${className}`}>
      {/* Header Area */}
      {(title || subtitle) && (
        <div className="flex flex-col gap-0.5">
          {title && (
            <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-slate-700 dark:text-slate-300">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
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
                      transition: { duration: 0.15, ease: "easeOut" },
                    }
              }
              type="button"
              disabled={action.disabled}
              onClick={action.onClick}
              aria-label={`${action.title}: ${action.description}`}
              className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                action.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
              }`}
            >
              {/* Top Row: Icon, Optional Badge, Navigation Arrow */}
              <div className="flex items-start justify-between gap-2 mb-3 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  {action.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {action.badge}
                    </span>
                  )}

                  <div className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Bottom Content: Title & Description */}
              <div className="flex flex-col gap-1 w-full">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
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
