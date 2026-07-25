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
        <div className="p-4 rounded-full bg-[#21262D] border border-[#30363D] text-[#8B949E] mb-4 shrink-0">
          <Icon className="w-8 h-8 text-current" aria-hidden="true" />
        </div>
      )}

      <h3 className="text-lg font-bold text-[#F0F6FC] tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-[#8B949E] mt-1.5 max-w-[420px] leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </motion.div>
  );
};

export default React.memo(EmptyState);