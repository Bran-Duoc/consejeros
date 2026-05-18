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
  infraestructura: "Experiencia y Campus",
  bienestar: "Punto Estudiantil (Apoyo)",
  financiero: "Orientación Financiera",
  otro: "Guía Práctica: ¿Cómo y Dónde?",
};

export interface SubcategoryGroup {
  name: string;
  icon: string;
  options: { label: string; description: string }[];
}

export const categorySubcategories: Record<TicketCategory, SubcategoryGroup[]> = {
  academico: [
    {
      name: "Docentes",
      icon: "lucide:users",
      options: [
        { label: "Metodología y Aprendizaje", description: "Apoyo para mejorar la comprensión y el enfoque de las clases" },
        { label: "Convivencia y Trato", description: "Fomentar un ambiente positivo de respeto mutuo" },
        { label: "Asistencia y Puntualidad", description: "Coordinación y seguimiento de los horarios académicos" },
        { label: "Evaluaciones y Rúbricas", description: "Claridad en pautas y revisión constructiva de calificaciones" },
      ],
    },
    {
      name: "Gestión Académica",
      icon: "lucide:clipboard-list",
      options: [
        { label: "Toma de Ramos y Topes", description: "Asesoría para optimizar y organizar tu horario semestral" },
        { label: "Mallas y Prerrequisitos", description: "Orientación vocacional y guía sobre asignaturas" },
        { label: "Ayudantías y Reforzamientos", description: "Oportunidades de apoyo continuo y aprendizaje" },
        { label: "Certificados y Convalidaciones", description: "Acompañamiento en trámites formales académicos" },
      ],
    },
    {
      name: "Plataformas y Sistemas",
      icon: "lucide:laptop",
      options: [
        { label: "Aula Virtual (AVA)", description: "Asistencia para potenciar tu experiencia de aprendizaje en línea" },
        { label: "Portafolio y Maletín", description: "Soporte en herramientas institucionales y portafolio" },
        { label: "Correo e Identidad", description: "Asistencia de acceso a cuentas institucionales" },
      ],
    },
  ],
  bienestar: [
    {
      name: "Salud y Apoyo Psicológico",
      icon: "lucide:heart",
      options: [
        { label: "Orientación Psicológica (PAE)", description: "Te indicamos cómo agendar con los especialistas de Punto Estudiantil" },
        { label: "Primeros Auxilios", description: "Guía sobre cómo proceder y a quién acudir ante emergencias de salud" },
      ],
    },
    {
      name: "Vida Universitaria",
      icon: "lucide:smile",
      options: [
        { label: "Talleres y Deportes (DAE)", description: "Información sobre cómo inscribirte en actividades extraprogramáticas" },
        { label: "Pastoral y Misiones", description: "Te conectamos con los coordinadores del área espiritual" },
      ],
    },
    {
      name: "Comunidad e Integración",
      icon: "lucide:users-2",
      options: [
        { label: "Inclusión y Diversidad", description: "Orientación sobre protocolos institucionales y apoyos equitativos" },
        { label: "Voluntariados y Servicios", description: "Te derivamos para conocer becas de trabajo y ayudas comunitarias" },
      ],
    },
  ],
  infraestructura: [
    {
      name: "Espacios Comunes",
      icon: "lucide:sofa",
      options: [
        { label: "Casino y Alimentación", description: "Reporte de sugerencias para mejorar nuestros espacios de comida" },
        { label: "Patios y Áreas de Descanso", description: "Iniciativas para enriquecer nuestras zonas de esparcimiento" },
        { label: "Baños e Instalaciones", description: "Reportes sobre confort y limpieza de infraestructura" },
      ],
    },
    {
      name: "Entorno de Aprendizaje",
      icon: "lucide:book-open",
      options: [
        { label: "Biblioteca y Salas de Estudio", description: "Dudas sobre reservas o aprovechamiento de espacios de silencio" },
        { label: "Laboratorios y Talleres", description: "Reporte o sugerencias sobre equipamiento e infraestructura técnica" },
        { label: "Salas de Clases", description: "Iniciativas sobre el confort, pizarras y equipamiento del aula" },
      ],
    },
    {
      name: "Servicios Generales",
      icon: "lucide:settings",
      options: [
        { label: "WiFi y Conectividad", description: "Reporte centralizado para optimizar nuestra red institucional" },
        { label: "Seguridad y Accesos", description: "Reportes o consultas para mantener un entorno seguro" },
      ],
    },
  ],
  financiero: [
    {
      name: "Becas y Beneficios",
      icon: "lucide:award",
      options: [
        { label: "Guía de Becas Estatales", description: "Te orientamos sobre dónde y con quién consultar Gratuidad o CAE" },
        { label: "Guía de Becas Internas", description: "Información oficial para contactar a los ejecutivos de Duoc UC" },
      ],
    },
    {
      name: "Consultas de Pago",
      icon: "lucide:credit-card",
      options: [
        { label: "Derivación Aranceles y Matrículas", description: "Te indicamos los canales oficiales para resolver pagos regulares" },
        { label: "Derivación Casos Especiales", description: "Guía sobre con quién hablar para opciones de repactación" },
      ],
    },
    {
      name: "Renovación y Suspensión",
      icon: "lucide:pause-circle",
      options: [
        { label: "Suspensión de Beneficios", description: "Orientación básica sobre los pasos para congelar becas o carrera" },
      ],
    },
  ],
  otro: [
    {
      name: "Directorio de Sede",
      icon: "lucide:map-pin",
      options: [
        { label: "¿Dónde queda este lugar?", description: "Te ayudamos a encontrar salas, oficinas o servicios dentro del campus" },
        { label: "¿Con quién debo hablar?", description: "Orientación exacta sobre a qué departamento debes acudir" },
      ],
    },
    {
      name: "Soporte Digital Rápido",
      icon: "lucide:smartphone",
      options: [
        { label: "Ayuda App Experiencia Duoc", description: "Te enseñamos a usar y aprovechar la aplicación móvil" },
        { label: "Credencial Virtual", description: "Guía paso a paso para activar tu credencial en el celular" },
      ],
    },
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
  "🩺 Escuela de Salud": [
    "Preparador Físico",
  ],
};
