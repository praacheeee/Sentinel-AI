import React from "react";

export interface LoadingSkeletonProps {
  variant?: "card" | "line" | "table-row" | "circle";
  count?: number;
  className?: string;
}

const BASE_SKELETON_CLASS = "animate-pulse bg-[#21262D]";

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = "line",
  count = 1,
  className = "",
}) => {
  const renderVariant = (key: number) => {
    switch (variant) {
      case "card":
        return (
          <div
            key={key}
            className={`h-[140px] w-full rounded-2xl border border-[#30363D] ${BASE_SKELETON_CLASS} ${className}`}
          />
        );

      case "line":
        return (
          <div
            key={key}
            className={`h-4 w-full rounded ${BASE_SKELETON_CLASS} ${className}`}
          />
        );

      case "table-row":
        return (
          <div
            key={key}
            className={`flex items-center gap-4 w-full p-4 border-b border-[#30363D] bg-transparent ${className}`}
          >
            <div className={`h-4 w-1/6 rounded ${BASE_SKELETON_CLASS}`} />
            <div className={`h-4 w-2/6 rounded ${BASE_SKELETON_CLASS}`} />
            <div className={`h-4 w-1/6 rounded ${BASE_SKELETON_CLASS}`} />
            <div className={`h-4 w-1/6 rounded ${BASE_SKELETON_CLASS}`} />
            <div className={`h-4 w-1/12 rounded ${BASE_SKELETON_CLASS}`} />
            <div className={`h-4 w-1/12 rounded ${BASE_SKELETON_CLASS}`} />
          </div>
        );

      case "circle":
        return (
          <div
            key={key}
            className={`w-12 h-12 rounded-full border border-[#30363D] shrink-0 ${BASE_SKELETON_CLASS} ${className}`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => renderVariant(index))}
    </div>
  );
};

export default React.memo(LoadingSkeleton);