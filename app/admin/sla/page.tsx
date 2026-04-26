"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { categoryLabels, urgencyLabels, TicketCategory, UrgencyLevel } from "@/lib/data";

export default function SLAPage() {
  const { slaConfig } = useApp();

  const grouped = (Object.keys(categoryLabels) as TicketCategory[]).map((cat) => ({
    category: cat,
    configs: slaConfig.filter((s) => s.category === cat).sort((a, b) => {
      const order: UrgencyLevel[] = ["critico", "alto", "medio", "bajo"];
      return order.indexOf(a.urgency) - order.indexOf(b.urgency);
    }),
  }));

  const urgencyColor: Record<UrgencyLevel, string> = {
    critico: "text-status-danger",
    alto: "text-status-danger/70",
    medio: "text-status-warning",
    bajo: "text-status-success",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configuración de SLAs</h1>
        <p className="text-foreground text-sm mt-1">
          Tiempos máximos de respuesta por categoría y nivel de urgencia
        </p>
      </div>

      {grouped.map((group) => (
        <div key={group.category} className="rounded-2xl bg-surface-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-foreground/[0.02]">
            <h3 className="font-semibold text-sm text-foreground">
              {categoryLabels[group.category]}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-foreground text-xs">
                  <th className="text-left px-5 py-3 font-medium">Urgencia</th>
                  <th className="text-left px-5 py-3 font-medium">Tiempo Máximo</th>
                  <th className="text-center px-5 py-3 font-medium">Alerta 50%</th>
                  <th className="text-center px-5 py-3 font-medium">Alerta 75%</th>
                  <th className="text-center px-5 py-3 font-medium">Alerta 90%</th>
                </tr>
              </thead>
              <tbody>
                {group.configs.map((config) => (
                  <tr key={config.id} className="border-t border-border/50 hover:bg-foreground/[0.01] transition">
                    <td className={`px-5 py-3 font-medium ${urgencyColor[config.urgency]}`}>
                      {urgencyLabels[config.urgency]}
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {config.maxHours < 24
                        ? `${config.maxHours} horas`
                        : `${Math.round(config.maxHours / 24)} días (${config.maxHours}h)`}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block w-5 h-5 rounded-md text-xs leading-5 text-center ${config.alertAt50 ? "bg-status-warning/20 text-status-warning" : "bg-foreground text-foreground"}`}>
                        {config.alertAt50 ? "✓" : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block w-5 h-5 rounded-md text-xs leading-5 text-center ${config.alertAt75 ? "bg-status-warning/20 text-status-warning" : "bg-foreground text-foreground"}`}>
                        {config.alertAt75 ? "✓" : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block w-5 h-5 rounded-md text-xs leading-5 text-center ${config.alertAt90 ? "bg-status-danger/20 text-status-danger" : "bg-foreground text-foreground"}`}>
                        {config.alertAt90 ? "✓" : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/15 p-5 text-sm text-foreground">
        <span className="font-medium text-indigo-500-light">💡 Nota:</span> Las alertas se activan
        cuando el tiempo transcurrido alcanza el porcentaje indicado del SLA configurado. Esto permite
        acciones proactivas antes del vencimiento.
      </div>
    </div>
  );
}
