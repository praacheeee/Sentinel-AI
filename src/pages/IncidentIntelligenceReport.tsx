import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Activity,
  Wrench,
  Clock,
  ClipboardCheck,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "@/components/common/DashboardHeader";
import {
  getInspectionHistory,
  type InspectionRecord,
} from "@/utils/inspectionHistory";

const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const getRecommendation = (
  damageType: string,
  severity: InspectionRecord["severity"]
) => {
  if (damageType === "No potholes detected") {
    return "Pavement surface verified clear of surface cavities. Continue scheduled routine monitoring.";
  }
  if (severity === "High" || severity === "Critical") {
    return `Immediate asphalt patching and hazard mitigation required to prevent vehicle rim damage and rapid pavement degradation.`;
  }
  if (severity === "Medium") {
    return `Schedule localized asphalt pothole restoration during routine municipal road maintenance cycle.`;
  }
  return `Surface condition nominal. Monitor localized asphalt wear during quarterly infrastructure surveys.`;
};

const severityStyles: Record<InspectionRecord["severity"], string> = {
  Critical: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
  High: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  Medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Low: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export function IncidentIntelligenceReport() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<InspectionRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<InspectionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  useEffect(() => {
    const loadReports = () => {
      setReports(getInspectionHistory());
    };

    loadReports();

    window.addEventListener("inspection-history-updated", loadReports);
    return () => {
      window.removeEventListener("inspection-history-updated", loadReports);
    };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity =
        severityFilter === "ALL" || r.severity.toUpperCase() === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [reports, searchQuery, severityFilter]);

  const criticalCount = useMemo(
    () => reports.filter((r) => r.severity === "Critical" || r.severity === "High").length,
    [reports]
  );

  const avgConfidence = useMemo(() => {
    if (!reports.length) return 0;
    return (
      reports.reduce((acc, r) => acc + r.confidence, 0) / reports.length
    ).toFixed(1);
  }, [reports]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full max-w-6xl mx-auto pb-12"
    >
      {/* Header */}
      <DashboardHeader
        title="Inspection Telemetry Dossier"
        subtitle="Permanent historical registry of AI-analyzed roadway scans, confidence logs, and maintenance triage recommendations."
        icon={FileText}
      />

      {/* Top Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
            Total Logged Scans
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {reports.length}
          </span>
          <span className="text-[11px] text-slate-400">Across all municipal sectors</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
            High Priority Triage
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {criticalCount}
          </span>
          <span className="text-[11px] text-slate-400">Requires prompt asphalt patching</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
            Average AI Confidence
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {avgConfidence}%
          </span>
          <span className="text-[11px] text-slate-400">Raw YOLOv8 detection certainty</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by defect or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-center overflow-x-auto w-full sm:w-auto">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSeverityFilter(level)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                severityFilter === level
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {reports.length === 0 ? "No Inspection Telemetry Logged Yet" : "No Reports Match Current Filters"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {reports.length === 0
              ? "Upload a roadway image in AI Inspection to generate your first live pothole triage dossier."
              : "Try clearing your search query or selecting 'ALL' in the severity filter."}
          </p>
          {reports.length === 0 && (
            <button
              type="button"
              onClick={() => navigate("/ai-inspection")}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Launch AI Inspection Studio
            </button>
          )}
        </div>
      )}

      {/* Reports Grid */}
      {filteredReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:border-emerald-500/40 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    ID: {report.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {report.category}
                  </h3>
                </div>

                <span
                  className={`px-3 py-0.5 rounded-full border text-xs font-bold font-mono ${
                    severityStyles[report.severity]
                  }`}
                >
                  {report.severity}
                </span>
              </div>

              {/* Telemetry info row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Peak Confidence</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-1 block">
                    {report.confidence.toFixed(1)}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Logged</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs mt-1.5 block">
                    {getTimeAgo(report.timestamp)}
                  </span>
                </div>
              </div>

              {/* Recommendation Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold mb-1">
                  <Wrench className="w-3 h-3" />
                  <span className="uppercase text-[10px] tracking-wider font-mono">Triage Directive</span>
                </div>
                <p className="line-clamp-2">{getRecommendation(report.category, report.severity)}</p>
              </div>

              {/* View Full Dossier Button */}
              <button
                type="button"
                onClick={() => setSelectedReport(report)}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Inspect Telemetry Dossier →
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full Telemetry Modal Dialog */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-slate-400">
                    Record ID: {selectedReport.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Inspection Telemetry Dossier
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Defect Classification
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                      {selectedReport.category}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Provisional Severity
                    </span>
                    <span
                      className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full border text-xs font-bold font-mono ${
                        severityStyles[selectedReport.severity]
                      }`}
                    >
                      {selectedReport.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Raw YOLOv8 Confidence
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {selectedReport.confidence.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Timestamp
                    </span>
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-1.5 block">
                      {getTimeAgo(selectedReport.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400 block">
                    Maintenance Triage Directive
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium mt-1.5">
                    {getRecommendation(selectedReport.category, selectedReport.severity)}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default IncidentIntelligenceReport;
