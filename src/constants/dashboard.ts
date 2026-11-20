import { Brain, FileSearch, BarChart3, Download } from "lucide-react";
import type { QuickActionItem } from "@/types/dashboard";
import { getInspectionHistory } from "@/utils/inspectionHistory";

export const getDashboardQuickActions = (
  navigate: (path: string) => void
): QuickActionItem[] => [
  {
    id: "run-ai-scan",
    title: "Launch Vision Studio",
    description: "Scan roadway imagery for surface potholes in real time.",
    icon: Brain,
    badge: "Live",
    onClick: () => navigate("/ai-inspection"),
  },
  {
    id: "view-reports",
    title: "Inspection Dossiers",
    description: "Browse historical AI triage logs and confidence scores.",
    icon: FileSearch,
    onClick: () => navigate("/incident-report"),
  },
  {
    id: "city-insights",
    title: "Municipal Telemetry",
    description: "Explore city-wide pothole density and corridor watchlists.",
    icon: BarChart3,
    onClick: () => navigate("/insights"),
  },
  {
    id: "export-data",
    title: "Export Audit Telemetry",
    description: "Download local inspection history as a JSON report.",
    icon: Download,
    onClick: () => {
      const history = getInspectionHistory();
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(history, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sentinel_ai_inspection_audit_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },
  },
];
