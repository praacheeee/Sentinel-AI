import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "@/components/common/DashboardHeader";
import StatGrid from "@/components/common/StatGrid";
import QuickActions from "@/components/common/QuickActions";
import RecentIncidentTable from "@/components/incident/dashboard/RecentIncidentTable";
import {
  INITIAL_DASHBOARD_METRICS,
  getDashboardQuickActions,
} from "@/constants/dashboard";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const quickActions = getDashboardQuickActions(navigate);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("2 min ago");

  const mockIncidents = [
    {
      id: "INC-001",
      location: "MG Road Junction",
      category: "Pothole",
      severity: "High",
      status: "Open",
      confidence: 98,
      detectedAt: "10 min ago",
    },
    {
      id: "INC-002",
      location: "Central Bridge",
      category: "Crack Detection",
      severity: "Critical",
      status: "Investigating",
      confidence: 99,
      detectedAt: "18 min ago",
    },
    {
      id: "INC-003",
      location: "Sector 9",
      category: "Water Leakage",
      severity: "Medium",
      status: "In Progress",
      confidence: 95,
      detectedAt: "32 min ago",
    },
    {
      id: "INC-004",
      location: "City Hospital Road",
      category: "Streetlight Failure",
      severity: "Low",
      status: "Resolved",
      confidence: 91,
      detectedAt: "1 hour ago",
    },
    {
      id: "INC-005",
      location: "Metro Station",
      category: "Road Damage",
      severity: "High",
      status: "Open",
      confidence: 97,
      detectedAt: "2 hours ago",
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate real-time API telemetry fetch
    setTimeout(() => {
      setLastSyncTime("Just now");
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full max-w-[1600px] mx-auto"
    >
      {/* Dashboard Top Header */}
      <DashboardHeader
        title="Dashboard"
        subtitle="Real-time AI-powered infrastructure intelligence for municipal operations."
        status="Operational"
        lastUpdated={lastSyncTime}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Primary Telemetry Stat Grid */}
      <StatGrid metrics={INITIAL_DASHBOARD_METRICS} />

      {/* Quick Actions Panel */}
      <QuickActions actions={quickActions} />

      {/* Recent Incidents Table */}
      <RecentIncidentTable
        incidents={mockIncidents}
        onView={(incident) => {
          console.log("Viewing incident:", incident);
        }}
      />
    </motion.div>
  );
};

export default Dashboard;