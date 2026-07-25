import React, { useState, useEffect } from "react";
import {
  Upload,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Brain,
  Wrench,
  Activity,
} from "lucide-react";
import { SEVERITY_BADGE_STYLES, type IncidentSeverity } from "@/constants/incident";

export interface DamageAnalyzerProps {
  imageFile: File | null;
}

const AI_STAGES = [
  "Initializing AI Engine...",
  "Detecting Utility Infrastructure...",
  "Identifying Damage Patterns...",
  "Assessing Severity...",
  "Generating Final Report...",
];

const DAMAGE_TYPES = [
  "Pothole",
  "Longitudinal Crack",
  "Transverse Crack",
  "Alligator Crack",
];

const SEVERITIES: IncidentSeverity[] = ["Low", "Medium", "High"];

const RECOMMENDATIONS = {
  "Pothole":
    "Immediate pothole repair is recommended to prevent vehicle damage and improve road safety.",

  "Longitudinal Crack":
    "Seal the crack promptly to prevent water infiltration and further pavement deterioration.",

  "Transverse Crack":
    "Inspect and seal the transverse crack to maintain pavement integrity.",

  "Alligator Crack":
    "High-priority pavement rehabilitation is recommended due to structural deterioration.",
};

export const DamageAnalyzer: React.FC<DamageAnalyzerProps> = ({ imageFile }) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<{
    damageType: string;
    severity: IncidentSeverity;
    confidence: number;
    recommendation: string;
  } | null>(null);

  // Reset results if imageFile changes or becomes null
  useEffect(() => {
    if (!imageFile) {
      setIsScanning(false);
      setProgress(0);
      setStageIndex(0);
      setAnalysisResult(null);
    } else {
      setAnalysisResult(null);
    }
  }, [imageFile]);

  // Simulation timer effect (Total 3 seconds = 3000ms)
  useEffect(() => {
    if (!isScanning) return;

    const totalDuration = 3000;
    const intervalTime = 30; // update every 30ms
    const totalSteps = totalDuration / intervalTime;
    const increment = 100 / totalSteps;

    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        setIsScanning(false);

        setAnalysisResult({
          damageType: "Pothole",
          severity: "High",
          confidence: 96,
          recommendation:
            "Immediate pothole repair is recommended to prevent vehicle damage and improve road safety.",
        });
      }

      setProgress(Math.min(currentProgress, 100));

      // Update stage based on progress percentage
      const newStageIndex = Math.min(
        Math.floor((currentProgress / 100) * AI_STAGES.length),
        AI_STAGES.length - 1
      );
      setStageIndex(newStageIndex);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isScanning]);

  const handleStartAnalysis = () => {
    if (!imageFile || isScanning) return;
    setIsScanning(true);
    setProgress(0);
    setStageIndex(0);
    setAnalysisResult(null);
  };

  if (!imageFile) {
    return (
      <div className="w-full p-8 rounded-2xl bg-[#161B22] border border-[#30363D] flex flex-col items-center justify-center gap-3 text-center shadow-lg">
        <div className="p-4 rounded-full bg-[#21262D] border border-[#30363D] text-[#8B949E]">
          <Upload className="w-6 h-6" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-[#F0F6FC]">
          Upload an image to begin AI analysis.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-xl">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#58A6FF]" aria-hidden="true" />
          <h3 className="text-base font-semibold text-[#F0F6FC]">
            Sentinel AI Damage Analyzer
          </h3>
        </div>
        {analysisResult && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#238636]/15 text-[#3fb950] text-xs font-semibold border border-[#238636]/30">
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Analysis Complete
          </span>
        )}
      </div>

      {!isScanning && !analysisResult && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <p className="text-xs text-[#8B949E]">
            Image successfully loaded and ready for diagnostics.
          </p>
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="px-6 py-3 rounded-xl bg-[#58A6FF] text-[#0D1117] font-semibold text-sm hover:bg-[#79c0ff] transition-colors shadow-md cursor-pointer flex items-center gap-2"
          >
            <Brain className="w-4 h-4" aria-hidden="true" />
            Analyze Image
          </button>
        </div>
      )}

      {isScanning && (
        <div className="flex flex-col gap-6 py-6 px-4 rounded-xl bg-[#0D1117] border border-[#30363D]">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#58A6FF] animate-spin" aria-hidden="true" />
            <span className="text-sm font-mono font-semibold text-[#F0F6FC] tracking-wide">
              {AI_STAGES[stageIndex]}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono text-[#8B949E]">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#21262D] overflow-hidden border border-[#30363D]">
              <div
                className="h-full bg-[#58A6FF] transition-all duration-75 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {/* Card 1: Damage Type */}
          <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#8B949E]">
              <AlertTriangle className="w-4 h-4 text-[#58A6FF]" aria-hidden="true" />
              <span className="text-xs font-medium">Damage Type</span>
            </div>
            <span className="text-base font-semibold text-[#F0F6FC]">
              {analysisResult.damageType}
            </span>
          </div>

          {/* Card 2: Severity */}
          <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#8B949E]">
              <ShieldAlert className="w-4 h-4 text-[#F85149]" aria-hidden="true" />
              <span className="text-xs font-medium">Severity</span>
            </div>
            <div>
              <span
                className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  SEVERITY_BADGE_STYLES[analysisResult.severity]
                }`}
              >
                {analysisResult.severity}
              </span>
            </div>
          </div>

          {/* Card 3: Confidence */}
          <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#8B949E]">
              <Activity className="w-4 h-4 text-[#3fb950]" aria-hidden="true" />
              <span className="text-xs font-medium">Confidence</span>
            </div>
            <span className="text-base font-mono font-semibold text-[#F0F6FC]">
              {analysisResult.confidence}%
            </span>
          </div>

          {/* Card 4: Recommendation */}
          <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#8B949E]">
              <Wrench className="w-4 h-4 text-[#D29922]" aria-hidden="true" />
              <span className="text-xs font-medium">Recommendation</span>
            </div>
            <span className="text-xs text-[#F0F6FC] leading-relaxed font-medium">
              {analysisResult.recommendation}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DamageAnalyzer);