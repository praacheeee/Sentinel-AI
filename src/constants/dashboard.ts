import {
  AlertTriangle,
  ShieldAlert,
  BrainCircuit,
  ClipboardCheck,
  FilePlus2,
  Brain,
  ClipboardPlus,
  FileSearch,
} from "lucide-react";
import type { StatGridMetricItem } from "@/components/common/StatGrid";
import type { QuickActionItem } from "@/components/common/QuickActions";

export const INITIAL_DASHBOARD_METRICS: StatGridMetricItem[] = [
  {
    id: "active-incidents",
    title: "Active Incidents",
    value: 127,
    trend: "up",
    trendValue: "+8.4%",
    status: "critical",
    icon: AlertTriangle,
    subtitle: "Detected today",
  },
  {
    id: "critical-assets",
    title: "Critical Assets",
    value: 38,
    trend: "down",
    trendValue: "-2.1%",
    status: "warning",
    icon: ShieldAlert,
    subtitle: "Require inspection",
  },
  {
    id: "ai-confidence",
    title: "AI Confidence",
    value: 98.7,
    unit: "%",
    trend: "up",
    trendValue: "+0.6%",
    status: "healthy",
    icon: BrainCircuit,
    subtitle: "Detection accuracy",
  },
  {
    id: "open-work-orders",
    title: "Open Work Orders",
    value: 54,
    trend: "neutral",
    trendValue: "0%",
    status: "healthy",
    icon: ClipboardCheck,
    subtitle: "Awaiting completion",
  },
];

export const getDashboardQuickActions = (
  navigate: (path: string) => void
): QuickActionItem[] => [
  {
    id: "report-incident",
    title: "Report Incident",
    description: "Create a new infrastructure incident report.",
    badge: "NEW",
    icon: FilePlus2,
    onClick: () => navigate("/incidents/new"),
  },
  {
    id: "run-ai-scan",
    title: "Run AI Scan",
    description: "Analyze uploaded infrastructure images.",
    icon: Brain,
    onClick: () => navigate("/ai-inspection"),
  },
  {
    id: "generate-work-order",
    title: "Generate Work Order",
    description: "Create an AI-generated maintenance work order.",
    icon: ClipboardPlus,
    onClick: () => navigate("/incidents"),
  },
  {
    id: "view-reports",
    title: "View Reports",
    description: "Browse previous intelligence reports.",
    icon: FileSearch,
    onClick: () => navigate("/incident-report"),
  },
];