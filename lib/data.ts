// ============================================================
// Types & Constants for Portal Hub del Consejo de Sede
// ============================================================

export const TICKET_CATEGORIES = ["academico", "infraestructura", "bienestar", "financiero", "otro"] as const;
export const URGENCY_LEVELS = ["bajo", "medio", "alto", "critico"] as const;

export type TicketStatus = "nuevo" | "pendiente" | "en_revision" | "escalado" | "resuelto";
export type TicketCategory = typeof TICKET_CATEGORIES[number];
export type UrgencyLevel = typeof URGENCY_LEVELS[number];
export type AdminRole = "Estudiante" | "Supervisor" | "Consejo" | "Admin TI" | "Admin_TI";

export interface User {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
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
  infraestructura: "Experiencia",
  bienestar: "Vida Estudiantil",
  financiero: "Financiero",
  otro: "Otro",
};

export const categorySubcategories: Record<TicketCategory, { label: string; description?: string }[]> = {
  academico: [
    { label: "Metodología Docente", description: "Apoyo para mejorar la comprensión y el enfoque de las clases" },
    { label: "Trato y Comunicación", description: "Fomentar un ambiente positivo de convivencia y respeto mutuo" },
    { label: "Asistencia y Puntualidad", description: "Coordinación y seguimiento de los horarios académicos" },
    { label: "Pautas y Evaluaciones", description: "Claridad en rúbricas y revisión constructiva de calificaciones" },
    { label: "Topes e Inscripción", description: "Asesoría para optimizar y organizar tu horario semestral" },
    { label: "Mallas y Prerrequisitos", description: "Orientación y guía clara sobre la toma de asignaturas" },
    { label: "Plataforma AVA", description: "Asistencia para potenciar tu experiencia en el aula virtual" },
    { label: "Ayudantías Académicas", description: "Oportunidades de reforzamiento y apoyo continuo" },
  ],
  bienestar: [
    { label: "Apoyo Psicológico (PAE)", description: "Acompañamiento, contención y bienestar integral" },
    { label: "Talleres y Recreación", description: "Participación en actividades para tu desarrollo personal" },
    { label: "Deportes y Selecciones", description: "Impulso a la vida sana y participación deportiva" },
    { label: "Pastoral y Misiones", description: "Espacios de encuentro, reflexión y apoyo espiritual" },
    { label: "Ayudantías de Servicio", description: "Oportunidades de colaboración y becas de trabajo" },
  ],
  infraestructura: [
    { label: "Casino y Microondas", description: "Mejora continua en nuestros espacios de alimentación" },
    { label: "Laboratorios y Talleres", description: "Sugerencias sobre equipamiento e instalaciones técnicas" },
    { label: "WiFi y Conectividad", description: "Aportes para la optimización de nuestra red y acceso" },
    { label: "Baños e Infraestructura", description: "Iniciativas para el mantenimiento y confort de nuestras áreas" },
    { label: "Patios y Espacios de Estudio", description: "Ideas para enriquecer nuestras zonas de descanso y estudio" },
    { label: "Seguridad y Accesos", description: "Contribución para mantener un entorno universitario seguro" },
    { label: "Biblioteca y Servicios", description: "Aprovechamiento de recursos y espacios de lectura" },
  ],
  financiero: [
    { label: "Orientación Becas Estudiantiles", description: "Asesoría integral para acceder a beneficios" },
    { label: "Procesos de Asignación y Renovación", description: "Acompañamiento en el estado de tus becas" },
    { label: "Asesoría sobre Pagos", description: "Orientación clara y oportuna sobre procesos financieros" },
  ],
  otro: [
    { label: "Dudas Generales", description: "Cualquier otra consulta en la que podamos guiarte" },
    { label: "Sugerencias e Iniciativas", description: "Ideas constructivas para seguir mejorando nuestra sede" },
    { label: "Soporte Digital", description: "Asistencia rápida para facilitar el uso de plataformas" },
  ],
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

// ---- Helper: parseCreatedBy ----
export function parseCreatedBy(createdByName: string): { name: string; email: string } {
  if (!createdByName) return { name: "Estudiante", email: "No especificado" };
  const match = createdByName.match(/(.*)<(.*)>/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  if (createdByName.includes('@')) {
    return { name: createdByName.split('@')[0], email: createdByName };
  }
  return { name: createdByName, email: "No especificado" };
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
