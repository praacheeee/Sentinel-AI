import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  icon: Icon,
  className = "",
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-500 shrink-0 shadow-xs">
            <Icon className="w-5 h-5 text-current" aria-hidden="true" />
          </div>
        )}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex items-center shrink-0 self-start sm:self-center">
          {action}
        </div>
      )}
    </motion.header>
  );
};

export default SectionHeader;
