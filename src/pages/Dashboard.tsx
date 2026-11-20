import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  AlertTriangle,
  Brain,
  ShieldAlert,
} from "lucide-react";

import DashboardHeader from "@/components/common/DashboardHeader";
import StatGrid from "@/components/common/StatGrid";
import QuickActions from "@/components/common/QuickActions";
import RecentIncidentTable from "@/components/incident/dashboard/RecentIncidentTable";

import { getDashboardQuickActions } from "@/constants/dashboard";

import {
  getInspectionHistory,
  type InspectionRecord,
} from "@/utils/inspectionHistory";

import type { StatItem } from "@/types/dashboard";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const quickActions = getDashboardQuickActions(navigate);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  const [inspectionHistory, setInspectionHistory] = useState<
    InspectionRecord[]
  >([]);

  // Load inspection history
  useEffect(() => {
    const loadHistory = () => {
      setInspectionHistory(getInspectionHistory());
    };

    loadHistory();

    window.addEventListener(
      "inspection-history-updated",
      loadHistory
    );

    return () => {
      window.removeEventListener(
        "inspection-history-updated",
        loadHistory
      );
    };
  }, []);

  // Refresh dashboard
  const handleRefresh = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setInspectionHistory(getInspectionHistory());
      setLastSyncTime("Just now");
      setIsRefreshing(false);
    }, 600);
  };

  // Calculate real dashboard metrics
  const totalInspections = inspectionHistory.length;

  const averageConfidence =
    totalInspections > 0
      ? inspectionHistory.reduce(
          (sum, inspection) => sum + inspection.confidence,
          0
        ) / totalInspections
      : 0;

  const highPriorityCount = inspectionHistory.filter(
    (inspection) =>
      inspection.severity === "High" ||
      inspection.severity === "Critical"
  ).length;

  const dashboardMetrics: StatItem[] = [
    {
      id: "total-inspections",
      title: "Total Inspections",
      value: totalInspections,
      subtitle: "Lifetime telemetry logs",
      trend: "neutral",
      trendValue: "Live",
      icon: ClipboardCheck,
    },
    {
      id: "detected-issues",
      title: "Pothole Defect Logs",
      value: totalInspections,
      subtitle: "Scanned pavement areas",
      trend: "neutral",
      trendValue: "Live",
      icon: AlertTriangle,
    },
    {
      id: "ai-confidence",
      title: "Avg. AI Confidence",
      value: `${averageConfidence.toFixed(1)}%`,
      subtitle: "Raw detection certainty",
      trend: "up",
      trendValue: "YOLOv8",
      icon: Brain,
    },
    {
      id: "high-priority",
      title: "High Priority Triage",
      value: highPriorityCount,
      subtitle: "Immediate patch queue",
      trend: highPriorityCount > 0 ? "down" : "neutral",
      trendValue: highPriorityCount > 0 ? "Action Req." : "Nominal",
      icon: ShieldAlert,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full max-w-6xl mx-auto pb-12"
    >
      <DashboardHeader
        title="Municipal Pothole Operations Hub"
        subtitle="Real-time neural road-damage monitoring, autonomous telemetry triage, and infrastructure dispatch intelligence."
        status="Operational"
        lastUpdated={lastSyncTime}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Real-time inspection metrics */}
      <StatGrid metrics={dashboardMetrics} />

      {/* Quick Action Portals */}
      <QuickActions
        title="Operational Quick Actions"
        subtitle="Direct shortcuts to inference studio, intelligence dossiers, and telemetry exports."
        actions={quickActions}
      />

      {/* Real inspection history */}
      <RecentIncidentTable incidents={inspectionHistory} />
    </motion.div>
  );
};

export default Dashboard;
