// ============================================================
// SLA Calculation Utilities
// ============================================================

import { SLAConfig, TicketCategory, UrgencyLevel } from "./data";
import { mockSLAConfig } from "./mock";

export interface SLAStatus {
  remainingMs: number;
  remainingFormatted: string;
  percentUsed: number;
  level: "ok" | "warning" | "danger" | "expired";
  color: string;
  bgColor: string;
}

export function getSLAConfig(category: TicketCategory, urgency: UrgencyLevel, configs: SLAConfig[] = mockSLAConfig): SLAConfig | undefined {
  return configs.find((c) => c.category === category && c.urgency === urgency);
}

export function calculateSLAStatus(slaDeadline: string): SLAStatus {
  const now = Date.now();
  const deadline = new Date(slaDeadline).getTime();
  const remainingMs = deadline - now;

  // Calculate total SLA window (we estimate from remaining)
  const totalMs = Math.abs(remainingMs) + Math.abs(remainingMs); // approximation for display
  const percentUsed = remainingMs <= 0 ? 100 : Math.max(0, Math.min(100, ((1 - remainingMs / (remainingMs * 2)) * 100)));

  let level: SLAStatus["level"];
  let color: string;
  let bgColor: string;

  if (remainingMs <= 0) {
    level = "expired";
    color = "#F24B4B";
    bgColor = "rgba(242, 75, 75, 0.15)";
  } else if (remainingMs < 3600000) { // < 1 hour
    level = "danger";
    color = "#F24B4B";
    bgColor = "rgba(242, 75, 75, 0.1)";
  } else if (remainingMs < 14400000) { // < 4 hours
    level = "warning";
    color = "#F2A81D";
    bgColor = "rgba(242, 168, 29, 0.1)";
  } else {
    level = "ok";
    color = "#B7D984";
    bgColor = "rgba(183, 217, 132, 0.1)";
  }

  return {
    remainingMs,
    remainingFormatted: formatTimeRemaining(remainingMs),
    percentUsed: Math.min(100, Math.max(0, percentUsed)),
    level,
    color,
    bgColor,
  };
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) {
    const overMs = Math.abs(ms);
    if (overMs < 3600000) return `Vencido hace ${Math.floor(overMs / 60000)}m`;
    if (overMs < 86400000) return `Vencido hace ${Math.floor(overMs / 3600000)}h`;
    return `Vencido hace ${Math.floor(overMs / 86400000)}d`;
  }
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m restantes`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m restantes`;
  return `${Math.floor(ms / 86400000)}d ${Math.floor((ms % 86400000) / 3600000)}h restantes`;
}

export function isTicketStale(updatedAt: string, staleThresholdHours: number = 24): boolean {
  const lastUpdate = new Date(updatedAt).getTime();
  const now = Date.now();
  return (now - lastUpdate) > (staleThresholdHours * 3600000);
}
