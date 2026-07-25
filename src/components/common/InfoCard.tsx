import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface InfoCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h2" | "h3" | "h4";
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  action,
  as: HeadingTag = "h3",
  className = "",
}) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-2xl border border-[#30363D] bg-[#161B22] p-6 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-[#21262D] border border-[#30363D] text-[#58A6FF] shrink-0">
              <Icon className="w-5 h-5 text-current" aria-hidden="true" />
            </div>
          )}
          <div>
            <HeadingTag className="text-lg font-semibold text-[#F0F6FC] leading-snug">
              {title}
            </HeadingTag>
            {description && (
              <p className="text-sm text-[#8B949E] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="flex items-center shrink-0 self-start">
            {action}
          </div>
        )}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </motion.article>
  );
};

export default React.memo(InfoCard);