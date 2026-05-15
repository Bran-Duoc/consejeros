"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

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
        <Link 
          href="/perfil" 
          className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-indigo-100"
        >
          <Icon icon="lucide:clipboard-list" className="w-4 h-4" />
          <span className="hidden sm:inline">Mis Solicitudes</span>
          <span className="sm:hidden text-[10px]">Ver Mis Solicitudes</span>
        </Link>

        {isOffline && (
          <div className="flex items-center gap-1 bg-brand-yellow-light text-brand-yellow-dark border border-brand-yellow/30 px-2 py-1 rounded-lg text-[11px] font-medium">
            <Icon icon="lucide:wifi-off" className="w-3 h-3" />
            <span className="hidden sm:inline">Sin conexión</span>
          </div>
        )}
        <Link 
          href="/admin/login" 
          className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-[0.2em] transition-all px-2 py-1.5"
          title="Terminal de Staff"
        >
          <Icon icon="lucide:terminal" className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Administrador</span>
        </Link>
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
