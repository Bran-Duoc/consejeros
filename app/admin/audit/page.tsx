"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { formatAuditAction } from "@/lib/audit";
import { AuditEntry } from "@/lib/data";

const actionIcons: Record<string, string> = {
  "Ticket creado": "🆕",
  "Cambio de estado": "🔄",
  "Asignación automática": "🤖",
  "Escalado automático": "🚨",
  "Ticket visualizado": "👁️",
};

export default function AuditPage() {
  const { audit, tickets } = useApp();
  const [filterTicket, setFilterTicket] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const sorted = useMemo(() => {
    return [...audit]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter((entry) => {
        if (filterTicket && !entry.ticketId.includes(filterTicket)) return false;
        if (filterAction !== "all" && !entry.action.includes(filterAction)) return false;
        return true;
      });
  }, [audit, filterTicket, filterAction]);

  const uniqueActions = [...new Set(audit.map((a) => a.action))];

  const getTicketTitle = (ticketId: string) => {
    return tickets.find((t) => t.id === ticketId)?.title || ticketId;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Registro de Auditoría</h1>
        <p className="text-foreground text-sm mt-1">
          Trazabilidad completa — cada acción queda registrada
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={filterTicket}
          onChange={(e) => setFilterTicket(e.target.value)}
          placeholder="Filtrar por ID de ticket..."
          className="bg-surface-card border border-border text-sm rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-indigo-500/50 w-64"
        />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-surface-card border border-border text-sm rounded-xl px-3 py-2.5 text-foreground outline-none focus:border-indigo-500/50"
        >
          <option value="all">Todas las acciones</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <div className="ml-auto text-sm text-foreground self-center">
          {sorted.length} registros
        </div>
      </div>

      {/* Audit log */}
      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-foreground">
            <div className="text-4xl mb-2">📜</div>
            Sin registros de auditoría
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto custom-scrollbar">
            {sorted.map((entry) => (
              <div key={entry.id} className="px-5 py-4 hover:bg-foreground/[0.01] transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">
                    {actionIcons[entry.action] || "📝"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{formatAuditAction(entry)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground">
                      <span>👤 {entry.userName}</span>
                      <span>•</span>
                      <span className="font-mono truncate max-w-[200px]" title={getTicketTitle(entry.ticketId)}>
                        📋 {getTicketTitle(entry.ticketId).slice(0, 40)}
                      </span>
                      <span>•</span>
                      <span>{new Date(entry.timestamp).toLocaleString("es-CL")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-indigo-600/5 border border-indigo-600/15 p-5 text-sm text-foreground">
        <span className="font-medium text-indigo-600">📋 Cumplimiento Normativo:</span> Todos los registros
        incluyen timestamp, usuario, acción y estados previo/posterior. Este log es inmutable y puede
        exportarse para auditorías formales.
      </div>
    </div>
  );
}
