// ============================================================
// Audit Trail Functions
// ============================================================

import { AuditEntry, generateId } from "./data";

export function createAuditEntry(
  ticketId: string,
  userId: string,
  userName: string,
  action: string,
  options?: {
    previousState?: string;
    newState?: string;
    metadata?: string;
  }
): AuditEntry {
  return {
    id: generateId(),
    ticketId,
    userId,
    userName,
    action,
    previousState: options?.previousState,
    newState: options?.newState,
    metadata: options?.metadata,
    timestamp: new Date().toISOString(),
  };
}

export function logStatusChange(
  ticketId: string,
  userId: string,
  userName: string,
  previousStatus: string,
  newStatus: string
): AuditEntry {
  return createAuditEntry(ticketId, userId, userName, "Cambio de estado", {
    previousState: previousStatus,
    newState: newStatus,
  });
}

export function logAssignment(
  ticketId: string,
  assignedToName: string,
  reason: string
): AuditEntry {
  return createAuditEntry(ticketId, null as any, "Sistema", "Asignación automática", {
    newState: assignedToName,
    metadata: reason,
  });
}

export function logTicketView(
  ticketId: string,
  userId: string,
  userName: string
): AuditEntry {
  return createAuditEntry(ticketId, userId, userName, "Ticket visualizado");
}

export function logTicketCreation(ticketId: string): AuditEntry {
  return createAuditEntry(ticketId, null as any, "Sistema", "Ticket creado");
}

export function formatAuditAction(entry: AuditEntry): string {
  let text = entry.action;
  if (entry.previousState && entry.newState) {
    text += `: ${entry.previousState} → ${entry.newState}`;
  } else if (entry.newState) {
    text += `: ${entry.newState}`;
  }
  if (entry.metadata) {
    text += ` (${entry.metadata})`;
  }
  return text;
}
