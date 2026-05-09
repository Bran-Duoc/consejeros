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
  const { tickets, surveys } = useApp();

  const total = tickets.length;
  const nuevo = tickets.filter((t) => t.status === "nuevo").length;
  const pending = tickets.filter((t) => t.status === "pendiente").length;
  const inReview = tickets.filter((t) => t.status === "en_revision").length;
  const escalated = tickets.filter((t) => t.status === "escalado").length;
  const resolved = tickets.filter((t) => t.status === "resuelto").length;

  // SLA alerts
  const slaAlerts = tickets
    .filter((t) => t.status !== "resuelto")
    .map((t) => ({ ...t, sla: calculateSLAStatus(t.slaDeadline) }))
    .filter((t) => t.sla.level === "danger" || t.sla.level === "expired")
    .sort((a, b) => a.sla.remainingMs - b.sla.remainingMs);

  // CSAT average
  const avgCSAT = surveys.length > 0 ? (surveys.reduce((s, sv) => s + sv.csat, 0) / surveys.length).toFixed(1) : "—";

  // Category distribution
  const catCounts: Record<string, number> = {};
  tickets.forEach((t) => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-foreground text-sm mt-1">Vista general del estado de solicitudes</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="lucide:mail" label="Total Tickets" value={total} color="text-foreground" trend={`+${nuevo}`} />
        <StatCard icon="lucide:alert-circle" label="Escalados" value={escalated} color="text-status-danger" />
        <StatCard icon="lucide:hourglass" label="Pendientes" value={pending + inReview} color="text-status-warning" />
        <StatCard icon="lucide:star" label="CSAT Promedio" value={avgCSAT} color="text-status-warning" />
      </div>

      {/* Status distribution mini bar */}
      <div className="rounded-2xl bg-surface-card border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Distribución por Estado</h3>
        <div className="flex rounded-full h-2 overflow-hidden bg-slate-100">
          {([
            { status: "nuevo" as TicketStatus, count: nuevo, color: "bg-sky-400" },
            { status: "pendiente" as TicketStatus, count: pending, color: "bg-indigo-400" },
            { status: "en_revision" as TicketStatus, count: inReview, color: "bg-amber-400" },
            { status: "escalado" as TicketStatus, count: escalated, color: "bg-rose-400" },
            { status: "resuelto" as TicketStatus, count: resolved, color: "bg-emerald-400" },
          ]).map((s) => (
            <div
              key={s.status}
              className={`${s.color} transition-all duration-500`}
              style={{ width: total > 0 ? `${(s.count / total) * 100}%` : "0%" }}
              title={`${statusLabels[s.status]}: ${s.count}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {([
            { label: "Nuevo", count: nuevo, color: "bg-sky-500" },
            { label: "Pendiente", count: pending, color: "bg-indigo-500" },
            { label: "En revisión", count: inReview, color: "bg-status-warning" },
            { label: "Escalado", count: escalated, color: "bg-status-danger" },
            { label: "Resuelto", count: resolved, color: "bg-status-success" },
          ]).map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs text-foreground">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              {s.label} ({s.count})
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SLA Alerts */}
        <div className="rounded-2xl bg-surface-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon icon="lucide:alert-triangle" className="text-status-danger w-4 h-4" /> Alertas SLA
            </h3>
            <Link href="/admin/kanban" className="text-xs text-indigo-500 hover:text-indigo-500-light transition">Ver Kanban →</Link>
          </div>
          {slaAlerts.length === 0 ? (
            <div className="text-center py-8 text-foreground text-sm flex flex-col items-center">
              <Icon icon="lucide:check-circle-2" className="w-8 h-8 text-status-success mb-2" />
              Sin alertas de SLA
            </div>
          ) : (
            <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
              {slaAlerts.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-foreground">
                  <div className={`w-2 h-8 rounded-full shrink-0 ${t.sla.level === "expired" ? "bg-status-danger animate-blink-danger" : "bg-status-warning"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-foreground">{categoryLabels[t.category as TicketCategory]}</p>
                  </div>
                  <span className="text-xs font-mono shrink-0" style={{ color: t.sla.color }}>
                    {t.sla.remainingFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category distribution */}
        <div className="rounded-2xl bg-surface-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon icon="lucide:bar-chart-2" className="text-indigo-600 w-4 h-4" /> Por Categoría
          </h3>
          <div className="space-y-3">
            {Object.entries(catCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{categoryLabels[cat as TicketCategory]}</span>
                    <span className="text-foreground font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-foreground">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-700"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/admin/kanban"
          className="p-5 rounded-2xl bg-surface-card border border-border hover:border-indigo-500/30 hover:bg-surface-card/80 transition-all group"
        >
          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform"><Icon icon="lucide:kanban-square" /></span>
          <span className="font-semibold block">Tablero Kanban</span>
          <span className="text-sm text-foreground">Gestionar solicitudes</span>
        </Link>
        <Link
          href="/admin/metrics"
          className="p-5 rounded-2xl bg-surface-card border border-border hover:border-indigo-600/30 hover:bg-surface-card/80 transition-all group"
        >
          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform"><Icon icon="lucide:line-chart" /></span>
          <span className="font-semibold block">Métricas y KPIs</span>
          <span className="text-sm text-foreground">Reportes en tiempo real</span>
        </Link>
        <Link
          href="/admin/audit"
          className="p-5 rounded-2xl bg-surface-card border border-border hover:border-status-warning/30 hover:bg-surface-card/80 transition-all group"
        >
          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform"><Icon icon="lucide:scroll-text" /></span>
          <span className="font-semibold block">Auditoría</span>
          <span className="text-sm text-foreground">Registro completo</span>
        </Link>
      </div>
    </div>
  );
}
