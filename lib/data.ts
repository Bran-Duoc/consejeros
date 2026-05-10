// ============================================================
// Types & Constants for Portal Hub del Consejo de Sede
// ============================================================

export type TicketStatus = "nuevo" | "pendiente" | "en_revision" | "escalado" | "resuelto";
export type TicketCategory = "academico" | "infraestructura" | "bienestar" | "financiero" | "otro";
export type UrgencyLevel = "bajo" | "medio" | "alto" | "critico";
export type UserRole = "Estudiante" | "Supervisor" | "Consejo" | "Admin TI" | "Admin_TI";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
  school?: string;
  career?: string;
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

// ---- Formatting helpers ----
export const categoryLabels: Record<TicketCategory, string> = {
  academico: "Académico",
  infraestructura: "Infraestructura",
  bienestar: "Bienestar",
  financiero: "Financiero",
  otro: "Otro",
};

export const categoryIcons: Record<TicketCategory, string> = {
  academico: "lucide:graduation-cap",
  infraestructura: "lucide:building-2",
  bienestar: "lucide:heart-pulse",
  financiero: "lucide:wallet",
  otro: "lucide:paperclip",
};

export const urgencyLabels: Record<UrgencyLevel, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Crítico",
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

// ---- Helper: generate ID ----
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ---- LocalStorage helpers (Fallback only) ----
export const STORAGE_KEYS = {
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

// ---- Schools & Careers (Sede Viña del Mar) ----
export const SCHOOLS_DATA: Record<string, string[]> = {
  "🏢 Escuela de Administración y Negocios": [
    "Auditoría",
    "Comercio Exterior",
    "Contabilidad General Mención Legislación Tributaria",
    "Ingeniería en Administración Mención Finanzas",
    "Ingeniería en Administración Mención Gestión de Personas",
    "Ingeniería en Administración Mención Innovación y Emprendimiento",
    "Ingeniería en Comercio Exterior",
    "Ingeniería en Gestión Logística",
    "Ingeniería en Marketing Digital",
    "Técnico en Administración",
    "Técnico en Gestión Logística",
  ],
  "💻 Escuela de Informática y Telecomunicaciones": [
    "Analista Programador",
    "Ingeniería en Informática",
    "Ingeniería en Redes y Telecomunicaciones",
  ],
  "🎨 Escuela de Diseño": [
    "Diseño de Ambientes",
    "Diseño de Vestuario",
    "Diseño Gráfico",
    "Diseño Industrial e Innovación en Productos",
    "Ilustración para Contextos Globales",
  ],
  "🎬 Escuela de Comunicación": [
    "Actuación",
    "Animación Digital",
    "Comunicación Audiovisual",
    "Ingeniería en Sonido",
    "Publicidad",
    "Relaciones Públicas y Comunicación Organizacional",
    "Tecnología en Sonido e Iluminación",
  ],
  "🏥 Escuela de Salud y Bienestar": [
    "Preparador Físico",
  ],
};
