"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  Ticket,
  TicketStatus,
  TicketCategory,
  categoryLabels,
  statusLabels,
  statusColors,
  parseCreatedBy,
} from "@/lib/data";
import { calculateSLAStatus } from "@/lib/sla";
import { staggerContainer, staggerItem } from "@/lib/transitions";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "escalado", label: "Escalado" },
  { value: "resuelto", label: "Resuelto" },
];

export default function TicketListPage() {
  const { tickets, updateTicket, role } = useApp();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<TicketCategory | "all">("all");
  const [sortField, setSortField] = useState<keyof Ticket | "sla">("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  const handleSort = (field: keyof Ticket | "sla") => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const filteredTickets = useMemo(() => {
    const getSortVal = (t: Ticket): string | number => {
      if (sortField === "sla") {
        return calculateSLAStatus(t.slaDeadline).remainingMs;
      }
      if (sortField === "createdAt") {
        return new Date(t.createdAt).getTime();
      }
      const val = t[sortField as keyof Ticket];
      if (typeof val === "string" || typeof val === "number") return val;
      return "";
    };

    return tickets.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.id.toLowerCase().includes(q) &&
          !t.createdByName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const valA = getSortVal(a);
      const valB = getSortVal(b);

      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [tickets, filterStatus, filterCategory, search, sortField, sortDesc]);

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    if (role === "Supervisor") return;
    updateTicket(ticketId, { status: newStatus });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col space-y-6"
    >
      {/* Header & Controls */}
      <motion.div variants={staggerItem} className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Lista de Tickets</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de alta densidad y cambios en línea</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ID, título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1.5 px-2 border-r border-slate-100 shrink-0">
              <Icon icon="lucide:filter" className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "all")}
                className="bg-transparent text-xs font-bold text-slate-600 outline-none uppercase tracking-wide cursor-pointer"
              >
                <option value="all">ESTADO: TODOS</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 px-2 shrink-0">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as TicketCategory | "all")}
                className="bg-transparent text-xs font-bold text-slate-600 outline-none uppercase tracking-wide cursor-pointer"
              >
                <option value="all">CATEGORÍA: TODAS</option>
                {(Object.keys(categoryLabels) as TicketCategory[]).map((c) => (
                  <option key={c} value={c}>{categoryLabels[c].toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Grid */}
      <motion.div variants={staggerItem} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-20" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1">
                    ID {sortField === "id" && <Icon icon={sortDesc ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors min-w-[200px]" onClick={() => handleSort("title")}>
                  <div className="flex items-center gap-1">
                    Asunto {sortField === "title" && <Icon icon={sortDesc ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-44" onClick={() => handleSort("createdByName")}>
                  <div className="flex items-center gap-1">
                    Solicitante {sortField === "createdByName" && <Icon icon={sortDesc ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-4 py-3 w-36 hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-32 hidden md:table-cell" onClick={() => handleSort("sla")}>
                  <div className="flex items-center gap-1">
                    SLA {sortField === "sla" && <Icon icon={sortDesc ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-32 hidden lg:table-cell" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-1">
                    Fecha {sortField === "createdAt" && <Icon icon={sortDesc ? "lucide:chevron-down" : "lucide:chevron-up"} className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-4 py-3 w-16 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredTickets.map((ticket) => {
                const sla = calculateSLAStatus(ticket.slaDeadline);
                const isResolved = ticket.status === "resuelto";
                const student = parseCreatedBy(ticket.createdByName);
                const displayId = ticket.id.length > 8 ? ticket.id.slice(0, 8) : ticket.id;

                return (
                  <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                    {/* ID */}
                    <td className="px-4 py-3">
                      <Link href={`/admin/tickets/${ticket.id}`} className="font-mono text-xs font-bold text-indigo-600 hover:underline">
                        #{displayId}
                      </Link>
                    </td>
                    
                    {/* Asunto */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 line-clamp-1 max-w-[280px] sm:max-w-none">{ticket.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                        {categoryLabels[ticket.category]}
                      </div>
                    </td>

                    {/* Solicitante */}
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-bold truncate max-w-[150px]">{student.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px] font-medium leading-tight mt-0.5">{student.email}</div>
                    </td>

                    {/* Estado (Inline edit) */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {role === "Supervisor" ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${statusColors[ticket.status]}`}>
                          {statusLabels[ticket.status]}
                        </span>
                      ) : (
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                          className={`w-full outline-none text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 rounded-md border appearance-none cursor-pointer transition-colors ${statusColors[ticket.status]}`}
                          style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '12px' }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* SLA */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {isResolved ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                          Completado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md border" style={{ color: sla.color, backgroundColor: `${sla.color}15`, borderColor: `${sla.color}40` }}>
                          {sla.remainingFormatted}
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                      {new Date(ticket.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>

                    {/* Acción */}
                    <td className="px-4 py-3 text-center">
                      <Link 
                        href={`/admin/tickets/${ticket.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Ver detalle"
                      >
                        <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredTickets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center px-4">
              <Icon icon="lucide:search-x" className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No se encontraron tickets</p>
              <p className="text-xs mt-1">Prueba ajustando los filtros de búsqueda o estado.</p>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        {filteredTickets.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <span>Total mostrados: {filteredTickets.length}</span>
            <span>Última actualización: Ahora</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
