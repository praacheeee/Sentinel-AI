import {
  PlusCircle,
  FileText,
  RefreshCw,
  Download,
  Users,
  AlertTriangle,
  Wrench,
  Brain,
  Clock,
} from "lucide-react";

import type {
  QuickActionItem,
  StatItem,
  MetricGroup,
  ComputerVisionData,
  ExecutiveAssessmentItem,
  DashboardIncident,
  DashboardActionItem,
} from "@/types/dashboard";

export const quickActions: QuickActionItem[] = [
  {
    id: "action-create-work-order",
    title: "Create Work Order",
    description: "Generate a maintenance work order for the selected incident.",
    icon: PlusCircle,
  },
  {
    id: "action-generate-report",
    title: "Generate Report",
    description: "Create a detailed AI-powered incident report.",
    icon: FileText,
  },
  {
    id: "action-refresh",
    title: "Refresh Dashboard",
    description: "Reload the latest incident data and analytics.",
    icon: RefreshCw,
  },
];

export const dashboardStats: StatItem[] = [
  {
    id: "stat-total",
    title: "Total Incidents",
    value: "142",
    change: "+12%",
    trend: "up",
    icon: AlertTriangle,
  },
  {
    id: "stat-active-repairs",
    title: "Active Repairs",
    value: "18",
    change: "-4%",
    trend: "down",
    icon: Wrench,
  },
  {
    id: "stat-ai-accuracy",
    title: "AI Accuracy",
    value: "96.4%",
    change: "+1.2%",
    trend: "up",
    icon: Brain,
  },
  {
    id: "stat-avg-resolution",
    title: "Avg Resolution Time",
    value: "3.4h",
    change: "-18m",
    trend: "down",
    icon: Clock,
  },
];

export const metricGroups: MetricGroup[] = [
  {
    id: "group-severity",
    title: "Incidents by Severity",
    metrics: [
      { id: "m-sev-critical", label: "Critical", value: "3", color: "#DA3633" },
      { id: "m-sev-high", label: "High", value: "12", color: "#DB6D28" },
      { id: "m-sev-medium", label: "Medium", value: "45", color: "#D29922" },
      { id: "m-sev-low", label: "Low", value: "82", color: "#238636" },
    ],
  },
  {
    id: "group-category",
    title: "Incidents by Category",
    metrics: [
      { id: "m-cat-road", label: "Roadway Hazard", value: "54", color: "#58A6FF" },
      { id: "m-cat-bridge", label: "Bridge Inspection", value: "28", color: "#A371F7" },
      { id: "m-cat-drainage", label: "Drainage / Pipe", value: "38", color: "#39D353" },
      { id: "m-cat-electrical", label: "Electrical / Signal", value: "22", color: "#F2CC60" },
    ],
  },
  {
    id: "group-status",
    title: "Incident Lifecycle Status",
    metrics: [
      { id: "m-stat-open", label: "Open / Unassigned", value: "14", color: "#F85149" },
      { id: "m-stat-in-progress", label: "In Progress", value: "18", color: "#58A6FF" },
      { id: "m-stat-pending", label: "Verification Pending", value: "8", color: "#D29922" },
      { id: "m-stat-resolved", label: "Resolved Today", value: "24", color: "#238636" },
    ],
  },
];

export const computerVisionData: ComputerVisionData = {
  imageUrl:
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80",
  detectedDefect: "Severe Asphalt Pothole with Subsurface Degradation",
  confidence: 94.8,
  severity: "Critical",
  boundingBoxes: [
    { id: "box-1", label: "Primary Fault", x: 25, y: 35, width: 45, height: 40 },
    { id: "box-2", label: "Radial Fissure", x: 72, y: 50, width: 18, height: 25 },
  ],
};

export const executiveSummaryText =
  "Automated visual survey detected a critical asphalt defect on Expressway A4 (KM 14.2) presenting immediate structural risks to high-speed traffic. AI models recommend emergency traffic diversion and dispatch of rapid asphalt repair crews within 2 hours to prevent severe structural expansion and vehicle incidents.";

export const assessmentItems: ExecutiveAssessmentItem[] = [
  { id: "item-1", label: "Estimated Repair Cost", value: "$12,400" },
  { id: "item-2", label: "Disruption Level", value: "High (Peak Hours)" },
  { id: "item-3", label: "Recommended Crew", value: "Rapid Asphalt Response Team 4" },
  { id: "item-4", label: "Target Completion Time", value: "4.5 Hours" },
];

export const recentIncidents: DashboardIncident[] = [
  {
    id: "inc-1",
    incidentId: "INC-2026-8801",
    title: "Expressway A4 Pothole Defect",
    location: "Expressway A4, KM 14.2",
    category: "Roadway Hazard",
    severity: "Critical",
    status: "Open",
    createdAt: "10 mins ago",
  },
  {
    id: "inc-2",
    incidentId: "INC-2026-8798",
    title: "Overhead Signal Cable Slack",
    location: "5th Ave & 32nd St Intersection",
    category: "Electrical / Signal",
    severity: "High",
    status: "In Progress",
    createdAt: "42 mins ago",
  },
  {
    id: "inc-3",
    incidentId: "INC-2026-8794",
    title: "Culvert Debris Blockage",
    location: "North Drain Sector 7",
    category: "Drainage",
    severity: "Medium",
    status: "In Progress",
    createdAt: "1 hour ago",
  },
  {
    id: "inc-4",
    incidentId: "INC-2026-8789",
    title: "Expansion Joint Wear",
    location: "Harbor Skyway Bridge #2",
    category: "Bridge Structure",
    severity: "High",
    status: "Pending Review",
    createdAt: "3 hours ago",
  },
  {
    id: "inc-5",
    incidentId: "INC-2026-8780",
    title: "Graffiti & Sign Obstruction",
    location: "Route 101 Mile 44",
    category: "Signage",
    severity: "Low",
    status: "Resolved",
    createdAt: "5 hours ago",
  },
];

export const dashboardActions: DashboardActionItem[] = [
  {
    id: "action-assign",
    label: "Assign Team",
    icon: Users,
    variant: "primary",
  },
  {
    id: "action-report",
    label: "Generate Report",
    icon: FileText,
    variant: "secondary",
  },
  {
    id: "action-export",
    label: "Export Data",
    icon: Download,
    variant: "secondary",
  },
];