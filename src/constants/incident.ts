export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";

export const SEVERITY_BADGE_STYLES: Record<IncidentSeverity, string> = {
  Low: "bg-[#238636]/15 text-[#3FB950] border-[#238636]/40",
  Medium: "bg-[#D29922]/15 text-[#F2CC60] border-[#D29922]/40",
  High: "bg-[#DB6D28]/15 text-[#F0883E] border-[#DB6D28]/40",
  Critical: "bg-[#DA3633]/15 text-[#F85149] border-[#DA3633]/40",
};

/**
 * Clamps and normalizes values to a standard 0-100 percentage.
 * Handles both standard proportions (0.0 - 1.0) and raw percentages (0 - 100).
 */
export const normalizePercentage = (value: number): number => {
  if (isNaN(value)) return 0;
  const percentage = value <= 1 ? value * 100 : value;
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Normalizes confidence scores to integer percentages (0-100%).
 */
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(normalizePercentage(confidence))}%`;
};