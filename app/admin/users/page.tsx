"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function UsersPage() {
  const { agents, tickets } = useApp();

  // Calculate actual workload
  const getWorkload = (agentId: string) => {
    return tickets.filter((t) => t.assignedTo === agentId && t.status !== "resuelto").length;
  };

  const roleLabels: Record<string, string> = {
    consejero: "Consejera de Carrera",
    trabajador: "Trabajador de Duoc",
    directora: "Directora de Sede",
    admin: "Administrador",
  };

  const roleColors: Record<string, string> = {
    consejero: "bg-indigo-600/15 text-indigo-600 border-indigo-600/30",
    trabajador: "bg-status-warning/15 text-status-warning border-status-warning/30",
    directora: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
    admin: "bg-foreground text-foreground border-foreground",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-foreground text-sm mt-1">Agentes administrativos y su carga de trabajo</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const workload = getWorkload(agent.id);
          const maxWorkload = 10;
          const loadPercent = Math.min(100, (workload / maxWorkload) * 100);

          return (
            <div
              key={agent.id}
              className="rounded-2xl bg-surface-card border border-border p-6 hover:border-foreground transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-indigo-600/25 flex items-center justify-center text-2xl shrink-0">
                  {agent.role === "consejero" ? "👩‍🎓" : agent.role === "trabajador" ? "👨‍💼" : agent.role === "directora" ? "👩‍💼" : "🛡️"}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-base">{agent.name}</h3>
                  <p className="text-xs text-foreground mt-0.5">{agent.email}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${roleColors[agent.role]}`}>
                      {roleLabels[agent.role]}
                    </span>
                    {agent.department && (
                      <span className="text-[10px] text-foreground">{agent.department}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Workload bar */}
              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-foreground">Carga de trabajo</span>
                  <span className={`font-medium ${loadPercent > 80 ? "text-status-danger" : loadPercent > 50 ? "text-status-warning" : "text-status-success"}`}>
                    {workload} tickets activos
                  </span>
                </div>
                <div className="h-2 rounded-full bg-foreground overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      loadPercent > 80 ? "bg-status-danger" : loadPercent > 50 ? "bg-status-warning" : "bg-status-success"
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
