import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import DashboardHeader from "@/components/common/DashboardHeader";
import SectionContainer from "@/components/common/SectionContainer";
import ImageUpload from "@/components/incident/ImageUpload";
import DamageAnalyzer from "@/components/incident/DamageAnalyzer";

export const AIInspection: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full max-w-5xl mx-auto pb-12"
    >
      {/* Page Header */}
      <DashboardHeader
        title="AI Pothole Inspection Studio"
        subtitle="Upload or select a roadway image for real-time neural surface defect detection, bounding box localization, and provisional severity triage."
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
    </motion.div>
  );
};

export default React.memo(AIInspection);
