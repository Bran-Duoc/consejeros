import { supabase } from './supabase';
import { Ticket, AuditEntry, Survey, TicketStatus, TicketCategory, UrgencyLevel, AdminRole } from './data';

// ============================================================
// API Layer — Portal Hub del Consejo de Sede
// Connected to Supabase project: traweqraelgoinlrcmja
// ============================================================

interface PostgresError {
  message?: string;
  code?: string;
}

// ---- Retry with exponential backoff ----
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const errorObj = err as PostgresError | null;
      const code = errorObj?.code || '';
      const msg = errorObj?.message || '';
      if (code === '42501' || code === '23505' || code === '23503' ||
          msg.includes('JWT') || msg.includes('schema cache') ||
          msg.includes('violates foreign key') || msg.includes('row-level security')) {
        throw err;
      }
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

// ---- User-friendly error messages (Spanish) ----
function friendlyError(err: unknown): string {
  const errorObj = err as PostgresError | null;
  const msg = errorObj?.message || '';
  if (msg.includes('row-level security')) return 'Debes iniciar sesión para realizar esta acción.';
  if (msg.includes('JWT') || msg.includes('expired')) return 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
  if (msg.includes('duplicate')) return 'Esta solicitud ya fue registrada.';
  if (msg.includes('foreign key')) return 'Error de referencia en la base de datos. Contacta al administrador.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch'))
    return 'Error de conexión. Revisa tu internet e intenta de nuevo.';
  if (msg.includes('null value') || msg.includes('not-null'))
    return 'Faltan campos obligatorios. Completa todos los campos.';
  if (msg.includes('Could not find')) return `La estructura de la base de datos no coincide (Columna faltante). Contacta al administrador. Detalle: ${msg}`;
  if (msg.includes('invalid input value for enum')) return 'Valor no válido para el campo. Intenta de nuevo.';
  return msg || 'Error inesperado. Intenta de nuevo más tarde.';
}

// ---- Enum Maps (app key → DB display value) ----
const CATEGORY_TO_DB: Record<string, string> = {
  academico: 'Académico',
  infraestructura: 'Infraestructura',
  bienestar: 'Bienestar',
  financiero: 'Financiero',
  otro: 'Otros',
};

const URGENCY_TO_DB: Record<string, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
};

const STATUS_TO_DB: Record<string, string> = {
  nuevo: 'Nuevo',
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  escalado: 'Escalado',
  resuelto: 'Resuelto',
};

const mkReverse = (m: Record<string, string>) => {
  const rev = Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]));
  // Add some common lowercase fallbacks just in case
  Object.keys(m).forEach(k => { rev[k] = k; });
  return rev;
};
const DB_TO_CATEGORY = mkReverse(CATEGORY_TO_DB);
const DB_TO_URGENCY = mkReverse(URGENCY_TO_DB);
const DB_TO_STATUS = mkReverse(STATUS_TO_DB);

// ---- DB Row → App Ticket ----
function mapTicketFromDB(row: Record<string, unknown>): Ticket {
  const getStr = (val: unknown): string => typeof val === 'string' ? val : '';
  const getArray = (val: unknown): string[] => Array.isArray(val) ? val.map(v => String(v)) : [];
  
  return {
    id: getStr(row.id),
    title: getStr(row.titulo || row.title),
    description: getStr(row.descripcion || row.description),
    category: (DB_TO_CATEGORY[getStr(row.categoria || row.category)] || 'otro') as TicketCategory,
    urgency: (DB_TO_URGENCY[getStr(row.nivel_urgencia || row.urgency)] || 'bajo') as UrgencyLevel,
    status: (DB_TO_STATUS[getStr(row.estado || row.status)] || 'nuevo') as TicketStatus,
    assignedTo: (row.asignado_a || row.assigned_to || null) as string | null,
    createdBy: getStr(row.estudiante_id || row.created_by),
    createdByName: getStr(row.nombre_estudiante || row.created_by_name || row.nombre) || 'Estudiante',
    createdAt: getStr(row.fecha_creacion || row.created_at) || new Date().toISOString(),
    updatedAt: getStr(row.updated_at || row.fecha_creacion || row.created_at) || new Date().toISOString(),
    slaDeadline: getStr(row.sla_deadline) || new Date(Date.now() + 48 * 3600000).toISOString(),
    school: getStr(row.escuela || row.school),
    career: getStr(row.carrera || row.career),
    attachments: getArray(row.attachments),
    tags: getArray(row.tags),
  };
}

// ---- App Ticket → DB Row (Robust Mapping) ----
function mapTicketToDB(t: Partial<Ticket>): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (t.title !== undefined) data.titulo = t.title;
  if (t.description !== undefined) data.descripcion = t.description;
  if (t.category !== undefined) data.categoria = CATEGORY_TO_DB[t.category] || t.category;
  if (t.urgency !== undefined) data.nivel_urgencia = URGENCY_TO_DB[t.urgency] || t.urgency;
  if (t.status !== undefined) data.estado = STATUS_TO_DB[t.status] || t.status;
  if (t.slaDeadline !== undefined) data.sla_deadline = t.slaDeadline;
  if (t.school !== undefined) data.escuela = t.school;
  if (t.career !== undefined) data.carrera = t.career;

  // UUID checks
  if (t.createdBy && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(t.createdBy)) {
    data.estudiante_id = t.createdBy;
  }
  if (t.assignedTo && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(t.assignedTo)) {
    data.asignado_a = t.assignedTo;
  }

  // Name fields (we send several as fallback)
  if (t.createdByName) {
    data.nombre_estudiante = t.createdByName;
    data.created_by_name = t.createdByName;
    data.nombre = t.createdByName;
  }

  return data;
}

// ---- Safe Insert with Recursive Column Stripping ----
async function safeInsert(
  table: string, 
  row: Record<string, unknown>
): Promise<{ data: Record<string, unknown> | null; error: PostgresError | null }> {
  const { data, error } = await supabase.from(table).insert([row]).select().maybeSingle();

  if (error) {
    const msg = error.message || '';
    const colMatch = msg.match(/Could not find the '(\w+)' column/i) || 
                     msg.match(/column "(\w+)" .* does not exist/i);
    
    if (colMatch) {
      const badCol = colMatch[1];
      console.warn(`[API] Column "${badCol}" not found in ${table}, stripping and retrying...`);
      const cleaned = { ...row };
      delete cleaned[badCol];
      if (Object.keys(cleaned).length === 0) return { data: data as Record<string, unknown> | null, error }; // Don't loop forever
      return safeInsert(table, cleaned); // Recursive call
    }
  }

  return { data: data as Record<string, unknown> | null, error };
}

// ============================================================
// PUBLIC API
// ============================================================

export const db = {
  tickets: {
    async getAll(): Promise<Ticket[]> {
      return withRetry(async () => {
        // Try ordering by fecha_creacion, fallback to created_at
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('fecha_creacion', { ascending: false });

        if (error && error.message?.includes('fecha_creacion')) {
          const { data: altData, error: altError } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });
          if (altError) throw altError;
          return (altData || []).map(row => mapTicketFromDB(row as Record<string, unknown>));
        }
        
        if (error) throw error;
        return (data || []).map(row => mapTicketFromDB(row as Record<string, unknown>));
      });
    },

    async create(ticket: Partial<Ticket>): Promise<Ticket> {
      try {
        const dbData = mapTicketToDB(ticket);
        const { data, error } = await safeInsert('tickets', dbData);

        if (error) throw new Error(friendlyError(error));

        if (data) return mapTicketFromDB(data);
        
        // If success but no row returned (RLS), return a mock with input data
        return {
          ...ticket,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Ticket;
      } catch (err) {
        const errorObj = err as PostgresError | null;
        console.error('[API] Ticket creation failed:', err);
        throw new Error(errorObj?.message || friendlyError(err));
      }
    },

    async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
      return withRetry(async () => {
        // Try estado then status
        let { data, error } = await supabase
          .from('tickets')
          .update({ estado: STATUS_TO_DB[status] || status })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error && error.message?.includes('estado')) {
          const { data: altData, error: altError } = await supabase
            .from('tickets')
            .update({ status: status })
            .eq('id', id)
            .select()
            .maybeSingle();
          if (altError) throw new Error(friendlyError(altError));
          data = altData;
          error = null;
        }

        if (error) throw new Error(friendlyError(error));
        if (data) return mapTicketFromDB(data as Record<string, unknown>);
        return { id, status } as unknown as Ticket;
      });
    },

    async update(id: string, updates: Partial<Ticket>): Promise<Ticket> {
      return withRetry(async () => {
        const dbData = mapTicketToDB(updates);
        // Special case for assignedTo/status mappings
        if (updates.status) dbData.estado = STATUS_TO_DB[updates.status] || updates.status;
        if (updates.assignedTo) dbData.asignado_a = updates.assignedTo;

        const { data, error } = await supabase
          .from('tickets')
          .update(dbData)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) throw new Error(friendlyError(error));
        if (data) return mapTicketFromDB(data as Record<string, unknown>);
        return { id, ...updates } as unknown as Ticket;
      });
    },
  },

  audit: {
    async getAll(): Promise<AuditEntry[]> {
      const { data, error } = await supabase
        .from('ticket_history')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Audit fetch failed:', error.message);
        return [];
      }
      return (data || []).map((a) => {
        const row = a as Record<string, unknown>;
        return {
          id: String(row.id),
          ticketId: String(row.ticket_id),
          userId: String(row.user_id || ''),
          userName: String(row.user_name || row.nombre_usuario || 'Sistema'),
          action: String(row.action || row.accion || ''),
          previousState: row.previous_state ? String(row.previous_state) : undefined,
          newState: row.new_state ? String(row.new_state) : undefined,
          metadata: row.metadata ? String(row.metadata) : undefined,
          timestamp: String(row.created_at),
        };
      });
    },

    async create(entry: Partial<AuditEntry>): Promise<void> {
      try {
        const { error } = await supabase.from('ticket_history').insert([{
          ticket_id: entry.ticketId,
          user_id: entry.userId || null,
          user_name: entry.userName || 'Sistema',
          action: entry.action || 'update',
          previous_state: entry.previousState,
          new_state: entry.newState,
          metadata: entry.metadata,
        }]);
        if (error) console.warn('Audit log failed (non-blocking):', error.message);
      } catch (err) {
        console.warn('Audit error (non-blocking):', err);
      }
    },
  },

  surveys: {
    async getAll(): Promise<Survey[]> {
      const { data, error } = await supabase.from('surveys').select('*');
      if (error) {
        console.warn('Surveys fetch failed:', error.message);
        return [];
      }
      return (data || []).map((s) => {
        const row = s as Record<string, unknown>;
        return {
          id: String(row.id),
          ticketId: String(row.ticket_id),
          userId: String(row.user_id || ''),
          csat: Number(row.csat_score || row.csat || 3),
          ces: Number(row.ces_score || row.ces || 3),
          comment: row.comment ? String(row.comment) : undefined,
          createdAt: String(row.created_at),
        };
      });
    },

    async create(survey: Partial<Survey>): Promise<void> {
      try {
        const { error } = await supabase.from('surveys').insert([{
          ticket_id: survey.ticketId,
          user_id: survey.userId || null,
          csat_score: survey.csat,
          ces_score: survey.ces,
          comment: survey.comment,
        }]);
        if (error) console.warn('Survey save failed:', error.message);
      } catch (err) {
        console.warn('Survey error (non-blocking):', err);
      }
    },
  },

  users: {
    async getAll() {
      const { data, error } = await supabase.from('staff_users').select('*');
      if (!error && data) {
        return data.filter(u => !!u).map((u) => {
          const row = u as Record<string, unknown>;
          return {
            id: String(row.id),
            name: String(row.nombre || row.name || 'Staff'),
            email: String(row.email || ''),
            role: (row.rol || row.role || 'Consejo') as AdminRole,
            department: row.departamento ? String(row.departamento) : undefined,
          };
        });
      }
      const { data: userData, error: userError } = await supabase.from('users').select('*');
      if (userError) return [];
      return (userData || []).filter(u => !!u).map((u) => {
        const row = u as Record<string, unknown>;
        return {
          id: String(row.id),
          name: String(row.rol || 'Estudiante'),
          email: '', // La tabla public.users no tiene email
          role: (row.rol as AdminRole) || 'Estudiante',
          activeTickets: 0
        };
      });
    },
  },
};
