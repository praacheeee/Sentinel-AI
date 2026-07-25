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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default SectionContainer;