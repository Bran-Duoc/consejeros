"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { categoryLabels, TicketCategory, statusLabels, TicketStatus } from "@/lib/data";
import { calculateSLAStatus } from "@/lib/sla";
import { Icon } from "@iconify/react";
import { staggerContainer, staggerItem } from "@/lib/transitions";

function StatCard({ label, value, icon, trend, color, bgColor }: {
  label: string; value: string | number; icon: string; trend?: string; color: string; bgColor: string;
}) {
  return (
    <motion.div 
      variants={staggerItem}
      className="rounded-2xl bg-white border border-slate-100 p-5 hover:border-slate-300 hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${bgColor} opacity-10 group-hover:scale-110 transition-transform duration-500`} />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={`w-10 h-10 rounded-xl ${bgColor} ${color} flex items-center justify-center text-xl`}>
          <Icon icon={icon} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
            trend.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
      </div>
    </motion.div>
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
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Vista general del estado de solicitudes en tiempo real</p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="lucide:ticket" label="Total Tickets" value={total} color="text-indigo-600" bgColor="bg-indigo-50" trend={`+${nuevo}`} />
        <StatCard icon="lucide:alert-triangle" label="Escalados" value={escalated} color="text-rose-600" bgColor="bg-rose-50" />
        <StatCard icon="lucide:clock" label="Pendientes" value={pending + inReview} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard icon="lucide:star" label="CSAT Promedio" value={avgCSAT} color="text-emerald-600" bgColor="bg-emerald-50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status distribution mini bar */}
        <motion.div variants={staggerItem} className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribución por Estado</h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{total} Solicitudes</span>
          </div>
          <div className="flex rounded-xl h-4 overflow-hidden bg-slate-50 border border-slate-100">
            {([
              { status: "nuevo" as TicketStatus, count: nuevo, color: "bg-sky-400" },
              { status: "pendiente" as TicketStatus, count: pending, color: "bg-indigo-400" },
              { status: "en_revision" as TicketStatus, count: inReview, color: "bg-amber-400" },
              { status: "escalado" as TicketStatus, count: escalated, color: "bg-rose-400" },
              { status: "resuelto" as TicketStatus, count: resolved, color: "bg-emerald-400" },
            ]).map((s) => (
              <div
                key={s.status}
                className={`${s.color} transition-all duration-700 ease-in-out`}
                style={{ width: total > 0 ? `${(s.count / total) * 100}%` : "0%" }}
                title={`${statusLabels[s.status]}: ${s.count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
            {([
              { label: "Nuevo", count: nuevo, color: "bg-sky-400" },
              { label: "Pendiente", count: pending, color: "bg-indigo-400" },
              { label: "En revisión", count: inReview, color: "bg-amber-400" },
              { label: "Escalado", count: escalated, color: "bg-rose-400" },
              { label: "Resuelto", count: resolved, color: "bg-emerald-400" },
            ]).map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                {s.label} <span className="text-slate-300 ml-1">({s.count})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SLA Alerts */}
        <motion.div variants={staggerItem} className="rounded-2xl bg-white border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Icon icon="lucide:bell" className="text-rose-500 w-3.5 h-3.5" /> Alertas SLA
            </h3>
            <Link href="/admin/kanban" className="text-[10px] font-bold text-indigo-500 hover:underline">VER TODO</Link>
          </div>
          {slaAlerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                <Icon icon="lucide:check-circle-2" className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-400">Todo bajo control</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
              {slaAlerts.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className={`w-1.5 h-8 rounded-full shrink-0 ${t.sla.level === "expired" ? "bg-rose-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate uppercase tracking-tight">{t.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{categoryLabels[t.category as TicketCategory]}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white border border-slate-200 shrink-0" style={{ color: t.sla.color }}>
                    {t.sla.remainingFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category distribution */}
        <motion.div variants={staggerItem} className="rounded-2xl bg-white border border-slate-100 p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Icon icon="lucide:pie-chart" className="text-indigo-600 w-3.5 h-3.5" /> Distribución por Carrera
          </h3>
          <div className="space-y-4">
            {Object.entries(catCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide mb-2">
                    <span className="text-slate-600">{categoryLabels[cat as TicketCategory]}</span>
                    <span className="text-slate-400">{count} solicitudes</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-50 border border-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / total) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                    />
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Quick actions Bento */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
          <Link
            href="/admin/tickets"
            className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:list-todo" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Tickets</span>
          </Link>
          <Link
            href="/admin/metrics"
            className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:bar-chart-3" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Métricas</span>
          </Link>
          <Link
            href="/admin/audit"
            className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:scroll-text" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Auditoría</span>
          </Link>
          <Link
            href="/admin/users"
            className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:users" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Usuarios</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
