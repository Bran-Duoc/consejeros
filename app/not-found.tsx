"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-transparent">
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-4 sm:pt-20 pb-20 sm:pb-12">
        
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="animate-fade-in-up">
            {/* 404 Illustration / Icon */}
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full shadow-2xl border-4 border-white flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                <Icon icon="lucide:map-pin-off" className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-300" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-rose-500 font-bold text-xl border-2 border-slate-100 rotate-12">
                404
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              ¿Te perdiste en el <br className="sm:hidden" /> campus digital?
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              La página que buscas no existe o fue movida. No te preocupes, el Consejo de Sede te ayuda a volver al camino correcto.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link 
                href="/"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/35 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:home" className="w-5 h-5" />
                Volver al Inicio
              </Link>
              <Link 
                href="/solicitud"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:mail" className="w-5 h-5" />
                Crear Solicitud
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
