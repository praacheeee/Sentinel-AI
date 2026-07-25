import React, { useState } from "react";
import { Sparkles } from "lucide-react";

import DashboardHeader from "@/components/common/DashboardHeader";
import SectionContainer from "@/components/common/SectionContainer";
import ImageUpload from "@/components/incident/ImageUpload";
import DamageAnalyzer from "@/components/incident/DamageAnalyzer";

export const AIInspection: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <DashboardHeader
          title="AI Infrastructure Damage Detection"
          subtitle="Upload an infrastructure image and let Sentinel AI detect possible defects."
          icon={Sparkles}
        />

        {/* Upload Component Section */}
        <SectionContainer>
          <ImageUpload onImageSelected={setImageFile} />
        </SectionContainer>

        {/* Damage Analyzer Component Section */}
        <SectionContainer>
          <DamageAnalyzer imageFile={imageFile} />
        </SectionContainer>
      </div>
    </main>
  );
};

export default React.memo(AIInspection);