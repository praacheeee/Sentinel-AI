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
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-[#A8E6CF] shrink-0">
            <Icon className="w-5 h-5 text-current" aria-hidden="true" />
          </div>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#F0F6FC] tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[#8B949E] mt-0.5 leading-relaxed">
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