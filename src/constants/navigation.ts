import {
  LayoutDashboard,
  Brain,
  FileText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

import { ROUTES, type RoutePath } from "./routes";

export interface NavItemConfig {
  id: string;
  label: string;
  path: RoutePath;
  icon: LucideIcon;
  badge?: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    id: "ai-inspection",
    label: "AI Inspection",
    path: ROUTES.AI_INSPECTION,
    icon: Brain,
    badge: "YOLOv8",
  },
  {
    id: "incident-report",
    label: "Inspection Reports",
    path: ROUTES.INCIDENT_REPORT,
    icon: FileText,
  },
  {
    id: "city-insights",
    label: "City Insights",
    path: ROUTES.CITY_INSIGHTS,
    icon: BarChart3,
  },
];
