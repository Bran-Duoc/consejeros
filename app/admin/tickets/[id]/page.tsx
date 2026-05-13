"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { TicketStatus, categoryLabels, urgencyLabels, TicketCategory } from "@/lib/data";
import { transitions } from "@/lib/transitions";

// Pasos internos para el administrador
const ADMIN_STEPS = [
  { id: "recepcion", label: "Recepción", icon: "lucide:mail-open", status: "pendiente" },
  { id: "verificacion", label: "Verificación", icon: "lucide:shield-check", status: "en_revision" },
  { id: "gestion", label: "Gestión", icon: "lucide:settings", status: "en_revision" },
  { id: "resolucion", label: "Resolución", icon: "lucide:check-circle", status: "resuelto" },
];

export default function TicketDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { tickets, updateTicket, user, role } = useApp();
  const [activeStep, setActiveStep] = useState(0);
  const [comment, setComment] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const ticket = tickets.find((t) => t.id === id);

  // 1. Auto-asignación y cambio de estado inicial
  useEffect(() => {
    if (ticket && !ticket.assignedTo && user?.email) {
      updateTicket(ticket.id, { 
        assignedTo: user.email,
        status: "pendiente" // Pasa a "En atención" automáticamente
      });
    }
  }, [ticket, user, updateTicket]);

  if (!ticket) return (
    <div className="h-screen flex items-center justify-center">
      <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  const handleStepComplete = (index: number) => {
    if (index >= ADMIN_STEPS.length) return;
    setActiveStep(index);
    // Actualizar estado del ticket según el paso
    updateTicket(ticket.id, { status: ADMIN_STEPS[index].status as TicketStatus });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    // Aquí iría la lógica para guardar comentarios internos
    setComment("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Superior */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {ticket.title}
              <span className="text-xs font-mono text-slate-400 font-normal">#{ticket.id.slice(0, 8)}</span>
            </h1>
            <p className="text-xs text-slate-500">Gestión orgánica de caso</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTransferring(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
          >
            <Icon icon="lucide:user-plus" className="w-4 h-4" />
            Transferir Caso
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase">
              {ticket.assignedTo?.[0] || "?"}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Asignado a</p>
              <p className="text-xs font-bold text-slate-700">{ticket.assignedTo === user?.email ? "Mí (Tú)" : "Otro Agente"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Lado Izquierdo: Información del Ticket */}
        <section className="flex-1 overflow-y-auto p-6 space-y-6 lg:border-r lg:border-slate-200 custom-scrollbar">
          {/* Progress Bar para Admin */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Icon icon="lucide:activity" className="text-indigo-500" />
              Estado del Proceso Interno
            </h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
              {ADMIN_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleStepComplete(idx)}
                  className={`relative z-10 flex flex-col items-center gap-2 group`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-4 ${
                    idx <= activeStep 
                      ? "bg-indigo-600 border-indigo-100 text-white shadow-lg" 
                      : "bg-white border-slate-50 text-slate-300"
                  }`}>
                    <Icon icon={s.icon} className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${idx <= activeStep ? "text-indigo-600" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contenido del Ticket */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-extrabold text-slate-800">Detalles de la Solicitud</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Alumno" value={ticket.createdByName} icon="lucide:user" />
                <InfoItem label="Email" value={ticket.createdBy} icon="lucide:mail" />
                <InfoItem label="Categoría" value={categoryLabels[ticket.category as TicketCategory]} icon="lucide:tag" />
                <InfoItem label="Urgencia" value={urgencyLabels[ticket.urgency]} icon="lucide:alert-triangle" isUrgent={ticket.urgency === 'alto'} />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción</p>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                  {ticket.description}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lado Derecho: Gestión y Comentarios */}
        <aside className="w-full lg:w-96 bg-white overflow-y-auto flex flex-col custom-scrollbar">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Icon icon="lucide:message-square" className="text-indigo-500" />
              Bitácora Interna
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Solo visible para administradores</p>
          </div>

          <div className="flex-1 p-6 space-y-4">
            {/* Lista de comentarios (Mock) */}
            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 mb-1 flex justify-between">
                  Sistema <span>{new Date().toLocaleTimeString()}</span>
                </p>
                <p className="text-xs text-indigo-900/70">Ticket asignado automáticamente a {user?.email}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 mb-1 flex justify-between">
                  Tú <span>10:45 AM</span>
                </p>
                <p className="text-xs text-slate-600">Revisando antecedentes académicos del alumno.</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe una nota interna..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
              />
              <button 
                onClick={handleAddComment}
                className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Icon icon="lucide:send" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Modal de Transferencia */}
      <AnimatePresence>
        {isTransferring && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Transferir Caso</h2>
              <p className="text-slate-500 text-sm mb-6">Selecciona el área o administrador al que deseas delegar este ticket.</p>
              
              <div className="space-y-3 mb-8">
                {["Bienestar Estudiantil", "Coordinación Académica", "Soporte TI"].map((area) => (
                  <button 
                    key={area}
                    onClick={() => {
                      updateTicket(ticket.id, { assignedTo: area });
                      setIsTransferring(false);
                      router.push("/admin/kanban");
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group text-left"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-indigo-600">{area}</span>
                    <Icon icon="lucide:chevron-right" className="text-slate-300 group-hover:text-indigo-500" />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsTransferring(false)}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoItem({ label, value, icon, isUrgent }: { label: string; value: string; icon: string; isUrgent?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100`}>
        <Icon icon={icon} className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className={`text-sm font-bold ${isUrgent ? "text-rose-600" : "text-slate-700"}`}>{value}</p>
      </div>
    </div>
  );
}
