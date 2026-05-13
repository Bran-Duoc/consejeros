"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/transitions";
import { UrgencyLevel, urgencyLabels } from "@/lib/data";

const URGENCY_LEVELS: {
  key: UrgencyLevel;
  icon: string;
  desc: string;
  activeClass: string;
}[] = [
  { key: "bajo", icon: "lucide:circle", desc: "Puede esperar unos días", activeClass: "border-brand-green bg-brand-green-light" },
  { key: "medio", icon: "lucide:clock", desc: "Importante, 24-48h", activeClass: "border-brand-yellow bg-brand-yellow-light" },
  { key: "alto", icon: "lucide:alert-triangle", desc: "Atención pronto, 8-12h", activeClass: "border-brand-red bg-brand-red-light" },
  { key: "critico", icon: "lucide:alert-circle", desc: "Atención inmediata", activeClass: "border-brand-red bg-brand-red-light ring-2 ring-brand-red/20" },
];

interface StepUrgencyProps {
  value: UrgencyLevel | "";
  onChange: (v: UrgencyLevel) => void;
}

export function StepUrgency({ value, onChange }: StepUrgencyProps) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">Nivel de urgencia</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Esto determina la prioridad y tiempo de respuesta.</p>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {URGENCY_LEVELS.map((l) => (
          <motion.button
            key={l.key}
            type="button"
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(l.key)}
            className={`w-full text-left p-3.5 rounded-xl border-2 transition-colors duration-150 flex items-center gap-3 ${
              value === l.key ? l.activeClass + " shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <Icon icon={l.icon} className="w-5 h-5 shrink-0 text-slate-600" />
            <div className="min-w-0">
              <span className="font-semibold text-sm text-slate-800 block">{urgencyLabels[l.key]}</span>
              <span className="text-[11px] text-slate-400">{l.desc}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
