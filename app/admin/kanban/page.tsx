"use client";

import React, { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Icon } from "@iconify/react";
import { useApp } from "@/context/AppContext";
import {
  Ticket, TicketStatus, TicketCategory, UrgencyLevel,
  categoryLabels, categoryIcons, urgencyLabels,
  statusLabels, statusColors
} from "@/lib/data";
import { calculateSLAStatus, isTicketStale } from "@/lib/sla";

const urgencyColors: Record<UrgencyLevel, string> = {
  bajo: "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded",
  medio: "text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded",
  alto: "text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded",
  critico: "text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse-soft",
};

const categoryColors: Record<TicketCategory, string> = {
  academico: "bg-blue-50 text-blue-700 border-blue-200",
  infraestructura: "bg-orange-50 text-orange-700 border-orange-200",
  bienestar: "bg-rose-50 text-rose-700 border-rose-200",
  financiero: "bg-emerald-50 text-emerald-700 border-emerald-200",
  otro: "bg-slate-50 text-slate-700 border-slate-200",
};

const COLUMNS: { id: TicketStatus; label: string; accent: string }[] = [
  { id: "nuevo", label: "Nuevo", accent: "bg-sky-500" },
  { id: "pendiente", label: "Pendiente", accent: "bg-indigo-500" },
  { id: "en_revision", label: "En revisión", accent: "bg-status-warning" },
  { id: "escalado", label: "Escalado", accent: "bg-status-danger" },
  { id: "resuelto", label: "Resuelto", accent: "bg-status-success" },
];

// ---- Kanban Card ----
function KanbanCard({ ticket, index, onClick }: { ticket: Ticket; index: number; onClick: (t: Ticket) => void }) {
  const { role, agents } = useApp();
  const sla = calculateSLAStatus(ticket.slaDeadline);
  const stale = ticket.status !== "resuelto" && isTicketStale(ticket.updatedAt, 12);
  const agent = agents.find((u) => u.id === ticket.assignedTo);

  const column = COLUMNS.find(c => c.id === ticket.status);

  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(ticket)}
          className={`rounded-xl border bg-white p-4 mb-3 transition-all duration-200 cursor-pointer ${
            snapshot.isDragging
              ? `kanban-card-dragging border-slate-300 shadow-lg`
              : `shadow-sm border-slate-200 hover:shadow-md hover:border-slate-300`
          } ${stale ? "ring-2 ring-amber-400/40" : ""}`}
        >
          {/* Stale alert */}
          {stale && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-bold mb-3 animate-pulse-soft">
              <Icon icon="lucide:clock" className="w-3.5 h-3.5" /> Ticket estancado — sin actividad
            </div>
          )}

          {/* RBAC Masking */}
          {role === "Admin_TI" && ticket.category === "bienestar" && (
            <div className="flex items-center gap-1 bg-status-danger/10 text-status-danger px-2 py-1 rounded border border-status-danger/20 mb-2">
              <Icon icon="lucide:shield-alert" className="w-3 h-3 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Dato Sensible Protegido por Ley 21.719</span>
            </div>
          )}

          {/* Top: category + urgency */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-slate-500">
              <Icon icon={categoryIcons[ticket.category as TicketCategory]} className="w-4 h-4 opacity-70" />
              <span className="text-[10px] font-semibold uppercase tracking-tight">
                {categoryLabels[ticket.category as TicketCategory]}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold ${urgencyColors[ticket.urgency as UrgencyLevel]}`}>
                {urgencyLabels[ticket.urgency as UrgencyLevel]}
              </span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold leading-snug text-slate-900 mb-2 line-clamp-2">
            {role === "Admin_TI" && ticket.category === "bienestar" ? "██████ █████ ██████" : ticket.title}
          </h4>

          {/* Subtasks (Mock for "en_revision") */}
          {ticket.status === "en_revision" && (
            <div className="mb-3">
              <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 mb-1">
                <span>Subtareas WIP</span>
                <span>2/4</span>
              </div>
              <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: "50%" }} />
              </div>
            </div>
          )}

          {/* SLA countdown */}
          {ticket.status !== "resuelto" && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(5, sla.level === "expired" ? 100 : sla.level === "danger" ? 85 : sla.level === "warning" ? 60 : 30))}%`,
                    backgroundColor: sla.color,
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-mono font-medium shrink-0 ${
                  sla.level === "expired" ? "animate-blink-danger" : ""
                }`}
                style={{ color: sla.color }}
              >
                {sla.remainingFormatted}
              </span>
            </div>
          )}

          {/* Bottom: agent + date */}
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              {agent ? (
                <>
                  <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-700">
                    {agent.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-slate-900 font-medium">{agent.name.split(" ")[0]}</span>
                </>
              ) : (
                <span className="text-status-warning">Sin asignar</span>
              )}
            </div>
            <span>{new Date(ticket.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}</span>
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
  const isOverWipLimit = column.id === "en_revision" && tickets.length > 5;
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col w-full bg-slate-50 rounded-2xl shadow-sm border border-border">
      {/* Column Header */}
      <div 
        className={`rounded-t-2xl bg-slate-100/80 px-4 py-3 flex items-center justify-between transition-colors cursor-pointer select-none`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-6 rounded-full ${isOverWipLimit ? "bg-status-danger animate-pulse-soft" : column.accent}`} />
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm ${isOverWipLimit ? "text-status-danger" : "text-slate-700"}`}>{column.label}</h3>
            <span className="text-[10px] font-bold text-slate-400">
              {tickets.length} {column.id === "en_revision" ? "/ 5" : ""}
            </span>
          </div>
        </div>
        <button className="text-black/40 hover:text-black transition-colors">
          <Icon icon={isCollapsed ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-5 h-5" />
        </button>
      </div>

      {/* Droppable area */}
      <div className={`${isCollapsed ? "hidden" : "block"}`}>
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 p-3 rounded-b-2xl min-h-[150px] transition-colors custom-scrollbar overflow-y-auto max-h-[calc(100vh-220px)] ${
                snapshot.isDraggingOver
                  ? "bg-slate-200/50"
                  : "bg-transparent"
              }`}
            >
              {tickets.map((ticket, i) => (
                <KanbanCard key={ticket.id} ticket={ticket} index={i} onClick={onCardClick} />
              ))}
              {provided.placeholder}
              {tickets.length === 0 && (
                <div className="flex items-center justify-center h-24 text-black/40 text-sm italic">
                  Sin tickets
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}

// ---- Kanban Board ----
export default function KanbanPage() {
  const { tickets, moveTicket, role } = useApp();
  const [filterCategory, setFilterCategory] = useState<TicketCategory | "all">("all");
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = tickets.filter((t) => {
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (filterUrgency !== "all" && t.urgency !== filterUrgency) return false;
    return true;
  });

  const getColumnTickets = useCallback(
    (status: TicketStatus) => filtered.filter((t) => t.status === status),
    [filtered]
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as TicketStatus;
    if (newStatus === result.source.droppableId) return;
    moveTicket(result.draggableId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tablero Kanban</h1>
          <p className="text-foreground text-sm mt-1">Arrastra las tarjetas para cambiar el estado</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as TicketCategory | "all")}
            className="bg-surface-card border border-border text-sm rounded-xl px-3 py-2 text-foreground outline-none focus:border-indigo-500/50"
          >
            <option value="all">Todas las categorías</option>
            {(Object.keys(categoryLabels) as TicketCategory[]).map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as UrgencyLevel | "all")}
            className="bg-surface-card border border-border text-sm rounded-xl px-3 py-2 text-foreground outline-none focus:border-indigo-500/50"
          >
            <option value="all">Todas las urgencias</option>
            {(Object.keys(urgencyLabels) as UrgencyLevel[]).map((u) => (
              <option key={u} value={u}>{urgencyLabels[u]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          
          {/* Col 1: Nuevo -> Escalado */}
          <div className="flex flex-col gap-6">
            <KanbanColumn column={COLUMNS.find(c => c.id === "nuevo")!} tickets={getColumnTickets("nuevo")} onCardClick={setSelectedTicket} />
            <KanbanColumn column={COLUMNS.find(c => c.id === "escalado")!} tickets={getColumnTickets("escalado")} onCardClick={setSelectedTicket} />
          </div>

          {/* Col 2: Pendiente -> Resuelto */}
          <div className="flex flex-col gap-6">
            <KanbanColumn column={COLUMNS.find(c => c.id === "pendiente")!} tickets={getColumnTickets("pendiente")} onCardClick={setSelectedTicket} />
            <KanbanColumn column={COLUMNS.find(c => c.id === "resuelto")!} tickets={getColumnTickets("resuelto")} onCardClick={setSelectedTicket} />
          </div>

          {/* Col 3: En Revision (Full height) */}
          <div className="flex flex-col gap-6">
            <KanbanColumn column={COLUMNS.find(c => c.id === "en_revision")!} tickets={getColumnTickets("en_revision")} onCardClick={setSelectedTicket} />
          </div>

        </div>
      </DragDropContext>

      {/* Progressive Disclosure Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" onClick={() => setSelectedTicket(null)} />
          <div className="relative w-full max-w-md bg-surface-card border-l border-border h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <h2 className="font-bold text-lg">Detalle del Ticket</h2>
              <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-foreground/5 text-foreground/50 transition">
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${categoryColors[selectedTicket.category as TicketCategory]}`}>
                  {categoryLabels[selectedTicket.category as TicketCategory]}
                </span>
                <span className={`text-xs font-bold ${urgencyColors[selectedTicket.urgency as UrgencyLevel]}`}>
                  {urgencyLabels[selectedTicket.urgency as UrgencyLevel]}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-4">
                {role === "Admin_TI" && selectedTicket.category === "bienestar" ? "██████ █████ ██████" : selectedTicket.title}
              </h3>
              
              {role === "Admin_TI" && selectedTicket.category === "bienestar" ? (
                <div className="bg-status-danger/10 text-status-danger p-4 rounded-xl border border-status-danger/20 mb-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider">
                    <Icon icon="lucide:shield-alert" className="w-4 h-4" />
                    Dato Sensible Protegido
                  </div>
                  <p className="text-sm">
                    El contenido de esta solicitud contiene datos clínicos o psicológicos protegidos por la Ley N° 21.719. Su rol técnico (Administrador TI) no posee los privilegios necesarios para visualizar esta información. Contacte a un Consejero Asignado para más detalles.
                  </p>
                </div>
              ) : (
                <p className="text-foreground/70 text-sm leading-relaxed mb-8">
                  {selectedTicket.description}
                </p>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3 border-b border-border pb-2">Información del Solicitante</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="text-foreground/50 w-20 inline-block">Nombre:</span> {selectedTicket.createdByName}</p>
                    <p><span className="text-foreground/50 w-20 inline-block">Email:</span> {selectedTicket.createdBy}</p>
                    <p><span className="text-foreground/50 w-20 inline-block">Fecha:</span> {new Date(selectedTicket.createdAt).toLocaleString("es-CL")}</p>
                  </div>
                </div>

                {selectedTicket.status === "en_revision" && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3 border-b border-border pb-2">Subtareas (WIP)</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-1" />
                        <span>Verificar antecedentes del alumno en el portal académico</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-1" />
                        <span>Solicitar validación al director de carrera</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="mt-1" />
                        <span>Emitir certificado con firma electrónica</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="mt-1" />
                        <span>Notificar resolución al estudiante vía correo</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
