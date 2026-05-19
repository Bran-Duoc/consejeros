"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { tickets, user, isInitializing, isAuthLoading } = useApp();
  const router = useRouter();

  React.useEffect(() => {
    if (!isInitializing && !isAuthLoading && !user) {
      router.push("/");
    }
  }, [user, isInitializing, isAuthLoading, router]);

  if (isInitializing || isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

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
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Solicitudes</h1>
              <p className="text-slate-500 mt-1 font-medium">Gestiona y revisa el estado de tus consultas al consejo.</p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              <Icon icon="lucide:plus" className="w-5 h-5" />
              Nueva Solicitud
            </Link>
          </motion.div>

          {/* Stats Summary */}
          <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Enviadas</div>
              <div className="text-3xl font-black text-slate-900">{myTickets.length}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">En Proceso</div>
              <div className="text-3xl font-black text-slate-900">{myTickets.filter(t => t.status !== 'resuelto').length}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Resueltas</div>
              <div className="text-3xl font-black text-emerald-600">{myTickets.filter(t => t.status === 'resuelto').length}</div>
            </div>
          </motion.div>

          {/* Tickets List */}
          <motion.div variants={staggerItem} className="space-y-4">
            {myTickets.length > 0 ? (
              myTickets.map((ticket) => {
                const statusInfo = getSimplifiedStatus(ticket.status);
                return (
                  <div 
                    key={ticket.id}
                    className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color} flex items-center gap-1.5`}>
                          <Icon icon={statusInfo.icon} className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                          {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h3 className="text-slate-900 font-bold truncate text-lg">
                        {categoryLabels[ticket.category as TicketCategory] || ticket.category}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-1 italic">
                        &quot;{ticket.description}&quot;
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Identificador</div>
                        <div className="text-slate-900 font-mono text-xs font-bold">#{ticket.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon icon="lucide:clipboard-x" className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes solicitudes</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">Cuando envíes una consulta al consejo, aparecerá aquí para que puedas seguir su estado.</p>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all"
                >
                  Crear mi primera solicitud
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
