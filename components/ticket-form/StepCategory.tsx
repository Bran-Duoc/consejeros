"use client";

import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { transitions } from "@/lib/transitions";
import {
  TicketCategory,
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
    primaryFocus: [
      "Levantamiento de necesidades grupales (ej. tutorías o reforzamientos).",
      "Inquietudes sobre metodologías, docentes o evaluaciones.",
      "Problemas de topes de horario, mallas y convalidaciones.",
    ],
    disclaimer:
      "Orientamos en procesos administrativos (certificados, justificaciones) y te derivamos a los canales oficiales para su tramitación formal.",
  },
  {
    id: "infraestructura",
    title: "Infraestructura",
    icon: categoryIcons.infraestructura,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    primaryFocus: [
      "Reporte de fallas en salas, laboratorios o equipamiento.",
      "Sugerencias de mejora para áreas comunes y conectividad WiFi.",
      "Solicitudes para espacios físicos de estudio o recreación.",
    ],
    disclaimer:
      "Tu reporte se canaliza directamente con la subdirección de operaciones de la sede para una rápida resolución.",
  },
  {
    id: "bienestar",
    title: "Bienestar",
    icon: categoryIcons.bienestar,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    primaryFocus: [
      "Acompañamiento en momentos de estrés o ansiedad académica.",
      "Orientación sobre programas de apoyo social de la sede.",
      "Derivación directa al Programa de Apoyo al Estudiante (PAE).",
    ],
    disclaimer:
      "Importante: No agendamos horas médicas o psicológicas. Te brindamos un espacio seguro de primera acogida y te conectamos con los profesionales institucionales.",
  },
  {
    id: "financiero",
    title: "Financiero",
    icon: categoryIcons.financiero,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    primaryFocus: [
      "Dudas sobre pérdida o postulación a beneficios estatales/internos.",
      "Orientación sobre el CAE, gratuidad o becas institucionales.",
      "Consultas generales sobre aranceles y procesos de pago.",
    ],
    disclaimer:
      "Importante: No asignamos becas ni gestionamos pagos. Te escuchamos y te derivamos al área de Financiamiento (DAE) para que no enfrentes la burocracia sin apoyo.",
  },
  {
    id: "otro",
    title: "Otro",
    icon: categoryIcons.otro,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
    primaryFocus: [
      "Propuestas de innovación o actividades para la comunidad.",
      "Reclamos generales no categorizados en las opciones anteriores.",
      "Dudas generales sobre la vida universitaria en la sede.",
    ],
    disclaimer:
      "Si tu caso es complejo o no sabes a quién acudir, nosotros lo analizaremos y te guiaremos hacia la unidad correcta de la Sede Viña del Mar.",
  },
];

interface StepCategoryProps {
  value: TicketCategory | "";
  onChange: (v: TicketCategory) => void;
  onContinue: (v: TicketCategory) => void;
}

export function StepCategory({ value, onChange, onContinue }: StepCategoryProps) {
  const activeCat = CATEGORIES.find((c) => c.id === value);
  const inactiveCats = CATEGORIES.filter((c) => c.id !== value);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          ¿En qué podemos ayudarte?
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Selecciona la categoría de tu solicitud.
        </p>
      </div>

      {/* ── MOBILE: stacked layout ── */}
      <div className="flex flex-col gap-2 sm:hidden">
        {CATEGORIES.map((cat) => {
          const isActive = value === cat.id;
          return (
            <div key={cat.id}>
              {/* Collapsed button */}
              <motion.button
                type="button"
                layout
                onClick={() => onChange(cat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                  isActive
                    ? `${cat.borderColor} ${cat.bgColor} shadow-sm`
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cat.bgColor} ${cat.color}`}
                >
                  <Icon icon={cat.icon} className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-800 text-sm flex-1 text-left">
                  {cat.title}
                </span>
                <motion.div animate={{ rotate: isActive ? 180 : 0 }}>
                  <Icon icon="lucide:chevron-down" className="w-4 h-4 text-slate-400" />
                </motion.div>
              </motion.button>

              {/* Expanded detail (mobile) */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className={`border-2 border-t-0 ${cat.borderColor} rounded-b-xl p-3 ${cat.bgColor}`}>
                      <CategoryDetail cat={cat} onContinue={onContinue} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: split panel layout ── */}
      <div className="hidden sm:flex gap-3 flex-1 min-h-0">
        {/* LEFT: Active category detail */}
        <AnimatePresence mode="wait">
          {activeCat ? (
            <motion.div
              key={activeCat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transitions.spring}
              className={`flex-1 border-2 ${activeCat.borderColor} ${activeCat.bgColor} rounded-2xl p-5 flex flex-col`}
            >
              {/* Active header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeCat.bgColor} ${activeCat.color} border ${activeCat.borderColor}`}
                >
                  <Icon icon={activeCat.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{activeCat.title}</h3>
                  <p className={`text-xs font-medium ${activeCat.color}`}>Categoría seleccionada</p>
                </div>
              </div>

              <CategoryDetail cat={activeCat} onContinue={onContinue} />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center"
            >
              <div className="text-center text-slate-400 p-6">
                <Icon icon="lucide:mouse-pointer-click" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Selecciona una categoría</p>
                <p className="text-xs mt-1">Haz clic en una opción del lado derecho</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RIGHT: Category buttons sidebar */}
        <div className="w-48 lg:w-56 flex flex-col gap-2 shrink-0">
          {(value ? inactiveCats : CATEGORIES).map((cat, idx) => (
            <motion.button
              key={cat.id}
              type="button"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...transitions.spring, delay: idx * 0.04 }}
              whileHover={{ scale: 1.03, x: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(cat.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-colors text-left ${
                value === cat.id
                  ? `${cat.borderColor} ${cat.bgColor} shadow-sm`
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cat.bgColor} ${cat.color}`}
              >
                <Icon icon={cat.icon} className="w-4.5 h-4.5" />
              </div>
              <span className="font-semibold text-slate-700 text-xs leading-tight">
                {cat.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Shared detail content ----
function CategoryDetail({
  cat,
  onContinue,
}: {
  cat: CategoryConfig;
  onContinue: (v: TicketCategory) => void;
}) {
  return (
    <>
      {/* Focus items */}
      <div className="mb-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Lo que abordamos aquí:
        </h4>
        <ul className="space-y-2">
          {cat.primaryFocus.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
              <Icon
                icon="lucide:check-circle-2"
                className={`shrink-0 mt-0.5 w-4 h-4 ${cat.color}`}
              />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div
        className={`p-2.5 rounded-xl mb-3 text-[11px] leading-relaxed flex items-start gap-2 border bg-white/50 ${cat.borderColor}`}
      >
        <Icon icon="lucide:info" className={`shrink-0 mt-0.5 w-3.5 h-3.5 ${cat.color}`} />
        <p className="font-medium text-slate-600">{cat.disclaimer}</p>
      </div>

      {/* Continue button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          onContinue(cat.id);
        }}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-slate-900/10 mt-auto"
      >
        Continuar con {cat.title.toLowerCase()}{" "}
        <Icon icon="lucide:arrow-right" className="w-4 h-4" />
      </motion.button>
    </>
  );
}
