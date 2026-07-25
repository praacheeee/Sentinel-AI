import React from "react";
import type { LucideIcon } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";

export interface ActionItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}

export interface ActionBarProps {
  actions: ActionItem[];
  className?: string;
}

const variantStyles: Record<
  NonNullable<ActionItem["variant"]>,
  string
> = {
  primary:
    "bg-[#58A6FF] text-white hover:bg-[#3fb950] border border-transparent focus:ring-[#58A6FF]/40",
  secondary:
    "bg-[#21262D] text-[#F0F6FC] hover:bg-[#30363D] hover:text-[#58A6FF] border border-[#30363D] focus:ring-[#58A6FF]/40",
  danger:
    "bg-[#DA3633]/15 text-[#F85149] hover:bg-[#DA3633]/25 border border-[#DA3633]/40 focus:ring-[#F85149]/40",
};

export const ActionBar: React.FC<ActionBarProps> = ({
  actions,
  className = "",
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <SectionContainer className={className}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const variant = action.variant || "secondary";
          const isDisabled = Boolean(action.disabled);

          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant]}`}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default React.memo(ActionBar);