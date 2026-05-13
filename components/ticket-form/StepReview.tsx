"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/transitions";
import {
  TicketCategory,
  UrgencyLevel,
  categoryLabels,
  categoryIcons,
  urgencyLabels,
} from "@/lib/data";

interface ReviewData {
  name: string;
  email: string;
  school: string;
  career: string;
  category: string;
  urgency: string;
  title: string;
  description: string;
  arcoConsent: boolean;
}

interface StepReviewProps {
  data: ReviewData;
  onChange: (key: string, val: boolean) => void;
}

export function StepReview({ data, onChange }: StepReviewProps) {
  const reviewItems = [
    { label: "Nombre", value: data.name },
    { label: "Email", value: data.email },
    { label: "Escuela", value: data.school },
    { label: "Carrera", value: data.career },
    {
      label: "Categoría",
      value: data.category ? (
        <span className="inline-flex items-center gap-1.5">
          <Icon icon={categoryIcons[data.category as TicketCategory]} className="w-3.5 h-3.5" />
          {categoryLabels[data.category as TicketCategory]}
        </span>
      ) : "—",
    },
    { label: "Urgencia", value: data.urgency ? urgencyLabels[data.urgency as UrgencyLevel] : "—" },
    { label: "Asunto", value: data.title },
    { label: "Descripción", value: data.description },
  ];

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">Revisa tu solicitud</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Confirma que la información sea correcta.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-slate-100 p-4 bg-slate-50/50 mb-4">
        {reviewItems.map((item) => (
          <div key={item.label} className={`py-1 ${item.label === "Descripción" ? "sm:col-span-2" : ""}`}>
            <span className="text-[11px] text-slate-400 font-medium block">{item.label}</span>
            <span className="text-sm text-slate-800 break-words">{item.value || "—"}</span>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-brand-blue/15 bg-brand-blue-light/30">
        <input
          type="checkbox"
          checked={data.arcoConsent}
          onChange={(e) => onChange("arcoConsent", e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue accent-brand-blue"
        />
        <span className="text-xs text-slate-600 leading-relaxed">
          Consiento el tratamiento de mis datos personales conforme a la <strong>Ley N° 21.719</strong>.
          Mis datos serán usados exclusivamente para gestionar esta solicitud.
          Puedo ejercer mis derechos ARCO contactando a la institución.
        </span>
      </label>
    </motion.div>
  );
}
