"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { councilMembers } from "@/lib/data";
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
    <span className="text-4xl md:text-5xl font-bold tabular-nums">
      {count}
      {suffix}
    </span>
  );
}



// ---- Hero Section ----
function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-indigo-50/50" />
      <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-[120px]" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(84,131,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(84,131,191,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse-soft" />
              Portal Activo — Semestre 2026-1
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight animate-fade-in-up delay-100">
            Tu voz construye <br />
            <span className="text-indigo-600">
              nuestra sede
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl leading-relaxed animate-fade-in-up delay-200">
            El puente digital entre el alumnado y el Consejo de Sede. Envía
            solicitudes, haz seguimiento en tiempo real y sé parte del cambio.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up delay-300">
            <Link
              href="/solicitud"
              className="group px-8 py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center gap-2"
            >
              Enviar Solicitud
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/portal"
              className="px-8 py-4 rounded-2xl border border-foreground/15 text-foreground/80 font-semibold text-base hover:bg-foreground/5 hover:border-foreground/25 transition-all"
            >
              Ver Mi Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Council Cards ----
function CouncilSection() {
  const roles: Record<string, string> = {
    consejero: "Consejera de Carrera",
    trabajador: "Trabajador de Duoc",
    directora: "Directora de Sede",
  };

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold">Quiénes Somos</h2>
          <p className="mt-3 text-foreground/50 text-lg max-w-xl mx-auto">
            Tu Consejo de Sede — trabajando por ti cada día
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {councilMembers.map((member, i) => (
            <div
              key={member.id}
              className={`group relative rounded-2xl border border-border p-8 bg-surface-card hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              {/* Purple accent top */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />

              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-105 transition-transform text-indigo-600">
                <Icon icon={member.role === "consejero" ? "lucide:graduation-cap" : member.role === "trabajador" ? "lucide:briefcase" : "lucide:building"} />
              </div>

              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-indigo-500 font-medium text-sm mt-1">
                {roles[member.role] || member.role}
              </p>
              <p className="text-foreground/50 text-sm mt-1">{member.department}</p>

              <div className="mt-5 pt-5 border-t border-border flex items-center gap-2 text-sm text-foreground/40">
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
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/50 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold">Métricas de Transparencia</h2>
          <p className="mt-3 text-foreground/50 text-lg">
            Impacto en tiempo real de la gestión del Consejo
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: resolvedCount, label: "Solicitudes Resueltas", icon: "lucide:check-circle", color: "from-status-success/20 to-status-success/5" },
            { value: tickets.length, label: "Total Solicitudes", icon: "lucide:mail", color: "from-indigo-100 to-indigo-50/50" },
            { value: pendingCount, label: "En Gestión", icon: "lucide:hourglass", color: "from-status-warning/20 to-status-warning/5" },
            { value: 3, label: "Miembros del Consejo", icon: "lucide:users", color: "from-indigo-500/20 to-indigo-500/5" },
          ].map((metric, i) => (
            <div
              key={metric.label}
              className={`rounded-2xl border border-border p-6 bg-gradient-to-br ${metric.color} animate-fade-in-up delay-${(i + 1) * 100} text-center`}
            >
              <div className="text-3xl mb-3 flex justify-center"><Icon icon={metric.icon} className="w-8 h-8 opacity-80" /></div>
              <AnimatedCounter target={metric.value} />
              <p className="mt-2 text-sm text-foreground/50 font-medium">{metric.label}</p>
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
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-indigo-50 border border-indigo-100 p-12 sm:p-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold">¿Tienes una solicitud?</h2>
          <p className="mt-4 text-foreground/50 text-lg max-w-xl mx-auto">
            Envía tu solicitud y le daremos seguimiento en tiempo real. Puedes revisar el estado desde tu portal personal.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/portal"
              className="px-8 py-4 rounded-2xl border border-foreground/15 text-foreground/80 font-semibold hover:bg-foreground/5 transition-all flex items-center gap-2"
            >
              <Icon icon="lucide:user" className="w-5 h-5" /> Mi Portal
            </Link>
            <Link
              href="/solicitud"
              className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/35 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <Icon icon="lucide:mail" className="w-5 h-5" /> Enviar Solicitud
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/40">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="w-[121px] h-[40px] object-contain drop-shadow-sm opacity-90" />
          <span>Sede Viña del Mar</span>
        </div>
        <p className="flex items-center gap-1.5">© 2026 — Construido con <Icon icon="lucide:heart" className="w-4 h-4 text-indigo-600 fill-indigo-600" /> por el Consejo</p>
      </div>
    </footer>
  );
}

// ---- Main Page ----
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CouncilSection />
      <MetricsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
