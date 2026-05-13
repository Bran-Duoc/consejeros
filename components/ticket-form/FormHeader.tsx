"use client";

import { Icon } from "@iconify/react";

const STEPS = ["Categoría", "Detalles", "Urgencia", "Revisión"] as const;

interface FormHeaderProps {
  step: number;
  isOffline: boolean;
  onSignOut: () => void;
}

export function FormHeader({ step, isOffline, onSignOut }: FormHeaderProps) {
  return (
    <div className="max-w-3xl mx-auto flex items-center justify-between">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Nueva Solicitud</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Paso {step + 1} de {STEPS.length} — <span className="text-slate-600 font-medium">{STEPS[step]}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isOffline && (
          <div className="flex items-center gap-1 bg-brand-yellow-light text-brand-yellow-dark border border-brand-yellow/30 px-2 py-1 rounded-lg text-[11px] font-medium">
            <Icon icon="lucide:wifi-off" className="w-3 h-3" />
            <span className="hidden sm:inline">Sin conexión</span>
          </div>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          title="Cerrar sesión"
        >
          <Icon icon="lucide:log-out" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </div>
  );
}
