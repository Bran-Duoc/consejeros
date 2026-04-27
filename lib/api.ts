import { supabase } from './supabase';
import { Ticket, AuditEntry, Survey, TicketStatus, TicketCategory, UrgencyLevel } from './data';

// ---- Retry helper with exponential backoff ----
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Don't retry on auth or validation errors
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === '42501' || code === '23505' || msg.includes('JWT') || msg.includes('schema cache')) {
        throw err;
      }
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

// ---- User-friendly error messages ----
function friendlyError(err: any): string {
  const msg = err?.message || '';
  if (msg.includes('schema cache')) return 'La base de datos necesita actualizarse. Contacta al administrador.';
  if (msg.includes('JWT')) return 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
  if (msg.includes('duplicate')) return 'Esta solicitud ya fue registrada.';
  if (msg.includes('violates row-level security')) return 'No tienes permisos para realizar esta acción.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return 'Error de conexión. Revisa tu internet e intenta de nuevo.';
  return msg || 'Error inesperado. Intenta de nuevo más tarde.';
}

const categoryMap: Record<string, string> = {
  academico: "Académico",
  infraestructura: "Infraestructura",
  bienestar: "Bienestar",
  financiero: "Financiero",
  otro: "Otros",
};

const urgencyMap: Record<string, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Crítico",
};

const statusMap: Record<string, string> = {
  nuevo: "Nuevo",
  pendiente: "Pendiente",
  en_revision: "En revisión",
  escalado: "Escalado",
  resuelto: "Resuelto",
};

const reverseMap = (obj: Record<string, string>) => 
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

const categoryRev = reverseMap(categoryMap);
const urgencyRev = reverseMap(urgencyMap);
const statusRev = reverseMap(statusMap);

// Helper to map snake_case from DB (Schema v2) to camelCase for App
const mapTicketFromDB = (t: any): Ticket => ({
  id: t.id,
  title: t.titulo || t.title,
  description: t.descripcion || t.description,
  category: (categoryRev[t.categoria || t.category] || "otro") as TicketCategory,
  urgency: (urgencyRev[t.nivel_urgencia || t.urgency] || "bajo") as UrgencyLevel,
  status: (statusRev[t.estado || t.status] || "nuevo") as TicketStatus,
  assignedTo: t.asignado_a,
  createdBy: t.estudiante_id || t.created_by,
  createdByName: t.created_by_name || "Usuario",
  createdAt: t.fecha_creacion || t.created_at,
  updatedAt: t.fecha_creacion || t.updated_at,
  slaDeadline: t.sla_deadline,
  school: t.escuela,
  career: t.carrera,
  attachments: t.attachments || [],
  tags: t.tags || [],
});

const mapTicketToDB = (t: Partial<Ticket>) => {
  const data: Record<string, unknown> = {
    titulo: t.title,
    descripcion: t.description,
    categoria: t.category ? categoryMap[t.category] : undefined,
    nivel_urgencia: t.urgency ? urgencyMap[t.urgency] : undefined,
    estado: t.status ? statusMap[t.status] : undefined,
    estudiante_id: t.createdBy,
    sla_deadline: t.slaDeadline,
    escuela: t.school,
    carrera: t.career,
  };

  // Only include asignado_a if it's a valid UUID (defensive: avoids schema cache error)
  if (t.assignedTo && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(t.assignedTo)) {
    data.asignado_a = t.assignedTo;
  }

  // Remove undefined values to avoid Supabase sending nulls for missing columns
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
};

export const db = {
  tickets: {
    async getAll() {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('fecha_creacion', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapTicketFromDB);
      });
    },
    async create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) {
      try {
        const dbData = mapTicketToDB(ticket);
        const { data, error } = await supabase
          .from('tickets')
          .insert([dbData])
          .select()
          .single();
        if (error) {
          // If asignado_a column doesn't exist, retry without it
          if (error.message?.includes('asignado_a') && 'asignado_a' in dbData) {
            const { asignado_a, ...withoutAsignado } = dbData as any;
            const { data: retryData, error: retryError } = await supabase
              .from('tickets')
              .insert([withoutAsignado])
              .select()
              .single();
            if (retryError) throw new Error(friendlyError(retryError));
            return mapTicketFromDB(retryData);
          }
          throw new Error(friendlyError(error));
        }
        return mapTicketFromDB(data);
      } catch (err: any) {
        throw new Error(err.message || friendlyError(err));
      }
    },
    async updateStatus(id: string, status: TicketStatus) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('tickets')
          .update({ estado: statusMap[status] })
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(friendlyError(error));
        return mapTicketFromDB(data);
      });
    },
  },
  audit: {
    async getAll() {
      const { data, error } = await supabase
        .from('ticket_history')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.warn("Audit table fetch failed, returning empty:", error.message);
        return [];
      }
      return (data || []).map((a: any) => ({
        id: a.id,
        ticketId: a.ticket_id,
        userId: a.user_id,
        userName: a.user_name,
        action: a.action,
        previousState: a.previous_state,
        newState: a.new_state,
        metadata: a.metadata,
        timestamp: a.created_at,
      }));
    },
    async create(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
      const { error } = await supabase.from('ticket_history').insert([{
        ticket_id: entry.ticketId,
        user_id: entry.userId,
        user_name: entry.userName,
        action: entry.action,
        previous_state: entry.previousState,
        new_state: entry.newState,
        metadata: entry.metadata,
      }]);
      if (error) console.error("Failed to log audit:", error.message);
    },
  },
  surveys: {
    async getAll() {
      const { data, error } = await supabase.from('surveys').select('*');
      if (error) {
        console.warn("Surveys table fetch failed, returning empty:", error.message);
        return [];
      }
      return (data || []).map((s: any) => ({
        id: s.id,
        ticketId: s.ticket_id,
        userId: s.user_id,
        csat: s.csat_score,
        ces: s.ces_score,
        comment: s.comment,
        createdAt: s.created_at,
      }));
    },
    async create(survey: Omit<Survey, 'id' | 'createdAt'>) {
      const { error } = await supabase.from('surveys').insert([{
        ticket_id: survey.ticketId,
        user_id: survey.userId,
        csat_score: survey.csat,
        ces_score: survey.ces,
        comment: survey.comment,
      }]);
      if (error) console.error("Failed to save survey:", error.message);
    },
  },
  users: {
    async getAll() {
      const { data, error } = await supabase.from('staff_users').select('*');
      if (error) {
        console.warn("staff_users table fetch failed, trying users:", error.message);
        const { data: userData, error: userError } = await supabase.from('users').select('*');
        if (userError) throw userError;
        return (userData || []).map((u: any) => ({
          id: u.id,
          name: u.nombre || (u.email ? u.email.split('@')[0] : "Usuario"),
          email: u.email,
          role: u.rol,
          department: u.departamento,
        }));
      }
      return (data || []).map((u: any) => ({
        id: u.id,
        name: u.nombre || "Staff Member",
        email: u.email,
        role: u.rol,
        department: u.departamento,
      }));
    },
  },
};

