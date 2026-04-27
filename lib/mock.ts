import { Ticket, AuditEntry, Survey, SLAConfig, User } from "./data";

export const councilMembers: User[] = [
  {
    id: "u1",
    name: "Valentina Rojas",
    email: "vrojas@duoc.cl",
    role: "Consejo",
    avatar: "/avatars/valentina.svg",
    department: "Académico",
    activeTickets: 0,
  }
];

export const adminUsers: User[] = [
  ...councilMembers,
  {
    id: "u4",
    name: "Admin Portal",
    email: "admin@duoc.cl",
    role: "Admin_TI",
    avatar: "/avatars/admin.svg",
    department: "Sistemas",
    activeTickets: 0,
  },
];

export const mockTickets: Ticket[] = [];
export const mockAuditEntries: AuditEntry[] = [];
export const mockSurveys: Survey[] = [];

export const mockSLAConfig: SLAConfig[] = [
  { id: "sla1", category: "academico", urgency: "critico", maxHours: 4, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla2", category: "infraestructura", urgency: "alto", maxHours: 12, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla3", category: "bienestar", urgency: "critico", maxHours: 2, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla4", category: "financiero", urgency: "medio", maxHours: 48, alertAt50: false, alertAt75: true, alertAt90: true },
  { id: "sla5", category: "otro", urgency: "bajo", maxHours: 120, alertAt50: false, alertAt75: false, alertAt90: true },
];
