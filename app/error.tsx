"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-4xl mb-6 text-red-500">
          <Icon icon="lucide:alert-triangle" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Algo salió mal
        </h1>

        {/* Description */}
        <p className="text-slate-500 text-sm mb-2 leading-relaxed">
          Ha ocurrido un error inesperado. Esto no debería pasar — nuestro equipo
          ha sido notificado automáticamente.
        </p>

        {/* Error details (collapsed) */}
        {error.message && (
          <details className="mb-6 text-left">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors font-medium">
              Detalles técnicos
            </summary>
            <pre className="mt-2 p-3 rounded-xl bg-slate-100 text-xs text-slate-600 overflow-auto max-h-32 font-mono">
              {error.message}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Icon icon="lucide:home" className="w-4 h-4" />
            Volver al Inicio
          </Link>
        </div>

        {/* Emergency Logout Option */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <button
            onClick={() => { window.location.href = "/logout"; }}
            className="w-full py-3.5 px-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-rose-100/50 hover:border-rose-200"
          >
            <Icon icon="lucide:shield-alert" className="w-4 h-4 text-rose-600" />
            Forzar Cierre de Sesión y Limpiar Caché
          </button>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">
            Usa esta opción si estás atascado en un ciclo de error o necesitas reiniciar tu cuenta por completo.
          </p>
        </div>

        {/* Support note */}
        <p className="mt-6 text-xs text-slate-400">
          Si el problema persiste, por favor contacta al equipo de soporte.
        </p>
      </div>
    </div>
  );
}
