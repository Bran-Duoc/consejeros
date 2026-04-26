// ============================================================
// Intelligent Routing Logic — Auto-assigns tickets by rules
// ============================================================

import { Ticket, TicketCategory, UrgencyLevel, User, adminUsers } from "./data";

interface RoutingRule {
  category?: TicketCategory;
  urgency?: UrgencyLevel;
  assignToRole: string;
  autoEscalate?: boolean;
}

const routingRules: RoutingRule[] = [
  // Critical urgency → always escalate + assign to lowest-load agent
  { urgency: "critico", assignToRole: "directora", autoEscalate: true },
  // Category-based routing
  { category: "academico", assignToRole: "consejero" },
  { category: "infraestructura", assignToRole: "trabajador" },
  { category: "bienestar", assignToRole: "directora" },
  { category: "financiero", assignToRole: "directora" },
  // Fallback
  { category: "otro", assignToRole: "consejero" },
];

function getAgentsByRole(role: string, agents: User[]): User[] {
  return agents.filter((a) => a.role === role);
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
      assignedTo: agent.id,
      status: urgencyRule.autoEscalate ? "escalado" : "nuevo",
      reason: `Urgencia crítica → asignado a ${agent.name} (${urgencyRule.assignToRole}) con menor carga`,
    };
  }

  // Category-based assignment
  if (categoryRule) {
    const candidates = getAgentsByRole(categoryRule.assignToRole, agents);
    const agent = getLowestLoadAgent(candidates) || agents[0];
    return {
      assignedTo: agent.id,
      status: "nuevo",
      reason: `Categoría "${ticket.category}" → asignado a ${agent.name} (${categoryRule.assignToRole})`,
    };
  }

  // Fallback: assign to first available
  return {
    assignedTo: agents[0]?.id || "u1",
    status: "nuevo",
    reason: "Sin regla específica → asignado al primer agente disponible",
  };
}
