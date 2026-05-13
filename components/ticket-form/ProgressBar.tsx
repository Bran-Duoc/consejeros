"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/lib/transitions";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-5">
      <motion.div
        className="h-full bg-brand-blue rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
}
