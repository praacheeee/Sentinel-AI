export const ROUTES = {
  DASHBOARD: "/",
  NEW_INCIDENT: "/incidents/new",
  INCIDENTS: "/incidents",
  CITY_INSIGHTS: "/insights",
  INCIDENT_REPORT: "/incident-report",
  AI_INSPECTION: "/ai-inspection",
  SETTINGS: "/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];