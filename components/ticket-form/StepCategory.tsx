"use client";

import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
import {
  TicketCategory,
  categoryLabels,
  categoryIcons,
} from "@/lib/data";

// ---- Category Configuration ----
interface CategoryConfig {
  id: TicketCategory;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  shortDesc: string;
  primaryFocus: string[];
  disclaimer: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "academico",
    title: "Académico",
    icon: categoryIcons.academico,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    shortDesc: "Inscripción, notas, certificados, convalidaciones.",
    primaryFocus: [
      "Levantamiento de necesidades grupales (ej. tutorías o reforzamientos).",
      "Inquietudes sobre metodologías, docentes o evaluaciones.",
      "Problemas de topes de horario, mallas y convalidaciones."
    ],
    disclaimer: "Orientamos en procesos administrativos (certificados, justificaciones) y te derivamos a los canales oficiales para su tramitación formal."
  },
  {
    id: "infraestructura",
    title: "Infraestructura",
    icon: categoryIcons.infraestructura,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    shortDesc: "Salas, equipos, WiFi, espacios físicos.",
    primaryFocus: [
      "Reporte de fallas en salas, laboratorios o equipamiento.",
      "Sugerencias de mejora para áreas comunes y conectividad WiFi.",
      "Solicitudes para espacios físicos de estudio o recreación."
    ],
    disclaimer: "Tu reporte se canaliza directamente con la subdirección de operaciones de la sede para una rápida resolución."
  },
  {
    id: "bienestar",
    title: "Bienestar",
    icon: categoryIcons.bienestar,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    shortDesc: "Salud mental, orientación, apoyo social.",
    primaryFocus: [
      "Acompañamiento en momentos de estrés o ansiedad académica.",
      "Orientación sobre programas de apoyo social de la sede.",
      "Derivación directa al Programa de Apoyo al Estudiante (PAE)."
    ],
    disclaimer: "Importante: Nosotros no agendamos horas médicas o psicológicas. Te brindamos un espacio seguro de primera acogida y te conectamos con los profesionales institucionales."
  },
  {
    id: "financiero",
    title: "Financiero",
    icon: categoryIcons.financiero,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    shortDesc: "Becas, pagos, aranceles, beneficios.",
    primaryFocus: [
      "Dudas sobre pérdida o postulación a beneficios estatales/internos.",
      "Orientación sobre el CAE, gratuidad o becas institucionales.",
      "Consultas generales sobre aranceles y procesos de pago."
    ],
    disclaimer: "Importante: Nosotros no asignamos becas ni gestionamos pagos. Te escuchamos y te derivamos al área de Financiamiento (DAE) para que no enfrentes la burocracia sin apoyo."
  },
  {
    id: "otro",
    title: "Otro",
    icon: categoryIcons.otro,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
    shortDesc: "Sugerencias, reclamos u otros temas.",
    primaryFocus: [
      "Propuestas de innovación o actividades para la comunidad.",
      "Reclamos generales no categorizados en las opciones anteriores.",
      "Dudas generales sobre la vida universitaria en la sede."
    ],
    disclaimer: "Si tu caso es complejo o no sabes a quién acudir, nosotros lo analizaremos y te guiaremos hacia la unidad correcta de la Sede Viña del Mar."
  }
];

interface StepCategoryProps {
  value: TicketCategory | "";
  onChange: (v: TicketCategory) => void;
  onContinue: (v: TicketCategory) => void;
}

export function StepCategory({ value, onChange, onContinue }: StepCategoryProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">¿En qué podemos ayudarte?</h2>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          Selecciona la categoría de tu solicitud.
        </p>
      </div>

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {CATEGORIES.map((cat) => {
          const isExpanded = value === cat.id;

          return (
            <motion.div 
              key={cat.id}
              variants={staggerItem}
              layout
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer ${
                isExpanded ? `bg-white shadow-md ${cat.borderColor} ring-1 ring-slate-100` : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
              onClick={() => onChange(cat.id)}
            >
              {/* Card Header (Siempre visible) */}
              <div className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.bgColor} ${cat.color}`}>
                  <Icon icon={cat.icon} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{cat.title}</h3>
                  {!isExpanded && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-slate-500 mt-0.5"
                    >
                      {cat.shortDesc}
                    </motion.p>
                  )}
                </div>
                <motion.div 
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-slate-400"
                >
                  <Icon icon="lucide:chevron-down" className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Card Body (Expandible) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                      
                      {/* Foco de Acción */}
                      <div className="mb-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lo que abordamos aquí:</h4>
                        <ul className="space-y-2.5">
                          {cat.primaryFocus.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                              <Icon icon="lucide:check-circle-2" className={`shrink-0 mt-0.5 w-4 h-4 ${cat.color}`} />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Disclaimer / Gestión de Expectativas */}
                      <div className={`p-3 rounded-xl mb-4 text-[11px] sm:text-xs leading-relaxed flex items-start gap-2 border ${cat.bgColor} ${cat.borderColor}`}>
                        <Icon icon="lucide:info" className={`shrink-0 mt-0.5 w-4 h-4 ${cat.color}`} />
                        <p className={`font-medium ${cat.color.replace('600', '800')}`}>{cat.disclaimer}</p>
                      </div>

                      {/* Botón de Continuar */}
                      <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation(); 
                          onContinue(cat.id);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-slate-900/10"
                      >
                        Continuar con {cat.title.toLowerCase()} <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                      </motion.button>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
