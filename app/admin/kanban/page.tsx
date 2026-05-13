"use client";

import React, { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  Ticket, TicketStatus, TicketCategory, UrgencyLevel,
  categoryLabels, categoryIcons, urgencyLabels,
  statusLabels
} from "@/lib/data";
import { calculateSLAStatus, isTicketStale } from "@/lib/sla";
import { transitions, staggerContainer, staggerItem } from "@/lib/transitions";

const urgencyColors: Record<UrgencyLevel, string> = {
  bajo: "text-emerald-600 bg-emerald-50 border-emerald-100",
  medio: "text-amber-600 bg-amber-50 border-amber-100",
  alto: "text-rose-500 bg-rose-50 border-rose-100",
  critico: "text-rose-700 bg-rose-100 border-rose-200",
};

const categoryColors: Record<TicketCategory, string> = {
  academico: "bg-indigo-50 text-indigo-700 border-indigo-200",
  infraestructura: "bg-amber-50 text-amber-700 border-amber-200",
  bienestar: "bg-rose-50 text-rose-700 border-rose-200",
  financiero: "bg-emerald-50 text-emerald-700 border-emerald-200",
  otro: "bg-slate-50 text-slate-700 border-slate-200",
};

const COLUMNS: { id: TicketStatus; label: string; accent: string; bgColor: string }[] = [
  { id: "nuevo", label: "Nuevo", accent: "bg-sky-500", bgColor: "bg-sky-50/50" },
  { id: "pendiente", label: "Pendiente", accent: "bg-indigo-500", bgColor: "bg-indigo-50/50" },
  { id: "en_revision", label: "En revisión", accent: "bg-amber-500", bgColor: "bg-amber-50/50" },
  { id: "escalado", label: "Escalado", accent: "bg-rose-500", bgColor: "bg-rose-50/50" },
  { id: "resuelto", label: "Resuelto", accent: "bg-emerald-500", bgColor: "bg-emerald-50/50" },
];

// ---- Kanban Card ----
function KanbanCard({ ticket, index, onClick }: { ticket: Ticket; index: number; onClick: (t: Ticket) => void }) {
  const { role, agents } = useApp();
  const sla = calculateSLAStatus(ticket.slaDeadline);
  const stale = ticket.status !== "resuelto" && isTicketStale(ticket.updatedAt, 12);
  const agent = agents.find((u) => u.id === ticket.assignedTo);

  return (
    <Draggable draggableId={ticket.id} index={index} isDragDisabled={role === "Supervisor"}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(ticket)}
          className={`rounded-2xl border bg-white p-4 mb-3 transition-all duration-200 ${
            role === "Supervisor" ? "cursor-default" : "cursor-pointer"
          } ${
            snapshot.isDragging
              ? `border-indigo-300 shadow-xl scale-[1.02] z-50`
              : `shadow-sm border-slate-100 hover:shadow-md hover:border-indigo-100`
          } ${stale ? "ring-2 ring-amber-400/30" : ""}`}
        >
          {/* Top: category + urgency */}
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-tight ${categoryColors[ticket.category as TicketCategory]}`}>
              <Icon icon={categoryIcons[ticket.category as TicketCategory]} className="w-3.5 h-3.5" />
              {categoryLabels[ticket.category as TicketCategory]}
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${urgencyColors[ticket.urgency as UrgencyLevel]}`}>
              {urgencyLabels[ticket.urgency as UrgencyLevel]}
            </div>
          </div>

          {/* Title */}
          <h4 className="text-sm font-bold leading-tight text-slate-800 mb-2.5 line-clamp-2">
            {(role === "Admin_TI" || role === "Admin TI") && ticket.category === "bienestar" ? "██████ █████ ██████" : ticket.title}
          </h4>

          {/* SLA countdown bar */}
          {ticket.status !== "resuelto" && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(5, sla.level === "expired" ? 100 : sla.level === "danger" ? 85 : sla.level === "warning" ? 60 : 30))}%` }}
                  className="h-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: sla.color }}
                />
              </div>
              <span className="text-[10px] font-bold font-mono tracking-tighter" style={{ color: sla.color }}>
                {sla.remainingFormatted}
              </span>
            </div>
          )}

          {/* Bottom: agent + date */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px]">
            <div className="flex items-center gap-2">
              {agent ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-[8px]">
                    {agent.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-slate-700 font-bold">{agent.name.split(" ")[0]}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-500 font-bold uppercase tracking-wider">
                  <Icon icon="lucide:user-plus" className="w-3 h-3" /> Sin asignar
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-medium uppercase tracking-widest">
              <Icon icon="lucide:calendar" className="w-3 h-3" />
              {new Date(ticket.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ---- Kanban Column ----
function KanbanColumn({
  column,
  tickets,
  onCardClick,
}: {
  column: typeof COLUMNS[0];
  tickets: Ticket[];
  onCardClick: (t: Ticket) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex flex-col shrink-0 transition-all duration-300 ${isCollapsed ? "w-16" : "w-72 lg:w-80"}`}>
      <div className={`flex flex-col h-full rounded-2xl ${column.bgColor} border border-slate-100 overflow-hidden`}>
        {/* Column Header */}
        <div 
          className={`px-4 py-4 flex items-center justify-between cursor-pointer select-none border-b border-white/50`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${column.accent} ring-4 ring-white/50`} />
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">{column.label}</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/60 text-slate-400 border border-white">
                  {tickets.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Droppable area */}
        {!isCollapsed && (
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-3 min-h-[200px] transition-colors custom-scrollbar overflow-y-auto max-h-[calc(100vh-240px)] ${
                  snapshot.isDraggingOver ? "bg-indigo-50/30" : "bg-transparent"
                }`}
              >
                {tickets.map((ticket, i) => (
                  <KanbanCard key={ticket.id} ticket={ticket} index={i} onClick={onCardClick} />
                ))}
                {provided.placeholder}
                {tickets.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-300 opacity-50">
                    <Icon icon="lucide:inbox" className="w-8 h-8 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Sin tickets</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </div>
  );
}

// ---- Kanban Board ----
export default function KanbanPage() {
  const { tickets, moveTicket, role } = useApp();
  const [filterCategory, setFilterCategory] = useState<TicketCategory | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = tickets.filter((t) => {
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  const getColumnTickets = useCallback(
    (status: TicketStatus) => filtered.filter((t) => t.status === status),
    [filtered]
  );

  const onDragEnd = (result: DropResult) => {
    if (role === "Supervisor") return;
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as TicketStatus;
    if (newStatus === result.source.droppableId) return;
    moveTicket(result.draggableId, newStatus);
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tablero Kanban</h1>
          <p className="text-slate-400 text-sm mt-1">
            {role === "Supervisor" ? "Modo Lectura" : "Gestiona el flujo de trabajo de las solicitudes"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
            <Icon icon="lucide:filter" className="w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as TicketCategory | "all")}
              className="bg-transparent text-xs font-bold text-slate-600 outline-none uppercase tracking-wide cursor-pointer"
            >
              <option value="all">TODAS LAS CATEGORÍAS</option>
              {(Object.keys(categoryLabels) as TicketCategory[]).map((c) => (
                <option key={c} value={c}>{categoryLabels[c].toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Board with Horizontal Scroll */}
      <motion.div variants={staggerItem} className="flex-1 min-h-0 overflow-x-auto pb-6 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full min-w-max pr-6">
            {COLUMNS.map((col) => (
              <KanbanColumn 
                key={col.id} 
                column={col} 
                tickets={getColumnTickets(col.id)} 
                onCardClick={setSelectedTicket} 
              />
            ))}
          </div>
        </DragDropContext>
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setSelectedTicket(null)} 
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={transitions.spring}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[60] shadow-2xl flex flex-col border-l border-slate-100"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h2 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Detalle del Ticket</h2>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 transition"
                >
                  <Icon icon="lucide:x" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${categoryColors[selectedTicket.category as TicketCategory]}`}>
                    {categoryLabels[selectedTicket.category as TicketCategory]}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${urgencyColors[selectedTicket.urgency as UrgencyLevel]}`}>
                    {urgencyLabels[selectedTicket.urgency as UrgencyLevel]}
                  </span>
                </div>
                
                <h3 className="text-2xl font-extrabold text-slate-800 mb-6 leading-tight tracking-tight">
                  {(role === "Admin_TI" || role === "Admin TI") && selectedTicket.category === "bienestar" ? "██████ █████ ██████" : selectedTicket.title}
                </h3>
                
                {(role === "Admin_TI" || role === "Admin TI") && selectedTicket.category === "bienestar" ? (
                  <div className="bg-rose-50 text-rose-700 p-5 rounded-2xl border border-rose-100 mb-8 flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-extrabold uppercase text-[10px] tracking-widest">
                      <Icon icon="lucide:shield-alert" className="w-4 h-4" />
                      Privacidad Estricta (Ley 21.719)
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      El contenido de esta solicitud contiene datos sensibles. Su perfil técnico no permite la visualización de este caso para proteger la privacidad del estudiante.
                    </p>
                  </div>
                ) : (
                  <div className="mb-10">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Descripción</h4>
                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                      {selectedTicket.description}
                    </p>
                  </div>
                )}

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Información del Alumno</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Nombre", value: selectedTicket.createdByName },
                        { label: "Email", value: selectedTicket.createdBy },
                        { label: "Escuela", value: selectedTicket.school || "—" },
                        { label: "Carrera", value: selectedTicket.career || "—" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-white border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-colors uppercase tracking-widest text-xs"
                >
                  Cerrar Detalle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
