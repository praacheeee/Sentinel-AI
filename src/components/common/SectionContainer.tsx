import React from "react";
import { motion } from "framer-motion";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default SectionContainer;
