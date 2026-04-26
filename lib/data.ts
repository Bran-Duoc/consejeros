// ============================================================
// Types & Mock Data for Portal Hub del Consejo de Sede
// ============================================================

export type TicketStatus = "nuevo" | "pendiente" | "en_revision" | "escalado" | "resuelto";
export type TicketCategory = "academico" | "infraestructura" | "bienestar" | "financiero" | "otro";
export type UrgencyLevel = "bajo" | "medio" | "alto" | "critico";
export type UserRole = "estudiante" | "consejero" | "trabajador" | "directora" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  activeTickets?: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  urgency: UrgencyLevel;
  status: TicketStatus;
  assignedTo: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  attachments?: string[];
  tags?: string[];
}

export interface AuditEntry {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  action: string;
  previousState?: string;
  newState?: string;
  metadata?: string;
  timestamp: string;
}


export interface SLAConfig {
  id: string;
  category: TicketCategory;
  urgency: UrgencyLevel;
  maxHours: number;
  alertAt50: boolean;
  alertAt75: boolean;
  alertAt90: boolean;
}

export interface Survey {
  id: string;
  ticketId: string;
  userId: string;
  csat: number; // 1-5
  ces: number;  // 1-7
  comment?: string;
  createdAt: string;
}


// ---- Council Members ----
export const councilMembers: User[] = [
  {
    id: "u1",
    name: "Valentina Rojas",
    email: "vrojas@duoc.cl",
    role: "consejero",
    avatar: "/avatars/valentina.svg",
    department: "Académico",
    activeTickets: 5,
  },
  {
    id: "u2",
    name: "Matías Sepúlveda",
    email: "msepulveda@duoc.cl",
    role: "trabajador",
    avatar: "/avatars/matias.svg",
    department: "Infraestructura",
    activeTickets: 3,
  },
  {
    id: "u3",
    name: "Carolina Muñoz",
    email: "cmunoz@duoc.cl",
    role: "directora",
    avatar: "/avatars/carolina.svg",
    department: "Dirección",
    activeTickets: 2,
  },
];

// ---- Admin Users (all agents) ----
export const adminUsers: User[] = [
  ...councilMembers,
  {
    id: "u4",
    name: "Admin Portal",
    email: "admin@duoc.cl",
    role: "admin",
    avatar: "/avatars/admin.svg",
    department: "Sistemas",
    activeTickets: 0,
  },
];

// ---- Helper: generate ID ----
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ---- Helper: time helpers ----
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}
function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600000).toISOString();
}

// ---- Mock Tickets ----
export const mockTickets: Ticket[] = [
  {
    id: "t1",
    title: "Problema con inscripción de ramos",
    description: "No puedo inscribir el ramo de Programación Avanzada, el sistema indica que hay un bloqueo académico pero mis notas están al día.",
    category: "academico",
    urgency: "alto",
    status: "nuevo",
    assignedTo: "u1",
    createdBy: "est1",
    createdByName: "Diego Fernández",
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    slaDeadline: hoursFromNow(6),
  },
  {
    id: "t2",
    title: "Goteras en sala B-204",
    description: "Hay filtraciones de agua en el cielo de la sala B-204, afectando las clases cuando llueve.",
    category: "infraestructura",
    urgency: "medio",
    status: "pendiente",
    assignedTo: "u2",
    createdBy: "est2",
    createdByName: "Javiera Morales",
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(6),
    slaDeadline: hoursFromNow(30),
  },
  {
    id: "t3",
    title: "Solicitud de beca de alimentación",
    description: "Necesito postular a la beca de alimentación para el segundo semestre. No encuentro el formulario en el portal.",
    category: "financiero",
    urgency: "medio",
    status: "en_revision",
    assignedTo: "u3",
    createdBy: "est3",
    createdByName: "Camila Soto",
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(12),
    slaDeadline: hoursFromNow(24),
  },
  {
    id: "t4",
    title: "Acceso a laboratorio fuera de horario",
    description: "Necesito acceso al laboratorio de redes los sábados para preparar mi proyecto de título.",
    category: "infraestructura",
    urgency: "bajo",
    status: "en_revision",
    assignedTo: "u2",
    createdBy: "est4",
    createdByName: "Sebastián Garrido",
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(24),
    slaDeadline: hoursFromNow(48),
  },
  {
    id: "t5",
    title: "Atención psicológica urgente",
    description: "Un compañero de carrera necesita atención psicológica urgente. ¿Cómo acceder al servicio de bienestar?",
    category: "bienestar",
    urgency: "critico",
    status: "escalado",
    assignedTo: "u3",
    createdBy: "est5",
    createdByName: "María Paz López",
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(0.5),
    slaDeadline: hoursFromNow(3),
  },
  {
    id: "t6",
    title: "Error en notas del semestre anterior",
    description: "Mis notas del ramo Bases de Datos aparecen con un promedio incorrecto. El profesor confirmó que hay un error en el sistema.",
    category: "academico",
    urgency: "alto",
    status: "pendiente",
    assignedTo: "u1",
    createdBy: "est6",
    createdByName: "Tomás Herrera",
    createdAt: hoursAgo(24),
    updatedAt: hoursAgo(12),
    slaDeadline: hoursFromNow(4),
  },
  {
    id: "t7",
    title: "WiFi inestable en biblioteca",
    description: "La conexión WiFi en la biblioteca se cae constantemente, impidiendo trabajar en proyectos online.",
    category: "infraestructura",
    urgency: "medio",
    status: "resuelto",
    assignedTo: "u2",
    createdBy: "est7",
    createdByName: "Francisca Vega",
    createdAt: hoursAgo(120),
    updatedAt: hoursAgo(48),
    slaDeadline: hoursAgo(24),
  },
  {
    id: "t8",
    title: "Solicitud de certificado de alumno regular",
    description: "Necesito un certificado de alumno regular para presentar en mi trabajo. ¿Dónde lo solicito?",
    category: "academico",
    urgency: "bajo",
    status: "resuelto",
    assignedTo: "u1",
    createdBy: "est8",
    createdByName: "Andrés Muñoz",
    createdAt: hoursAgo(168),
    updatedAt: hoursAgo(96),
    slaDeadline: hoursAgo(72),
  },
  {
    id: "t9",
    title: "Microondas dañados en casino",
    description: "3 de los 5 microondas del casino están fuera de servicio. Es urgente repararlos.",
    category: "infraestructura",
    urgency: "alto",
    status: "nuevo",
    assignedTo: null,
    createdBy: "est9",
    createdByName: "Isabella Torres",
    createdAt: hoursAgo(0.5),
    updatedAt: hoursAgo(0.5),
    slaDeadline: hoursFromNow(8),
  },
  {
    id: "t10",
    title: "Consulta sobre convalidación de ramos",
    description: "Me cambié de carrera y quiero saber qué ramos puedo convalidar.",
    category: "academico",
    urgency: "bajo",
    status: "pendiente",
    assignedTo: "u1",
    createdBy: "est10",
    createdByName: "Martín Castillo",
    createdAt: hoursAgo(36),
    updatedAt: hoursAgo(20),
    slaDeadline: hoursFromNow(60),
  },
];

// ---- Mock Audit Trail ----
export const mockAuditEntries: AuditEntry[] = [
  { id: "a1", ticketId: "t1", userId: "system", userName: "Sistema", action: "Ticket creado", timestamp: hoursAgo(2) },
  { id: "a2", ticketId: "t1", userId: "system", userName: "Sistema", action: "Asignación automática", newState: "Valentina Rojas", metadata: "Regla: categoría académico → consejero", timestamp: hoursAgo(2) },
  { id: "a3", ticketId: "t2", userId: "system", userName: "Sistema", action: "Ticket creado", timestamp: hoursAgo(18) },
  { id: "a4", ticketId: "t2", userId: "u2", userName: "Matías Sepúlveda", action: "Cambio de estado", previousState: "nuevo", newState: "pendiente", timestamp: hoursAgo(12) },
  { id: "a5", ticketId: "t5", userId: "system", userName: "Sistema", action: "Ticket creado", timestamp: hoursAgo(1) },
  { id: "a6", ticketId: "t5", userId: "system", userName: "Sistema", action: "Escalado automático", metadata: "Urgencia crítica en categoría bienestar", timestamp: hoursAgo(0.5) },
  { id: "a7", ticketId: "t7", userId: "u2", userName: "Matías Sepúlveda", action: "Cambio de estado", previousState: "en_revision", newState: "resuelto", timestamp: hoursAgo(48) },
  { id: "a8", ticketId: "t3", userId: "u3", userName: "Carolina Muñoz", action: "Cambio de estado", previousState: "pendiente", newState: "en_revision", timestamp: hoursAgo(12) },
];



// ---- Mock SLA Config ----
export const mockSLAConfig: SLAConfig[] = [
  { id: "sla1", category: "academico", urgency: "critico", maxHours: 4, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla2", category: "academico", urgency: "alto", maxHours: 8, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla3", category: "academico", urgency: "medio", maxHours: 48, alertAt50: false, alertAt75: true, alertAt90: true },
  { id: "sla4", category: "academico", urgency: "bajo", maxHours: 96, alertAt50: false, alertAt75: false, alertAt90: true },
  { id: "sla5", category: "infraestructura", urgency: "critico", maxHours: 4, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla6", category: "infraestructura", urgency: "alto", maxHours: 12, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla7", category: "infraestructura", urgency: "medio", maxHours: 48, alertAt50: false, alertAt75: true, alertAt90: true },
  { id: "sla8", category: "infraestructura", urgency: "bajo", maxHours: 120, alertAt50: false, alertAt75: false, alertAt90: true },
  { id: "sla9", category: "bienestar", urgency: "critico", maxHours: 2, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla10", category: "bienestar", urgency: "alto", maxHours: 8, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla11", category: "bienestar", urgency: "medio", maxHours: 24, alertAt50: false, alertAt75: true, alertAt90: true },
  { id: "sla12", category: "bienestar", urgency: "bajo", maxHours: 72, alertAt50: false, alertAt75: false, alertAt90: true },
  { id: "sla13", category: "financiero", urgency: "critico", maxHours: 4, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla14", category: "financiero", urgency: "alto", maxHours: 12, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla15", category: "financiero", urgency: "medio", maxHours: 48, alertAt50: false, alertAt75: true, alertAt90: true },
  { id: "sla16", category: "financiero", urgency: "bajo", maxHours: 96, alertAt50: false, alertAt75: false, alertAt90: true },
  { id: "sla17", category: "otro", urgency: "critico", maxHours: 8, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla18", category: "otro", urgency: "alto", maxHours: 24, alertAt50: true, alertAt75: true, alertAt90: true },
  { id: "sla19", category: "otro", urgency: "medio", maxHours: 72, alertAt50: false, alertAt75: true, alertAt90: true },
  { id: "sla20", category: "otro", urgency: "bajo", maxHours: 120, alertAt50: false, alertAt75: false, alertAt90: true },
];

// ---- Mock Surveys ----
export const mockSurveys: Survey[] = [
  { id: "s1", ticketId: "t7", userId: "est7", csat: 5, ces: 2, comment: "Excelente atención, se resolvió rápidamente.", createdAt: hoursAgo(47) },
  { id: "s2", ticketId: "t8", userId: "est8", csat: 4, ces: 3, comment: "Buen servicio, pero tomó un par de días.", createdAt: hoursAgo(95) },
  { id: "s3", ticketId: "t7", userId: "est3", csat: 3, ces: 4, createdAt: hoursAgo(60) },
  { id: "s4", ticketId: "t8", userId: "est5", csat: 5, ces: 1, comment: "Perfecto.", createdAt: hoursAgo(100) },
  { id: "s5", ticketId: "t7", userId: "est1", csat: 4, ces: 2, createdAt: hoursAgo(50) },
];



// ---- Formatting helpers ----
export const categoryLabels: Record<TicketCategory, string> = {
  academico: "Académico",
  infraestructura: "Infraestructura",
  bienestar: "Bienestar",
  financiero: "Financiero",
  otro: "Otro",
};
export const categoryColors: Record<TicketCategory, string> = {
  academico: "bg-indigo-50 text-indigo-700 border-indigo-200",
  infraestructura: "bg-slate-100 text-slate-700 border-slate-200",
  bienestar: "bg-rose-50 text-rose-700 border-rose-200",
  financiero: "bg-emerald-50 text-emerald-700 border-emerald-200",
  otro: "bg-gray-100 text-gray-600 border-gray-200",
};
export const urgencyLabels: Record<UrgencyLevel, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Crítico",
};
export const urgencyColors: Record<UrgencyLevel, string> = {
  bajo: "text-emerald-600",
  medio: "text-amber-600",
  alto: "text-rose-600",
  critico: "text-rose-700 animate-pulse-soft font-bold",
};
export const statusLabels: Record<TicketStatus, string> = {
  nuevo: "Nuevo",
  pendiente: "Pendiente",
  en_revision: "En revisión",
  escalado: "Escalado",
  resuelto: "Resuelto",
};
export const statusColors: Record<TicketStatus, string> = {
  nuevo: "bg-sky-100 text-sky-700 border-sky-200",
  pendiente: "bg-indigo-100 text-indigo-700 border-indigo-200",
  en_revision: "bg-amber-100 text-amber-700 border-amber-200",
  escalado: "bg-rose-100 text-rose-700 border-rose-200",
  resuelto: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const categoryIcons: Record<TicketCategory, string> = {
  academico: "lucide:graduation-cap",
  infraestructura: "lucide:building-2",
  bienestar: "lucide:heart-pulse",
  financiero: "lucide:wallet",
  otro: "lucide:paperclip",
};

// ---- LocalStorage helpers ----
const STORAGE_KEYS = {
  tickets: "portal_tickets",
  audit: "portal_audit",
  surveys: "portal_surveys",
  sla: "portal_sla",
};

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn("Failed to save to localStorage");
  }
}

export function initializeData() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEYS.tickets)) {
    saveToStorage(STORAGE_KEYS.tickets, mockTickets);
  }
  if (!localStorage.getItem(STORAGE_KEYS.audit)) {
    saveToStorage(STORAGE_KEYS.audit, mockAuditEntries);
  }
  if (!localStorage.getItem(STORAGE_KEYS.surveys)) {
    saveToStorage(STORAGE_KEYS.surveys, mockSurveys);
  }
  if (!localStorage.getItem(STORAGE_KEYS.sla)) {
    saveToStorage(STORAGE_KEYS.sla, mockSLAConfig);
  }
}

export { STORAGE_KEYS };
