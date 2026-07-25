import type { LucideIcon } from "lucide-react";
import type { IncidentSeverity } from "@/constants/incident";

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
}

export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  color?: string;
}

export interface MetricGroup {
  id: string;
  title: string;
  metrics: MetricItem[];
}

export interface ComputerVisionBoundingBox {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComputerVisionData {
  imageUrl: string;
  detectedDefect: string;
  confidence: number;
  severity: IncidentSeverity;
  boundingBoxes: ComputerVisionBoundingBox[];
}

export interface ExecutiveAssessmentItem {
  id: string;
  label: string;
  value: string;
}

export interface DashboardIncident {
  id: string;
  incidentId: string;
  title: string;
  location: string;
  category: string;
  severity: IncidentSeverity;
  status: string;
  createdAt: string;
}

export interface DashboardActionItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}