import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      {Icon && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 mb-4 shrink-0 shadow-xs">
          <Icon className="w-8 h-8 text-current" aria-hidden="true" />
        </div>
      )}

      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </motion.div>
  );
};

export default React.memo(EmptyState);
