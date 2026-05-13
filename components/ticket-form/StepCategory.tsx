"use client";

import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { transitions } from "@/lib/transitions";
import {
  TicketCategory,
  categoryIcons,
} from "@/lib/data";

// ---- Category Configuration (Restaurando el texto que te gustó) ----
interface CategoryConfig {
  id: TicketCategory;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  shortDesc: string; // Recuperado
  primaryFocus: string[]; // Recuperado
  disclaimer: string; // Recuperado (antes secondaryFocus)
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
      "Problemas de topes de horario, mallas y convalidaciones.",
    ],
    disclaimer:
      "Orientamos en procesos administrativos (certificados, justificaciones) y te dirigimos a los canales oficiales para su tramitación formal.",
  },
  {
    id: "infraestructura",
    title: "Infraestructura",
    icon: categoryIcons.infraestructura,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    shortDesc: "Salas, laboratorios, áreas comunes, WiFi.",
    primaryFocus: [
      "Reporte de fallas en infraestructura o equipamiento.",
      "Sugerencias de mejora para espacios de estudio.",
      "Problemas de conectividad en zonas específicas de la sede.",
    ],
    disclaimer:
      "Canalizamos tu reporte con la subdirección de operaciones para una resolución rápida.",
  },
  {
    id: "bienestar",
    title: "Bienestar",
    icon: categoryIcons.bienestar,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    shortDesc: "Apoyo emocional, salud mental, orientación.",
    primaryFocus: [
      "Acompañamiento en situaciones de estrés o ansiedad académica.",
      "Orientación sobre programas de apoyo social.",
      "Derivación al Programa de Apoyo al Estudiante (PAE).",
    ],
    disclaimer:
      "No somos atención clínica directa. Brindamos primera acogida y te conectamos con los profesionales adecuados.",
  },
  {
    id: "financiero",
    title: "Financiero",
    icon: categoryIcons.financiero,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    shortDesc: "Becas, beneficios, aranceles, pagos.",
    primaryFocus: [
      "Dudas sobre postulación o pérdida de beneficios estatales/internos.",
      "Orientación sobre el CAE, gratuidad o becas institucionales.",
      "Consultas generales sobre procesos de pago.",
    ],
    disclaimer:
      "No gestionamos pagos ni asignamos becas. Te dirigimos al área de Financiamiento (DAE) con la orientación correcta.",
  },
  {
    id: "otro",
    title: "Otro",
    icon: categoryIcons.otro,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
    shortDesc: "Cualquier otro tema no listado.",
    primaryFocus: [
      "Dudas generales sobre la vida universitaria.",
      "Propuestas de mejora para la comunidad.",
      "Casos complejos que no sabes dónde categorizar.",
    ],
    disclaimer:
      "Si no sabes dónde acudir, nosotros te escuchamos y te guiamos hacia la unidad correcta.",
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
          Selecciona la categoría de tu solicitud para comenzar.
        </p>
      </div>

      {/* ── MOBILE: stacked layout ── */}
      <div className="flex flex-col gap-2 sm:hidden">
        {CATEGORIES.map((cat) => {
          const isActive = value === cat.id;
          return (
            <div key={cat.id}>
              <motion.button
                type="button"
                layout
                onClick={() => onChange(cat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                  isActive
                    ? `${cat.borderColor} ${cat.bgColor} shadow-sm`
                    : "border-slate-100 bg-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cat.bgColor} ${cat.color}`}>
                  <Icon icon={cat.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-bold text-slate-800 text-sm">{cat.title}</span>
                  {!isActive && <span className="block text-[10px] text-slate-400 truncate">{cat.shortDesc}</span>}
                </div>
                <motion.div animate={{ rotate: isActive ? 180 : 0 }}>
                  <Icon icon="lucide:chevron-down" className="w-4 h-4 text-slate-300" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`border-2 border-t-0 ${cat.borderColor} rounded-b-xl p-4 ${cat.bgColor}`}>
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
        <AnimatePresence mode="wait">
          {activeCat ? (
            <motion.div
              key={activeCat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transitions.spring}
              className={`flex-1 border-2 ${activeCat.borderColor} ${activeCat.bgColor} rounded-2xl p-6 flex flex-col`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeCat.bgColor} ${activeCat.color} border-2 ${activeCat.borderColor} shadow-sm`}>
                  <Icon icon={activeCat.icon} className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">{activeCat.title}</h3>
                  <p className="text-sm font-medium text-slate-500">{activeCat.shortDesc}</p>
                </div>
              </div>

              <CategoryDetail cat={activeCat} onContinue={onContinue} />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-slate-50/50"
            >
              <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
                <Icon icon="lucide:mouse-pointer-click" className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest">Selecciona una categoría</h3>
              <p className="text-slate-300 text-xs mt-2 text-center max-w-[200px]">
                Haz clic en una de las opciones de la derecha para ver cómo podemos ayudarte.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-56 lg:w-64 flex flex-col gap-2 shrink-0">
          {CATEGORIES.map((cat, idx) => {
            const isActive = value === cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...transitions.spring, delay: idx * 0.04 }}
                whileHover={{ scale: 1.02, x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(cat.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? `${cat.borderColor} ${cat.bgColor} shadow-md`
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isActive ? cat.bgColor : "bg-slate-50"} ${cat.color}`}>
                  <Icon icon={cat.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className={`block font-bold text-xs uppercase tracking-wider ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                    {cat.title}
                  </span>
                  {!isActive && <span className="block text-[10px] text-slate-300 truncate font-medium">{cat.shortDesc}</span>}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryDetail({ cat, onContinue }: { cat: CategoryConfig; onContinue: (v: TicketCategory) => void }) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mb-6 flex-1">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Icon icon="lucide:target" className={`w-3.5 h-3.5 ${cat.color}`} />
          Nuestro enfoque en esta área:
        </h4>
        <ul className="space-y-3">
          {cat.primaryFocus.map((item, idx) => (
            <motion.li 
              key={idx} 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed"
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cat.bgColor} border ${cat.borderColor}`} />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className={`p-4 rounded-xl mb-6 bg-white/60 border ${cat.borderColor} shadow-sm`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg ${cat.bgColor} ${cat.color} flex items-center justify-center shrink-0 border ${cat.borderColor}`}>
            <Icon icon="lucide:info" className="w-4 h-4" />
          </div>
          <div>
            <h5 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${cat.color}`}>Canales Oficiales</h5>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
              {cat.disclaimer}
            </p>
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => { e.stopPropagation(); onContinue(cat.id); }}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm shadow-xl shadow-slate-900/10"
      >
        Continuar con {cat.title}
        <Icon icon="lucide:arrow-right" className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
