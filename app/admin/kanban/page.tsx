"use client";

import React, { useState, useCallback, useRef } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Ticket, TicketStatus, TicketCategory,
  categoryLabels, categoryIcons,
} from "@/lib/data";
import { staggerContainer, staggerItem } from "@/lib/transitions";
import { KanbanCard } from "./KanbanCard";

const COLUMNS: { id: TicketStatus; label: string; accent: string; bgColor: string; icon: string }[] = [
  { id: "nuevo", label: "Nuevo", accent: "bg-sky-500", bgColor: "bg-sky-50/50", icon: "lucide:inbox" },
  { id: "pendiente", label: "Pendiente", accent: "bg-indigo-500", bgColor: "bg-indigo-50/50", icon: "lucide:clock" },
  { id: "en_revision", label: "En revisión", accent: "bg-amber-500", bgColor: "bg-amber-50/50", icon: "lucide:eye" },
  { id: "escalado", label: "Escalado", accent: "bg-rose-500", bgColor: "bg-rose-50/50", icon: "lucide:alert-triangle" },
  { id: "resuelto", label: "Resuelto", accent: "bg-emerald-500", bgColor: "bg-emerald-50/50", icon: "lucide:check-circle" },
];

export default function KanbanPage() {
  const { tickets, moveTicket, role } = useApp();
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<TicketCategory | "all">("all");
  const [mobileTab, setMobileTab] = useState<TicketStatus>("nuevo");

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

  const mobileTickets = getColumnTickets(mobileTab);
  const activeCol = COLUMNS.find(c => c.id === mobileTab)!;

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tablero Kanban</h1>
          <p className="text-slate-400 text-sm mt-1">
            {role === "Supervisor" ? "Modo Lectura" : "Gestiona las solicitudes por estado"}
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
              <option value="all">TODAS</option>
              {(Object.keys(categoryLabels) as TicketCategory[]).map((c) => (
                <option key={c} value={c}>{categoryLabels[c].toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* ── MOBILE: Tab-based view ── */}
      <div className="lg:hidden">
        {/* Tab bar with horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 custom-scrollbar -mx-1 px-1">
          {COLUMNS.map((col) => {
            const count = getColumnTickets(col.id).length;
            const isActive = mobileTab === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setMobileTab(col.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide whitespace-nowrap shrink-0 transition-all border ${
                  isActive
                    ? "bg-white text-slate-800 border-slate-200 shadow-sm"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-white/60"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${col.accent}`} />
                {col.label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-slate-100 text-slate-600" : "bg-slate-100/50 text-slate-400"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active column content */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={mobileTab}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[300px] rounded-2xl p-3 transition-colors ${activeCol.bgColor} border border-slate-100 ${
                  snapshot.isDraggingOver ? "bg-indigo-50/30" : ""
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {mobileTickets.map((ticket, i) => (
                    <KanbanCard key={ticket.id} ticket={ticket} index={i} onClick={() => router.push(`/admin/tickets/${ticket.id}`)} />
                  ))}
                </AnimatePresence>
                {provided.placeholder}
                {mobileTickets.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <Icon icon={activeCol.icon} className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-xs font-bold uppercase tracking-widest">Sin tickets en {activeCol.label}</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Quick status move buttons (mobile only) */}
        {mobileTickets.length > 0 && role !== "Supervisor" && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mover selección a:</p>
            <div className="flex flex-wrap gap-2">
              {COLUMNS.filter(c => c.id !== mobileTab).map((col) => (
                <button
                  key={col.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  <div className={`w-2 h-2 rounded-full ${col.accent}`} />
                  {col.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP: Classic board with horizontal scroll ── */}
      <motion.div variants={staggerItem} className="hidden lg:block overflow-x-auto pb-6 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-5 min-w-max pr-4">
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
  return (
    <div className="flex flex-col shrink-0 w-72 xl:w-80">
      <div className={`flex flex-col h-full rounded-2xl ${column.bgColor} border border-slate-100 overflow-hidden`}>
        <div className="px-4 py-4 flex items-center justify-between border-b border-white/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${column.accent} ring-4 ring-white/50`} />
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">{column.label}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/60 text-slate-400 border border-white">
                {tickets.length}
              </span>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
