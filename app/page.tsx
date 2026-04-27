"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { councilMembers } from "@/lib/mock";
import { Icon } from "@iconify/react";

// ---- Animated Counter ----
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const step = Math.ceil(target / (duration / 16));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target]);
  return (
    <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums">
      {count}
      {suffix}
    </span>
  );
}



// ---- Hero Sectionxd ----
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
        <div className="max-w-3xl glass p-8 sm:p-12 rounded-[2.5rem] border border-white/40 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Internal glow for the glass effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
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

            <p className="mt-6 sm:mt-8 text-lg sm:text-2xl text-slate-600 max-w-2xl font-medium leading-relaxed animate-fade-in-up delay-200">
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
              <Link
                href="/perfil"
                className="px-8 py-4 sm:py-5 rounded-2xl bg-white/60 border border-slate-200 text-slate-700 font-bold text-base sm:text-lg hover:bg-white/90 hover:border-indigo-200 transition-all text-center backdrop-blur-sm shadow-sm"
              >
                Ver Mi Perfil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Council Cards ----
function CouncilSection() {
  const roles: Record<string, string> = {
    Consejero: "Consejero de Carrera",
    Admin_TI: "Administrador TI",
    Estudiante: "Estudiante",
  };

  return (
    <section className="py-12 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16 animate-fade-in-up">
          <h2 className="text-2xl sm:text-4xl font-bold">Quiénes Somos</h2>
          <p className="mt-2 sm:mt-3 text-foreground/50 text-sm sm:text-lg max-w-xl mx-auto">
            Tu Consejo de Sede — trabajando por ti cada día
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {councilMembers.map((member, i) => (
            <div
              key={member.id}
              className={`group relative rounded-2xl border border-border p-5 sm:p-8 bg-surface-card hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              {/* Purple accent top */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />

              {/* Avatar */}
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 group-hover:scale-105 transition-transform text-indigo-600">
                <Icon icon={member.role === "Consejero" ? "lucide:graduation-cap" : member.role === "Admin_TI" ? "lucide:briefcase" : "lucide:building"} />
              </div>

              <h3 className="text-lg sm:text-xl font-bold">{member.name}</h3>
              <p className="text-indigo-500 font-medium text-xs sm:text-sm mt-1">
                {roles[member.role] || member.role}
              </p>
              <p className="text-foreground/50 text-xs sm:text-sm mt-1">{member.department}</p>

              <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border flex items-center gap-2 text-xs sm:text-sm text-foreground/40">
                <span className="w-2 h-2 rounded-full bg-status-success" />
                {member.activeTickets} solicitudes activas
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Transparency Metrics ----
function MetricsSection() {
  const { tickets } = useApp();
  const resolvedCount = tickets.filter((t) => t.status === "resuelto").length;
  const pendingCount = tickets.filter((t) => t.status !== "resuelto").length;

  return (
    <section className="py-12 sm:py-24 relative">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16 animate-fade-in-up">
          <h2 className="text-2xl sm:text-4xl font-bold">Métricas de Transparencia</h2>
          <p className="mt-2 sm:mt-3 text-foreground/50 text-sm sm:text-lg">
            Impacto en tiempo real de la gestión del Consejo
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { value: resolvedCount, label: "Resueltas", icon: "lucide:check-circle", color: "from-status-success/20 to-status-success/5" },
            { value: tickets.length, label: "Total", icon: "lucide:mail", color: "from-indigo-100 to-indigo-50/50" },
            { value: pendingCount, label: "En Gestión", icon: "lucide:hourglass", color: "from-status-warning/20 to-status-warning/5" },
            { value: 3, label: "Miembros", icon: "lucide:users", color: "from-indigo-500/20 to-indigo-500/5" },
          ].map((metric, i) => (
            <div
              key={metric.label}
              className={`rounded-2xl border border-border p-4 sm:p-6 bg-gradient-to-br ${metric.color} animate-fade-in-up delay-${(i + 1) * 100} text-center`}
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 flex justify-center"><Icon icon={metric.icon} className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" /></div>
              <AnimatedCounter target={metric.value} />
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-foreground/50 font-medium">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- CTA Section ----
function CTASection() {
  return (
    <section className="py-12 sm:py-24 pb-24 sm:pb-24">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl sm:rounded-3xl glass p-6 sm:p-16 animate-fade-in-up">
          <h2 className="text-xl sm:text-4xl font-bold">¿Tienes una solicitud?</h2>
          <p className="mt-3 sm:mt-4 text-foreground/50 text-sm sm:text-lg max-w-xl mx-auto">
            Envía tu solicitud y le daremos seguimiento en tiempo real. Puedes revisar el estado desde tu portal personal.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/perfil"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border border-foreground/15 text-foreground/80 font-semibold text-sm sm:text-base hover:bg-foreground/5 transition-all flex items-center justify-center gap-2"
            >
              <Icon icon="lucide:user" className="w-5 h-5" /> Mi Perfil
            </Link>
            <Link
              href="/solicitud"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/35 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Icon icon="lucide:mail" className="w-5 h-5" /> Ingresar Solicitud
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import PublicLayout from "@/components/PublicLayout";

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <CouncilSection />
      <MetricsSection />
      <CTASection />
    </PublicLayout>
  );
}
