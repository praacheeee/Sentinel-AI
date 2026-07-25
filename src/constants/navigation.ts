import {
  LayoutDashboard,
  PlusCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Brain,
  type LucideIcon,
} from "lucide-react";

import { ROUTES, type RoutePath } from "./routes";

export interface NavItemConfig {
  id: string;
  label: string;
  path: RoutePath;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    id: "new-incident",
    label: "New Incident",
    path: ROUTES.NEW_INCIDENT,
    icon: PlusCircle,
  },
  {
    id: "ai-inspection",
    label: "AI Inspection",
    path: ROUTES.AI_INSPECTION,
    icon: Brain,
  },
  {
    id: "incidents",
    label: "Incidents",
    path: ROUTES.INCIDENTS,
    icon: AlertTriangle,
  },
  {
    id: "insights",
    label: "City Insights",
    path: ROUTES.CITY_INSIGHTS,
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    path: ROUTES.SETTINGS,
    icon: Settings,
  },
];