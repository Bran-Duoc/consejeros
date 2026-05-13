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
  key: TicketCategory;
  color: string;
  activeBg: string;
  activeBorder: string;
  tagline: string;
  /** What consejeros directly handle (primary scope) */
  primary: { icon: string; text: string }[];
  /** Where we orient you to (secondary / official channels) */
  secondary?: { icon: string; text: string }[];
  /** Clarification about scope */
  disclaimer?: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "academico",
    color: "text-brand-red",
    activeBg: "bg-brand-red-light",
    activeBorder: "border-brand-red",
    tagline: "Levantamos tus necesidades como estudiante ante la sede",
    primary: [
      { icon: "lucide:megaphone", text: "Levantamientos de preocupaciones estudiantiles ante dirección de carrera" },
      { icon: "lucide:book-open", text: "Necesidad de reforzamientos, tutorías o apoyo académico extra" },
      { icon: "lucide:users", text: "Feedback sobre metodología de clases o experiencia docente" },
      { icon: "lucide:clipboard-list", text: "Inquietudes sobre mallas, horarios o carga académica" },
    ],
    secondary: [
      { icon: "lucide:file-text", text: "Certificados (alumno regular, concentración de notas) → Punto Estudiantil / Mi Duoc" },
      { icon: "lucide:repeat", text: "Convalidaciones, inscripción de asignaturas → Secretaría Académica" },
      { icon: "lucide:star", text: "Revisión de calificaciones → Directo con tu docente o director de carrera" },
    ],
    disclaimer: "Canalizamos tus inquietudes ante las autoridades. Para trámites administrativos, te orientamos al canal oficial correcto.",
  },
  {
    key: "infraestructura",
    color: "text-brand-yellow-dark",
    activeBg: "bg-brand-yellow-light",
    activeBorder: "border-brand-yellow",
    tagline: "Reporta problemas de espacios, equipos y servicios de la sede",
    primary: [
      { icon: "lucide:wifi-off", text: "Problemas de WiFi, conectividad o equipos tecnológicos" },
      { icon: "lucide:monitor-x", text: "Laboratorios, computadores o proyectores en mal estado" },
      { icon: "lucide:thermometer", text: "Climatización, iluminación o condiciones de las salas" },
      { icon: "lucide:door-open", text: "Espacios de estudio, bibliotecas o áreas comunes insuficientes" },
      { icon: "lucide:alert-triangle", text: "Situaciones de seguridad o higiene en las instalaciones" },
    ],
    disclaimer: "Reportamos directamente a las áreas responsables de la sede para gestión prioritaria.",
  },
  {
    key: "bienestar",
    color: "text-brand-green-dark",
    activeBg: "bg-brand-green-light",
    activeBorder: "border-brand-green",
    tagline: "Te acompañamos y orientamos al apoyo profesional que necesitas",
    primary: [
      { icon: "lucide:compass", text: "Orientación inicial: te escuchamos y te guiamos al servicio correcto" },
      { icon: "lucide:hand-helping", text: "Acompañamiento para acceder a programas de apoyo institucional" },
      { icon: "lucide:accessibility", text: "Necesidades de inclusión o adecuaciones especiales" },
      { icon: "lucide:heart-handshake", text: "Situaciones personales que afectan tu vida académica" },
    ],
    secondary: [
      { icon: "lucide:brain", text: "Atención psicológica profesional → Vida Estudiantil / DAE" },
      { icon: "lucide:stethoscope", text: "Apoyo de salud o crisis emocional → Línea de apoyo Duoc UC" },
      { icon: "lucide:baby", text: "Programas para padres/madres estudiantes → Vida Estudiantil" },
    ],
    disclaimer: "No somos profesionales de salud mental. Te conectamos de forma segura y confidencial con los equipos especializados de la institución.",
  },
  {
    key: "financiero",
    color: "text-brand-purple-dark",
    activeBg: "bg-brand-purple-light",
    activeBorder: "border-brand-purple",
    tagline: "Te orientamos sobre beneficios y opciones financieras disponibles",
    primary: [
      { icon: "lucide:compass", text: "Orientación sobre becas internas, Gratuidad, CAE y beneficios JUNAEB" },
      { icon: "lucide:route", text: "Te guiamos al área correcta según tu situación financiera" },
      { icon: "lucide:file-question", text: "Dudas sobre proceso de postulación a beneficios" },
      { icon: "lucide:shield-check", text: "Levantamiento de tu caso si sientes que necesitas apoyo urgente" },
    ],
    secondary: [
      { icon: "lucide:credit-card", text: "Pagos, cuotas y convenios → Área de Finanzas" },
      { icon: "lucide:receipt", text: "Estado de cuenta y facturación → Mi Duoc / Punto Estudiantil" },
      { icon: "lucide:landmark", text: "Renovación CAE / Gratuidad → Plataforma oficial MINEDUC" },
    ],
    disclaimer: "No gestionamos pagos ni beneficios directamente. Te acompañamos para que llegues al lugar correcto con la información necesaria.",
  },
  {
    key: "otro",
    color: "text-slate-500",
    activeBg: "bg-slate-50",
    activeBorder: "border-slate-400",
    tagline: "Cualquier otra inquietud, sugerencia o idea para mejorar la sede",
    primary: [
      { icon: "lucide:lightbulb", text: "Sugerencias para mejorar la experiencia estudiantil" },
      { icon: "lucide:flag", text: "Reclamos o situaciones que no encajan en otra categoría" },
      { icon: "lucide:rocket", text: "Ideas de proyectos o iniciativas para la comunidad" },
      { icon: "lucide:message-circle", text: "Cualquier tema que quieras que tu consejero lleve a la mesa" },
    ],
  },
];

// ---- Component ----
interface StepCategoryProps {
  value: TicketCategory | "";
  onChange: (v: TicketCategory) => void;
}

export function StepCategory({ value, onChange }: StepCategoryProps) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">¿En qué podemos ayudarte?</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Selecciona la categoría de tu solicitud para ver qué podemos hacer por ti.</p>
      <motion.div
        className="flex flex-col gap-2.5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {CATEGORIES.map((cat) => {
          const isActive = value === cat.key;
          return (
            <motion.div key={cat.key} variants={staggerItem} layout>
              {/* Card Header (always visible) */}
              <motion.button
                type="button"
                whileHover={!isActive ? { scale: 1.01, y: -1 } : undefined}
                whileTap={{ scale: 0.99 }}
                onClick={() => onChange(cat.key)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl border-2 transition-colors duration-150 ${
                  isActive
                    ? `${cat.activeBorder} ${cat.activeBg} shadow-md rounded-b-none`
                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? cat.activeBg : "bg-slate-50"}`}>
                      <Icon
                        icon={categoryIcons[cat.key]}
                        className={`w-4.5 h-4.5 ${isActive ? cat.color : "text-slate-400"}`}
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">{categoryLabels[cat.key]}</span>
                      <span className="text-[11px] text-slate-400 leading-tight">{cat.tagline}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={transitions.snappy}
                  >
                    <Icon icon="lucide:chevron-down" className={`w-4 h-4 ${isActive ? cat.color : "text-slate-300"}`} />
                  </motion.div>
                </div>
              </motion.button>

              {/* Expanded Detail Panel */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className={`border-2 border-t-0 ${cat.activeBorder} ${cat.activeBg} rounded-b-xl p-3.5 sm:p-4`}>
                      {/* Primary scope */}
                      <div className="mb-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon icon="lucide:check-circle-2" className={`w-3.5 h-3.5 ${cat.color}`} />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Lo que hacemos por ti</span>
                        </div>
                        <div className="space-y-1.5">
                          {cat.primary.map((item) => (
                            <div key={item.text} className="flex items-start gap-2 bg-white/60 rounded-lg px-2.5 py-1.5">
                              <Icon icon={item.icon} className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cat.color}`} />
                              <span className="text-xs text-slate-600 leading-relaxed">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Secondary scope (if exists) */}
                      {cat.secondary && cat.secondary.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Icon icon="lucide:arrow-right-circle" className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Te orientamos hacia</span>
                          </div>
                          <div className="space-y-1.5">
                            {cat.secondary.map((item) => (
                              <div key={item.text} className="flex items-start gap-2 bg-white/40 rounded-lg px-2.5 py-1.5 border border-slate-200/50">
                                <Icon icon={item.icon} className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                                <span className="text-[11px] text-slate-500 leading-relaxed">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Disclaimer */}
                      {cat.disclaimer && (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/50 border border-slate-200/40">
                          <Icon icon="lucide:info" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-blue" />
                          <span className="text-[11px] text-slate-500 leading-relaxed italic">{cat.disclaimer}</span>
                        </div>
                      )}
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
