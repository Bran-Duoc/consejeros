"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { categoryLabels, TicketCategory, statusLabels, TicketStatus } from "@/lib/data";
import { calculateSLAStatus } from "@/lib/sla";
import { Icon } from "@iconify/react";

function StatCard({ label, value, icon, trend, color }: {
  label: string; value: string | number; icon: string; trend?: string; color: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-card border border-border p-5 hover:border-foreground transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl group-hover:scale-110 transition-transform">
          <Icon icon={icon} />
        </span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend.startsWith("+") ? "bg-status-success/15 text-status-success" : "bg-status-danger/15 text-status-danger"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-foreground mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { users } = useApp() as any; // users might not be in AppContext yet, checking

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bienvenido al Panel de Administración</h1>
        <p className="text-foreground text-sm mt-1">Gestión del portal de Consejeros de Sede</p>
      </div>

      {/* Welcome Card */}
      <div className="rounded-2xl bg-surface-card border border-border p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
          <Icon icon="lucide:shield-check" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Acceso Administrativo</h2>
        <p className="text-foreground max-w-md">
          Desde aquí podrás gestionar los usuarios y la configuración general del portal. 
          Las funciones de seguimiento de tickets han sido eliminadas para simplificar la plataforma.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="p-5 rounded-2xl bg-surface-card border border-border hover:border-indigo-500/30 hover:bg-surface-card/80 transition-all group"
        >
          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform"><Icon icon="lucide:users" /></span>
          <span className="font-semibold block">Gestión de Usuarios</span>
          <span className="text-sm text-foreground">Administrar permisos y accesos</span>
        </Link>
        <Link
          href="/"
          className="p-5 rounded-2xl bg-surface-card border border-border hover:border-foreground/30 hover:bg-surface-card/80 transition-all group"
        >
          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform"><Icon icon="lucide:external-link" /></span>
          <span className="font-semibold block">Ver Sitio Público</span>
          <span className="text-sm text-foreground">Volver a la vista del alumno</span>
        </Link>
      </div>
    </div>
  );
}
