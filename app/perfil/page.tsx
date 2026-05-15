"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { TicketStatus, categoryLabels, TicketCategory } from "@/lib/data";
import { staggerContainer, staggerItem } from "@/lib/transitions";

// Mapeo simplificado para el estudiante
const getSimplifiedStatus = (status: TicketStatus) => {
  switch (status) {
    case "nuevo":
      return { label: "Abierta", color: "text-sky-600 bg-sky-50 border-sky-100", icon: "lucide:plus-circle" };
    case "resuelto":
      return { label: "Cerrada", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: "lucide:check-circle" };
    default:
      return { label: "En atención", color: "text-amber-600 bg-amber-50 border-amber-100", icon: "lucide:clock" };
  }
};

export default function StudentProfile() {
  const { tickets, user, role } = useApp();

  // Filtrar solo los tickets del usuario logueado (createdBy = user UUID)
  const myTickets = tickets.filter((t) => t.createdBy === user?.id);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 right-6">
        <Link 
          href="/admin/login" 
          className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-indigo-400 transition-all uppercase tracking-[0.2em] px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-indigo-500/20"
        >
          <Icon icon="lucide:terminal" className="w-3.5 h-3.5" />
          Acceso Administrador
        </Link>
      </div>
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mis Solicitudes</h1>
            <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-100 text-sm"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Nueva Solicitud
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Abiertas", count: myTickets.filter(t => t.status === 'nuevo').length, color: "bg-sky-500" },
            { label: "En Proceso", count: myTickets.filter(t => t.status !== 'nuevo' && t.status !== 'resuelto').length, color: "bg-amber-500" },
            { label: "Cerradas", count: myTickets.filter(t => t.status === 'resuelto').length, color: "bg-emerald-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <div className="text-2xl font-extrabold text-slate-800">{stat.count}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              <div className={`h-1 w-8 mx-auto mt-2 rounded-full ${stat.color}`} />
            </div>
          ))}
        </div>

        {/* Tickets List */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {myTickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Icon icon="lucide:inbox" className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-medium">Aún no has realizado ninguna solicitud.</p>
            </div>
          ) : (
            myTickets.map((ticket) => {
              const status = getSimplifiedStatus(ticket.status);
              return (
                <motion.div
                  key={ticket.id}
                  variants={staggerItem}
                  className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                          <Icon icon={status.icon} className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          {new Date(ticket.createdAt).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium italic">
                        Categoría: {categoryLabels[ticket.category as TicketCategory]}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-[10px] font-mono text-slate-300 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        #{ticket.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
