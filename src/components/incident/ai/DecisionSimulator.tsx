import React from "react";
import { SlidersHorizontal, CheckCircle2, DollarSign, Clock, ShieldCheck } from "lucide-react";

import SectionContainer from "@/components/common/SectionContainer";
import SectionHeader from "@/components/common/SectionHeader";
import InfoCard from "@/components/common/InfoCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { normalizePercentage } from "@/constants/incident";

export interface DecisionScenario {
  id: string;
  title: string;
  description: string;
  estimatedCost: string;
  estimatedTime: string;
  riskReduction: number;
  recommended?: boolean;
}

export interface DecisionSimulatorProps {
  scenarios: DecisionScenario[];
  loading?: boolean;
  className?: string;
}

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
  scenarios,
  loading = false,
  className = "",
}) => {
  return (
    <SectionContainer className={className}>
      <SectionHeader
        title="Decision Simulator"
        subtitle="Compare AI-generated response strategies before creating a work order."
        icon={SlidersHorizontal}
      />

      {loading ? (
        <LoadingSkeleton variant="card" count={2} />
      ) : scenarios.length === 0 ? (
        <EmptyState
          title="No response strategies"
          description="The AI has not generated any decision scenarios."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {scenarios.map((scenario) => {
            const riskReductionPercentage = Math.round(
              normalizePercentage(scenario.riskReduction)
            );

            return (
              <InfoCard
                key={scenario.id}
                title={scenario.title}
                description={scenario.description}
                action={
                  scenario.recommended ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Recommended
                    </span>
                  ) : undefined
                }
              >
                <div className="p-4 rounded-xl bg-[#21262D] border border-[#30363D] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Estimated Cost */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#161B22] border border-[#30363D] text-[#8B949E] shrink-0">
                      <DollarSign className="w-4 h-4 text-current" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs text-[#8B949E] block">Estimated Cost</span>
                      <span className="text-sm font-semibold text-[#F0F6FC]">
                        {scenario.estimatedCost}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#161B22] border border-[#30363D] text-[#8B949E] shrink-0">
                      <Clock className="w-4 h-4 text-current" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs text-[#8B949E] block">Estimated Time</span>
                      <span className="text-sm font-semibold text-[#F0F6FC]">
                        {scenario.estimatedTime}
                      </span>
                    </div>
                  </div>

                  {/* Risk Reduction Progress Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8B949E] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#58A6FF]" aria-hidden="true" />
                        Risk Reduction
                      </span>
                      <span className="font-semibold text-[#58A6FF]">
                        {riskReductionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#161B22] border border-[#30363D] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#58A6FF] h-full rounded-full transition-all"
                        style={{ width: `${riskReductionPercentage}%` }}
                        role="progressbar"
                        aria-label={`Risk reduction for ${scenario.title}`}
                        aria-valuenow={riskReductionPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </InfoCard>
            );
          })}
        </div>
      )}
    </SectionContainer>
  );
};

export default React.memo(DecisionSimulator);