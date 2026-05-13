"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  Ticket, TicketCategory, UrgencyLevel,
  categoryLabels, categoryIcons, urgencyLabels
} from "@/lib/data";
import { calculateSLAStatus, isTicketStale } from "@/lib/sla";

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

export function KanbanCard({ ticket, index, onClick }: { ticket: Ticket; index: number; onClick: () => void }) {
  const { role, agents } = useApp();
  const sla = calculateSLAStatus(ticket.slaDeadline);
  const stale = ticket.status !== "resuelto" && isTicketStale(ticket.updatedAt, 12);
  const agent = agents.find((u) => u.email === ticket.assignedTo);

  return (
    <Draggable draggableId={ticket.id} index={index} isDragDisabled={role === "Supervisor"}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`rounded-2xl border bg-white p-4 mb-3 transition-all duration-200 ${
            role === "Supervisor" ? "cursor-default" : "cursor-pointer"
          } ${
            snapshot.isDragging
              ? `border-indigo-300 shadow-xl scale-[1.02] z-50`
              : `shadow-sm border-slate-100 hover:shadow-md hover:border-indigo-100`
          } ${stale ? "ring-2 ring-amber-400/30" : ""}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-tight ${categoryColors[ticket.category as TicketCategory]}`}>
              <Icon icon={categoryIcons[ticket.category as TicketCategory]} className="w-3.5 h-3.5" />
              {categoryLabels[ticket.category as TicketCategory]}
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${urgencyColors[ticket.urgency as UrgencyLevel]}`}>
              {urgencyLabels[ticket.urgency as UrgencyLevel]}
            </div>
          </div>

          <h4 className="text-sm font-bold leading-tight text-slate-800 mb-2.5 line-clamp-2">
            {(role === "Admin_TI" || role === "Admin TI") && ticket.category === "bienestar" ? "██████ █████ ██████" : ticket.title}
          </h4>

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

          <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px]">
            <div className="flex items-center gap-2">
              {ticket.assignedTo ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-[8px]">
                    {ticket.assignedTo?.[0].toUpperCase()}
                  </div>
                  <span className="text-slate-700 font-bold">{ticket.assignedTo === "Soporte TI" || ticket.assignedTo === "Bienestar Estudiantil" || ticket.assignedTo === "Coordinación Académica" ? ticket.assignedTo : ticket.assignedTo.split("@")[0]}</span>
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
