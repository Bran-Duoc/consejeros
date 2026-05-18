import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { transitions } from "@/lib/transitions";
import {
  TicketCategory,
  categoryIcons,
  categoryLabels,
  categorySubcategories,
  SubcategoryGroup,
} from "@/lib/data";

interface CategoryConfig {
  id: TicketCategory;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  borderColor: string;
  shortDesc: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "academico",
    title: categoryLabels.academico,
    icon: categoryIcons.academico,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverBgColor: "hover:bg-indigo-50",
    borderColor: "border-indigo-200",
    shortDesc: "Docentes, metodologías, topes de horario...",
  },
  {
    id: "infraestructura",
    title: categoryLabels.infraestructura,
    icon: categoryIcons.infraestructura,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    hoverBgColor: "hover:bg-amber-50",
    borderColor: "border-amber-200",
    shortDesc: "Casinos, laboratorios, espacios de estudio...",
  },
  {
    id: "bienestar",
    title: categoryLabels.bienestar,
    icon: categoryIcons.bienestar,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverBgColor: "hover:bg-emerald-50",
    borderColor: "border-emerald-200",
    shortDesc: "PAE, talleres, deportes, pastoral...",
  },
  {
    id: "financiero",
    title: categoryLabels.financiero,
    icon: categoryIcons.financiero,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    hoverBgColor: "hover:bg-cyan-50",
    borderColor: "border-cyan-200",
    shortDesc: "Becas, beneficios, procesos de pago...",
  },
  {
    id: "otro",
    title: categoryLabels.otro,
    icon: categoryIcons.otro,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    hoverBgColor: "hover:bg-slate-100",
    borderColor: "border-slate-300",
    shortDesc: "Dudas generales, sugerencias, reclamos...",
  },
];

interface StepCategoryProps {
  value: TicketCategory | "";
  onChange: (v: TicketCategory) => void;
  onContinue: (cat: TicketCategory, subcat: string) => void;
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

function CategoryDetail({ cat, onContinue }: { cat: CategoryConfig; onContinue: (cat: TicketCategory, subcat: string) => void }) {
  const groups = categorySubcategories[cat.id] || [];
  const [selectedGroup, setSelectedGroup] = useState<SubcategoryGroup | null>(null);

  useEffect(() => {
    setSelectedGroup(null);
  }, [cat.id]);

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedGroup ? (
          <motion.div
            key="groups"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {(cat.id === "bienestar" || cat.id === "financiero") && (
              <div className={`mb-5 p-3 rounded-xl border ${cat.borderColor} bg-white flex items-start gap-3 shadow-sm`}>
                <div className={`w-8 h-8 rounded-lg ${cat.bgColor} ${cat.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon icon="lucide:info" className="w-4 h-4" />
                </div>
                <div>
                  <h5 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${cat.color}`}>Nuestra labor es orientarte</h5>
                  <p className="text-[11px] text-slate-500 leading-snug font-medium">
                    Somos estudiantes como tú. Nuestro rol en esta área es escucharte y <strong>derivarte a los canales oficiales</strong> de la sede para que recibas la atención correcta.
                  </p>
                </div>
              </div>
            )}
            
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Icon icon="lucide:folder-open" className={`w-3.5 h-3.5 ${cat.color}`} />
              Selecciona un tema principal:
            </h4>
            <div className="flex flex-col gap-2">
              {groups.map((group, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={(e) => { e.stopPropagation(); setSelectedGroup(group); }}
                  className={`text-left p-3.5 rounded-xl border ${cat.borderColor} bg-white ${cat.hoverBgColor} transition-all shadow-sm group flex items-center gap-4`}
                >
                  <div className={`w-10 h-10 rounded-lg ${cat.bgColor} ${cat.color} flex items-center justify-center shrink-0 border border-white/50 shadow-inner`}>
                    <Icon icon={group.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-xs sm:text-sm text-slate-800 group-hover:${cat.color} transition-colors leading-tight`}>{group.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-medium">{group.options.length} opciones disponibles</div>
                  </div>
                  <Icon icon="lucide:chevron-right" className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedGroup(null); }}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors shrink-0 shadow-sm"
              >
                <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              </button>
              <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Icon icon={selectedGroup.icon} className={`w-3.5 h-3.5 ${cat.color}`} />
                {selectedGroup.name}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedGroup.options.map((sub, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onContinue(cat.id, `${selectedGroup.name} - ${sub.label}`); 
                  }}
                  className={`text-left p-3.5 rounded-xl border ${cat.borderColor} bg-white ${cat.hoverBgColor} transition-all shadow-sm group flex flex-col justify-center`}
                  style={{ minHeight: '4.5rem' }}
                >
                  <div className={`font-bold text-xs sm:text-sm text-slate-800 group-hover:${cat.color} transition-colors leading-tight`}>{sub.label}</div>
                  {sub.description && (
                    <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 leading-snug font-medium line-clamp-2">{sub.description}</div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
