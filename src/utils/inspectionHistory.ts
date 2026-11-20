export interface InspectionRecord {
  id: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  detectedAt: string;
  timestamp: number;
}

const STORAGE_KEY = "sentinel-inspection-history";

export const getInspectionHistory = (): InspectionRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveInspection = (
  inspection: Omit<InspectionRecord, "id" | "timestamp" | "detectedAt">
) => {
  const now = Date.now();

  const newInspection: InspectionRecord = {
    ...inspection,
    id: `INS-${now}`,
    timestamp: now,
    detectedAt: "Just now",
  };

  const history = getInspectionHistory();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newInspection, ...history].slice(0, 50))
  );

  window.dispatchEvent(new Event("inspection-history-updated"));
};