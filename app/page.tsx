"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import PublicLayout from "@/components/PublicLayout";

// ---- Hero Section ----
function HeroSection() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background elements (subtle) */}
      <div className="absolute top-20 right-10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-indigo-100/20 blur-[80px] sm:blur-[120px]" />
      <div className="absolute bottom-10 left-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/5 blur-[60px] sm:blur-[100px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(84,131,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(84,131,191,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-md border border-indigo-200/50">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse-soft" />
              Portal Activo — Semestre 2026-1
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight animate-fade-in-up delay-100 text-slate-900">
            Tu voz construye <br />
            <span className="text-indigo-600">
              Nuestra Sede.
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-lg sm:text-2xl text-slate-700 max-w-2xl font-semibold leading-relaxed animate-fade-in-up delay-200">
            Accede al portal oficial de solicitudes y mejora la experiencia estudiantil en Duoc UC.
          </p>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up delay-300">
            <Link
              href="/solicitud"
              className="group px-8 py-4 sm:py-5 rounded-2xl bg-indigo-600 text-white font-bold text-base sm:text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Ingresar Solicitud
              <Icon icon="lucide:arrow-right" className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
    </PublicLayout>
  );
}
