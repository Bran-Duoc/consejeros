"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/transitions";
import { SCHOOLS_DATA } from "@/lib/data";
import { sanitizeInput } from "@/lib/validations";

// ---- Reusable Field Error ----
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1"
      role="alert"
    >
      <Icon icon="lucide:alert-circle" className="w-3 h-3 shrink-0" />
      {error}
    </motion.p>
  );
}

interface StepDetailsProps {
  data: {
    name: string;
    email: string;
    school: string;
    career: string;
    title: string;
    description: string;
  };
  onChange: (key: string, val: string) => void;
  errors: Record<string, string>;
}

export function StepDetails({ data, onChange, errors }: StepDetailsProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
      }}
    >
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">Completa tu solicitud</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Ingresa los detalles para que podamos ayudarte.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
        {/* Nombre */}
        <motion.div variants={fadeInUp}>
          <label htmlFor="field-name" className="block text-xs font-semibold text-slate-600 mb-1">
            Nombre completo <span className="text-red-400">*</span>
          </label>
          <input
            id="field-name"
            type="text"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ej: María González"
            autoComplete="name"
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 ${errors.name ? "border-red-300" : "border-slate-200"}`}
          />
          <FieldError error={errors.name} />
        </motion.div>

        {/* Email (readonly) */}
        <motion.div variants={fadeInUp}>
          <label htmlFor="field-email" className="block text-xs font-semibold text-slate-600 mb-1">
            Correo institucional
          </label>
          <input
            id="field-email"
            type="email"
            value={data.email}
            disabled
            className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-sm"
          />
        </motion.div>

        {/* Escuela */}
        <motion.div variants={fadeInUp}>
          <label htmlFor="field-school" className="block text-xs font-semibold text-slate-600 mb-1">
            Escuela <span className="text-red-400">*</span>
          </label>
          <select
            id="field-school"
            value={data.school}
            onChange={(e) => {
              onChange("school", e.target.value);
              onChange("career", "");
            }}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue appearance-none ${errors.school ? "border-red-300" : "border-slate-200"}`}
          >
            <option value="">Selecciona tu escuela</option>
            {Object.keys(SCHOOLS_DATA).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <FieldError error={errors.school} />
        </motion.div>

        {/* Carrera */}
        <motion.div variants={fadeInUp}>
          <label htmlFor="field-career" className="block text-xs font-semibold text-slate-600 mb-1">
            Carrera <span className="text-red-400">*</span>
          </label>
          <select
            id="field-career"
            value={data.career}
            disabled={!data.school}
            onChange={(e) => onChange("career", e.target.value)}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue appearance-none disabled:opacity-50 disabled:bg-slate-50 ${errors.career ? "border-red-300" : "border-slate-200"}`}
          >
            <option value="">{data.school ? "Selecciona tu carrera" : "Primero elige escuela"}</option>
            {data.school && SCHOOLS_DATA[data.school]?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <FieldError error={errors.career} />
        </motion.div>

        {/* Título */}
        <motion.div className="md:col-span-2" variants={fadeInUp}>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="field-title" className="text-xs font-semibold text-slate-600">
              Asunto de la solicitud <span className="text-red-400">*</span>
            </label>
            <span className={`text-[10px] font-mono tabular-nums ${data.title.length > 90 ? "text-red-400" : "text-slate-300"}`}>
              {data.title.length}/100
            </span>
          </div>
          <input
            id="field-title"
            type="text"
            value={data.title}
            onChange={(e) => onChange("title", sanitizeInput(e.target.value))}
            placeholder="Ej: Certificado de Alumno Regular"
            maxLength={100}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 ${errors.title ? "border-red-300" : "border-slate-200"}`}
          />
          <FieldError error={errors.title} />
        </motion.div>

        {/* Descripción */}
        <motion.div className="md:col-span-2" variants={fadeInUp}>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="field-desc" className="text-xs font-semibold text-slate-600">
              Descripción <span className="text-red-400">*</span>
            </label>
            <span className={`text-[10px] font-mono tabular-nums ${data.description.length > 1800 ? "text-red-400" : "text-slate-300"}`}>
              {data.description.length}/2000
            </span>
          </div>
          <textarea
            id="field-desc"
            value={data.description}
            onChange={(e) => onChange("description", sanitizeInput(e.target.value))}
            placeholder="Describe tu situación con el mayor detalle posible..."
            rows={3}
            maxLength={2000}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 resize-none ${errors.description ? "border-red-300" : "border-slate-200"}`}
          />
          <FieldError error={errors.description} />
        </motion.div>
      </div>
    </motion.div>
  );
}
