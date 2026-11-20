import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import DashboardHeader from "@/components/common/DashboardHeader";

const SECTOR_DATA = [
  { sector: "Ward 1 - North", potholes: 24, repaired: 18 },
  { sector: "Ward 2 - Central", potholes: 38, repaired: 29 },
  { sector: "Ward 3 - East Ring", potholes: 42, repaired: 25 },
  { sector: "Ward 4 - Metro Blvd", potholes: 19, repaired: 16 },
  { sector: "Ward 5 - Industrial", potholes: 51, repaired: 32 },
  { sector: "Ward 6 - South Gate", potholes: 15, repaired: 14 },
];

const SEVERITY_DISTRIBUTION = [
  { name: "Low", value: 45, color: "#10B981" },
  { name: "Medium", value: 30, color: "#FBBF24" },
  { name: "High", value: 18, color: "#F59E0B" },
  { name: "Critical", value: 7, color: "#EF4444" },
];

const TREND_DATA = [
  { day: "Mon", detected: 12, patched: 8 },
  { day: "Tue", detected: 19, patched: 14 },
  { day: "Wed", detected: 15, patched: 16 },
  { day: "Thu", detected: 22, patched: 18 },
  { day: "Fri", detected: 28, patched: 22 },
  { day: "Sat", detected: 14, patched: 19 },
  { day: "Sun", detected: 9, patched: 12 },
];

const CORRIDOR_WATCHLIST = [
  {
    name: "Industrial Highway Expressway (Km 14–22)",
    sector: "Ward 5",
    potholes: 12,
    severity: "Critical",
    status: "Repair Crew Dispatched",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  {
    name: "Metro Central Boulevard",
    sector: "Ward 2",
    potholes: 7,
    severity: "High",
    status: "Scheduled for Night Patching",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    name: "North Ring Bypass Flyover",
    sector: "Ward 3",
    potholes: 5,
    severity: "Medium",
    status: "Routine Maintenance Queue",
    badgeClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  },
  {
    name: "Airport Connector Avenue",
    sector: "Ward 1",
    potholes: 1,
    severity: "Low",
    status: "Continuous Monitoring",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
];

export const CityInsights: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full max-w-6xl mx-auto pb-12"
    >
      {/* Header */}
      <DashboardHeader
        title="Municipal Roadway Intelligence"
        subtitle="City-wide telemetry analytics, pothole geographic distribution, and repair velocity metrics across municipal sectors."
        icon={BarChart3}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-mono uppercase font-semibold">Network Health Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">88.4%</span>
            <span className="text-xs font-semibold text-emerald-500 font-mono">+1.8%</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Overall pavement serviceability</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-mono uppercase font-semibold">Active Defect Clusters</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">25</span>
            <span className="text-xs font-semibold text-rose-500 font-mono">14 Critical</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Pothole hotspots requiring triage</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-mono uppercase font-semibold">Mean Patching Turnaround</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">21.5h</span>
            <span className="text-xs font-semibold text-emerald-500 font-mono">-4.2h</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Detection-to-remediation time</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-mono uppercase font-semibold">Surveyed Pavement</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">184 km</span>
            <span className="text-xs font-semibold text-emerald-500 font-mono">100%</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous video survey coverage</span>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pothole Density by Ward Bar Chart */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col gap-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pothole Density by Sector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active detections vs. completed asphalt patches
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SECTOR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B101D",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="potholes" name="Detected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repaired" name="Patched" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut Chart */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Severity Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Breakdown of active potholes
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SEVERITY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SEVERITY_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B101D",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono">
            {SEVERITY_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.name}:</span>
                <span className="text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Detection vs Patch Velocity Area Chart */}
      <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            7-Day Detection & Remediation Velocity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily telemetry volume across municipal road survey fleet
          </p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="patchedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0B101D",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="detected" name="Detected" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#detectedGrad)" />
              <Area type="monotone" dataKey="patched" name="Repaired" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#patchedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Corridor Watchlist Table */}
      <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            High-Priority Roadway Corridors
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time municipal dispatch status for prominent roadway pothole clusters
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Corridor</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Potholes</th>
                <th className="px-4 py-3">Triage Level</th>
                <th className="px-4 py-3">Dispatch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {CORRIDOR_WATCHLIST.map((corridor) => (
                <tr key={corridor.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {corridor.name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    {corridor.sector}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                    {corridor.potholes}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${corridor.badgeClass}`}>
                      {corridor.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {corridor.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default CityInsights;
