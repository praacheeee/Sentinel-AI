import React, { useState, useEffect, useMemo } from "react";
import { saveInspection } from "@/utils/inspectionHistory";
import {
  optimizeImageForInference,
  type ImageOptimizationMeta,
} from "@/utils/imageOptimizer";
import {
  Upload,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Brain,
  Wrench,
  Activity,
  Layers,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import {
  SEVERITY_BADGE_STYLES,
  type IncidentSeverity,
} from "@/constants/incident";

export interface DamageAnalyzerProps {
  imageFile: File | null;
}

export interface DetectionItem {
  id: string;
  damageType: string;
  rawClass: string;
  confidence: number;
  boundingBox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  normalizedBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const AI_STAGES = [
  "Initializing YOLOv8 Inference Pipeline...",
  "Analyzing Pavement Surface & Textures...",
  "Applying Non-Maximum Suppression (NMS)...",
  "Evaluating Connected Bounding Box Clusters...",
  "Computing Provisional Severity Triage...",
];

const COLOR_MAP: Record<string, string> = {
  Pothole: "#EF4444", // Crimson / Red
};

const getDefectColor = (damageType: string): string => {
  return COLOR_MAP[damageType] || "#10B981";
};

const getRecommendation = (
  damageType: string,
  severity: IncidentSeverity,
  count: number
): string => {
  if (
    damageType === "No potholes detected" ||
    damageType === "Road Surface Clear" ||
    count === 0
  ) {
    return "No surface potholes detected above the operational confidence threshold (10%). Note: Visual inspection does not establish that the roadway is damage-free; other distress types (such as cracking, rutting, or sub-base degradation) are outside this single-class model's scope.";
  }

  if (damageType === "Pothole") {
    if (severity === "Critical") {
      return `Critical roadway hazard: Prominent high-confidence pothole formation detected. Immediate asphalt patching and hazard mitigation recommended to prevent structural roadway degradation and vehicular damage.`;
    }
    if (severity === "High") {
      return `High-priority roadway hazard: Pothole detected. Schedule asphalt patching to prevent moisture ingress and further pavement deterioration.`;
    }
    return "Localized pothole formation detected. Schedule cold-patch or mill-and-fill restoration during routine roadway maintenance triage.";
  }

  return `Schedule prompt maintenance for identified ${damageType.toLowerCase()} to restore roadway serviceability.`;
};

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export const DamageAnalyzer: React.FC<DamageAnalyzerProps> = ({
  imageFile,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [optMeta, setOptMeta] = useState<ImageOptimizationMeta | null>(null);

  // Real backend detections
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<{
    damageType: string;
    severity: IncidentSeverity;
    confidence: number;
    recommendation: string;
    defectCounts: Record<string, number>;
    totalCount: number;
  } | null>(null);

  // Create preview URL for the uploaded image file
  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset state on new file upload
  useEffect(() => {
    setIsScanning(false);
    setProgress(0);
    setStageIndex(0);
    setAnalysisResult(null);
    setDetections([]);
    setError(null);
    setOptMeta(null);
  }, [imageFile]);

  const handleStartAnalysis = async () => {
    if (!imageFile || isScanning) return;

    setIsScanning(true);
    setProgress(0);
    setStageIndex(0);
    setAnalysisResult(null);
    setDetections([]);
    setError(null);

    // Visual progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const next = prev + 5;
        setStageIndex(
          Math.min(
            Math.floor((next / 100) * AI_STAGES.length),
            AI_STAGES.length - 1
          )
        );
        return next;
      });
    }, 100);

    try {
      // 1. Optimize image client-side to prevent cloud container memory swapping
      const { file: uploadFile, meta: optimizationMeta } =
        await optimizeImageForInference(imageFile, 1280, 0.85);
      setOptMeta(optimizationMeta);

      const formData = new FormData();
      formData.append("file", uploadFile);

      // Invoke real YOLO backend endpoint
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);

      if (!response.ok) {
        throw new Error(
          `Backend returned error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      setProgress(100);
      setStageIndex(AI_STAGES.length - 1);

      const returnedDetections: DetectionItem[] = data.detections || [];
      setDetections(returnedDetections);

      if (returnedDetections.length === 0) {
        const clearType = "No potholes detected";
        const clearSeverity: IncidentSeverity = "Low";
        const clearConfidence = 0.0;
        const rec = getRecommendation(clearType, clearSeverity, 0);

        setAnalysisResult({
          damageType: clearType,
          severity: clearSeverity,
          confidence: clearConfidence,
          recommendation: rec,
          defectCounts: {},
          totalCount: 0,
        });

        saveInspection({
          category: clearType,
          severity: clearSeverity,
          confidence: clearConfidence,
        });
      } else {
        const summary = data.summary || {};
        const primaryDefect: string = summary.primaryDefect || returnedDetections[0].damageType;
        const highestConfidence: number = Number(summary.maxConfidence ?? returnedDetections[0].confidence);
        const dynamicSeverity: IncidentSeverity = (summary.severity as IncidentSeverity) || "Medium";
        const defectCounts: Record<string, number> = summary.damageCounts || {};

        const rec = getRecommendation(
          primaryDefect,
          dynamicSeverity,
          returnedDetections.length
        );

        setAnalysisResult({
          damageType: primaryDefect,
          severity: dynamicSeverity,
          confidence: highestConfidence,
          recommendation: rec,
          defectCounts,
          totalCount: returnedDetections.length,
        });

        saveInspection({
          category: primaryDefect,
          severity: dynamicSeverity,
          confidence: highestConfidence,
        });
      }

      setIsScanning(false);
    } catch (err) {
      clearInterval(progressTimer);
      console.error("Prediction error:", err);
      setIsScanning(false);
      setProgress(0);
      setError(
        err instanceof Error
          ? `${err.message}. Ensure the FastAPI backend is online at ${API_BASE}.`
          : "Unable to connect to the AI backend."
      );
    }
  };

  if (!imageFile) {
    return (
      <div className="w-full p-8 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 flex flex-col items-center justify-center gap-3 text-center shadow-xs">
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <Upload className="w-6 h-6" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Upload or select a roadway image above to begin AI pothole analysis.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-6 rounded-2xl bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Brain className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              YOLOv8 Pothole Diagnostics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Single-class localized roadway defect analysis
            </p>
          </div>
        </div>

        {analysisResult && (
          <div className="flex items-center gap-2">
            {detections.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBoundingBoxes((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Toggle visual bounding boxes"
              >
                {showBoundingBoxes ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Hide Boxes</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Show Boxes</span>
                  </>
                )}
              </button>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
              Analysis Complete
            </span>
          </div>
        )}
      </div>

      {/* Start Analysis Call-to-Action */}
      {!isScanning && !analysisResult && !error && (
        <div className="flex flex-col items-center justify-center py-6 gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Image ready for high-resolution neural inspection. Click below to execute inference.
          </p>

          <button
            type="button"
            onClick={handleStartAnalysis}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md hover:shadow-emerald-500/25 cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            Execute Pothole Inference
          </button>
        </div>
      )}

      {/* Scanning Progress & Laser Sweep */}
      {isScanning && (
        <div className="flex flex-col gap-5 py-6 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2
              className="w-8 h-8 text-emerald-500 animate-spin"
              aria-hidden="true"
            />
            <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 tracking-wide">
              {AI_STAGES[stageIndex]}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Neural Pipeline Telemetry</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
          <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          <button
            onClick={handleStartAnalysis}
            className="mt-3 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Retry Inference
          </button>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Visual Detection Overlay with Bounding Boxes */}
          {previewUrl && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span className="font-mono flex items-center gap-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  Visual AI Overlay ({detections.length} candidate box{detections.length === 1 ? "" : "es"})
                </span>
                {detections.length > 0 && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Hover box to inspect coordinates
                  </span>
                )}
              </div>

              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center select-none shadow-inner">
                <img
                  src={previewUrl}
                  alt="Inspection target"
                  className="w-full max-h-[500px] object-contain block"
                />

                {/* Overlaid bounding boxes */}
                {showBoundingBoxes &&
                  detections.map((det, idx) => {
                    const color = getDefectColor(det.damageType);
                    return (
                      <div
                        key={det.id}
                        className="absolute border-2 pointer-events-auto transition-all duration-150 hover:border-white hover:z-20 group"
                        style={{
                          left: `${det.normalizedBox.x}%`,
                          top: `${det.normalizedBox.y}%`,
                          width: `${det.normalizedBox.width}%`,
                          height: `${det.normalizedBox.height}%`,
                          borderColor: color,
                          backgroundColor: `${color}25`,
                        }}
                      >
                        <span
                          className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white shadow-md whitespace-nowrap pointer-events-none group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                        >
                          #{idx + 1} {det.damageType} {det.confidence}%
                        </span>
                      </div>
                    );
                  })}
              </div>

              {optMeta && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Client Optimization:</span>
                    <span>{optMeta.originalSizeFormatted} ({optMeta.originalWidth}×{optMeta.originalHeight})</span>
                    <span>&rarr;</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{optMeta.optimizedSizeFormatted} ({optMeta.optimizedWidth}×{optMeta.optimizedHeight})</span>
                    {optMeta.wasResized && (
                      <span className="text-slate-400">({optMeta.compressionRatioPct > 0 ? `-${optMeta.compressionRatioPct}%` : '0%'} payload)</span>
                    )}
                  </span>
                  <span className="text-slate-400">prep: {optMeta.durationMs}ms</span>
                </div>
              )}
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Damage Type */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <AlertTriangle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Detection Status
                </span>
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {analysisResult.damageType}
              </span>
            </div>

            {/* Severity */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Provisional Severity
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
                    SEVERITY_BADGE_STYLES[analysisResult.severity]
                  }`}
                >
                  {analysisResult.severity}
                </span>
              </div>
            </div>

            {/* Confidence */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Peak AI Confidence
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
                  {analysisResult.confidence.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Raw</span>
              </div>
            </div>

            {/* Total Detected */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Candidate Boxes
                </span>
              </div>
              <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
                {analysisResult.totalCount}
              </span>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                Provisional Maintenance Triage Recommendation
              </span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {analysisResult.recommendation}
            </p>
          </div>

          {/* Itemized Defect Table if multiple detections exist */}
          {detections.length > 1 && (
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Itemized Candidate Detections ({detections.length})
              </span>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {detections.map((det, idx) => (
                  <div
                    key={det.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getDefectColor(det.damageType) }}
                      />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        #{idx + 1} {det.damageType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] hidden sm:inline">
                        coords: [{det.boundingBox.x1}, {det.boundingBox.y1}, {det.boundingBox.x2}, {det.boundingBox.y2}]
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        {det.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(DamageAnalyzer);
