// ============================================================
// Intelligent Routing Logic — Auto-assigns tickets by rules
// ============================================================

import { Ticket, TicketCategory, UrgencyLevel, User } from "./data";
import { adminUsers } from "./mock";

interface RoutingRule {
  category?: TicketCategory;
  urgency?: UrgencyLevel;
  assignToRole: string;
  autoEscalate?: boolean;
}

const routingRules: RoutingRule[] = [
  // Critical urgency → always escalate + assign to Admin_TI
  { urgency: "critico", assignToRole: "Admin_TI", autoEscalate: true },
  // Category-based routing
  { category: "academico", assignToRole: "Consejo" },
  { category: "infraestructura", assignToRole: "Admin_TI" },
  { category: "bienestar", assignToRole: "Consejo" },
  { category: "financiero", assignToRole: "Admin_TI" },
  // Fallback
  { category: "otro", assignToRole: "Consejo" },
];

function getAgentsByRole(role: string, agents: User[]): User[] {
  return agents.filter((a) => a.role.toLowerCase() === role.toLowerCase());
}

function getLowestLoadAgent(agents: User[]): User | null {
  if (agents.length === 0) return null;
  return agents.reduce((min, a) => ((a.activeTickets ?? 0) < (min.activeTickets ?? 0) ? a : min));
}

export function routeTicket(
  ticket: Pick<Ticket, "category" | "urgency">,
  agents: User[] = adminUsers
): { assignedTo: string; status: "nuevo" | "escalado"; reason: string } {
  // Find matching rule (priority: urgency rules first, then category)
  const urgencyRule = routingRules.find((r) => r.urgency === ticket.urgency && !r.category);
  const categoryRule = routingRules.find((r) => r.category === ticket.category && !r.urgency);

  // If critical, use urgency rule
  if (urgencyRule && ticket.urgency === "critico") {
    const candidates = getAgentsByRole(urgencyRule.assignToRole, agents);
    const agent = getLowestLoadAgent(candidates) || agents[0];
    return {
      assignedTo: agent?.id || "system",
      status: urgencyRule.autoEscalate ? "escalado" : "nuevo",
      reason: `Urgencia crítica → asignado a ${agent?.name || "Administración"} (${urgencyRule.assignToRole})`,
    };
  }

  // Category-based assignment
  if (categoryRule) {
    const candidates = getAgentsByRole(categoryRule.assignToRole, agents);
    const agent = getLowestLoadAgent(candidates) || agents[0];
    return {
      assignedTo: agent?.id || "system",
      status: "nuevo",
      reason: `Categoría "${ticket.category}" → asignado a ${agent?.name || "Administración"} (${categoryRule.assignToRole})`,
    };
  }

  // Fallback: assign to first available
  return {
    assignedTo: agents[0]?.id || "system",
    status: "nuevo",
    reason: "Sin regla específica → asignado al sistema",
  };
}
