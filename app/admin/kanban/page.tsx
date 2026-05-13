"use client";

import React, { useState, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Ticket, TicketStatus, TicketCategory, UrgencyLevel,
  categoryLabels, categoryIcons, urgencyLabels,
} from "@/lib/data";
import { calculateSLAStatus, isTicketStale } from "@/lib/sla";
import { transitions, staggerContainer, staggerItem } from "@/lib/transitions";
import { KanbanCard } from "./KanbanCard"; // Extraemos a componente para limpiar

const COLUMNS: { id: TicketStatus; label: string; accent: string; bgColor: string }[] = [
  { id: "nuevo", label: "Nuevo", accent: "bg-sky-500", bgColor: "bg-sky-50/50" },
  { id: "pendiente", label: "Pendiente", accent: "bg-indigo-500", bgColor: "bg-indigo-50/50" },
  { id: "en_revision", label: "En revisión", accent: "bg-amber-500", bgColor: "bg-amber-50/50" },
  { id: "escalado", label: "Escalado", accent: "bg-rose-500", bgColor: "bg-rose-50/50" },
  { id: "resuelto", label: "Resuelto", accent: "bg-emerald-500", bgColor: "bg-emerald-50/50" },
];

export default function KanbanPage() {
  const { tickets, moveTicket, role } = useApp();
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<TicketCategory | "all">("all");

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
            {role === "Supervisor" ? "Modo Lectura" : "Haz clic en un ticket para iniciar la gestión orgánica"}
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
                onCardClick={(t) => router.push(`/admin/tickets/${t.id}`)} 
              />
            ))}
          </div>
        </DragDropContext>
      </motion.div>
    </motion.div>
  );
}

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
                  <KanbanCard key={ticket.id} ticket={ticket} index={i} onClick={() => onCardClick(ticket)} />
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
