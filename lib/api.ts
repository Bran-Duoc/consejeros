import { supabase } from './supabase';
import { Ticket, AuditEntry, Survey, TicketStatus, TicketCategory, UrgencyLevel } from './data';

// ============================================================
// API Layer — Schema-Adaptive for Supabase
// Detects whether the DB uses Spanish or English column names
// and handles both gracefully, so student submissions never fail.
// ============================================================

// ---- Retry helper with exponential backoff ----
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const code = err?.code || '';
      const msg = err?.message || '';
      // Don't retry on auth, constraint, or schema errors
      if (code === '42501' || code === '23505' || code === '23503' || 
          msg.includes('JWT') || msg.includes('schema cache') || 
          msg.includes('violates foreign key')) {
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
  if (msg.includes('JWT') || msg.includes('expired')) return 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
  if (msg.includes('duplicate')) return 'Esta solicitud ya fue registrada.';
  if (msg.includes('violates row-level security')) return 'No tienes permisos para realizar esta acción.';
  if (msg.includes('violates foreign key')) return 'Error de referencia en la base de datos. Contacta al administrador.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) 
    return 'Error de conexión. Revisa tu internet e intenta de nuevo.';
  if (msg.includes('null value in column') || msg.includes('not-null constraint'))
    return 'Faltan campos obligatorios. Completa todos los campos e intenta de nuevo.';
  if (msg.includes('Could not find')) return 'La estructura de la base de datos está desactualizada. Contacta al administrador.';
  return msg || 'Error inesperado. Intenta de nuevo más tarde.';
}

// ---- Schema Detection ----
// The database may use Spanish columns (titulo, descripcion, etc.) 
// or English columns (title, description, etc.)
// We detect on first call and cache the result.

type SchemaType = 'spanish' | 'english' | 'unknown';
let detectedSchema: SchemaType = 'unknown';

async function detectSchema(): Promise<SchemaType> {
  if (detectedSchema !== 'unknown') return detectedSchema;

  try {
    // Try fetching one row to see which columns exist
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .limit(1);
    
    if (error) {
      console.warn('Schema detection failed, defaulting to English:', error.message);
      detectedSchema = 'english';
      return detectedSchema;
    }

    if (data && data.length > 0) {
      const row = data[0];
      // Check for Spanish column names
      if ('titulo' in row || 'descripcion' in row || 'categoria' in row) {
        detectedSchema = 'spanish';
      } else {
        detectedSchema = 'english';
      }
    } else {
      // Empty table — try inserting with English columns (schema.sql default)
      detectedSchema = 'english';
    }
  } catch {
    detectedSchema = 'english';
  }
  
  console.log('[API] Detected DB schema:', detectedSchema);
  return detectedSchema;
}

// ---- Column mappers ----

// Spanish schema column mappings
const SPANISH_COLS = {
  title: 'titulo',
  description: 'descripcion',
  category: 'categoria',
  urgency: 'nivel_urgencia',
  status: 'estado',
  assigned_to: 'asignado_a',
  created_by: 'estudiante_id',
  created_by_name: 'nombre_estudiante',
  created_at: 'fecha_creacion',
  updated_at: 'fecha_actualizacion',
  sla_deadline: 'sla_deadline',
  school: 'escuela',
  career: 'carrera',
} as const;

// Reverse maps for display values
const categoryMap: Record<string, string> = {
  academico: "Académico", infraestructura: "Infraestructura",
  bienestar: "Bienestar", financiero: "Financiero", otro: "Otros",
};
const urgencyMap: Record<string, string> = {
  bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico",
};
const statusMap: Record<string, string> = {
  nuevo: "Nuevo", pendiente: "Pendiente", en_revision: "En revisión",
  escalado: "Escalado", resuelto: "Resuelto",
};
const reverseMap = (obj: Record<string, string>) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
const categoryRev = reverseMap(categoryMap);
const urgencyRev = reverseMap(urgencyMap);
const statusRev = reverseMap(statusMap);

// ---- Map from DB row → App Ticket ----
function mapTicketFromDB(t: any): Ticket {
  // Works with both Spanish and English columns
  return {
    id: t.id,
    title: t.titulo || t.title || '',
    description: t.descripcion || t.description || '',
    category: (categoryRev[t.categoria] || categoryRev[t.category] || t.category || t.categoria || 'otro') as TicketCategory,
    urgency: (urgencyRev[t.nivel_urgencia] || urgencyRev[t.urgency] || t.urgency || t.nivel_urgencia || 'bajo') as UrgencyLevel,
    status: (statusRev[t.estado] || statusRev[t.status] || t.status || t.estado || 'nuevo') as TicketStatus,
    assignedTo: t.asignado_a || t.assigned_to || null,
    createdBy: t.estudiante_id || t.created_by || '',
    createdByName: t.nombre_estudiante || t.created_by_name || t.created_by || 'Estudiante',
    createdAt: t.fecha_creacion || t.created_at || new Date().toISOString(),
    updatedAt: t.fecha_actualizacion || t.updated_at || t.fecha_creacion || t.created_at || new Date().toISOString(),
    slaDeadline: t.sla_deadline || new Date(Date.now() + 48 * 3600000).toISOString(),
    school: t.escuela || t.school || '',
    career: t.carrera || t.career || '',
    attachments: t.attachments || [],
    tags: t.tags || [],
  };
}

// ---- Map from App Ticket → DB row ----
function mapTicketToDB(t: Partial<Ticket>, schema: SchemaType): Record<string, any> {
  if (schema === 'spanish') {
    const data: Record<string, any> = {};
    if (t.title !== undefined) data.titulo = t.title;
    if (t.description !== undefined) data.descripcion = t.description;
    if (t.category !== undefined) data.categoria = categoryMap[t.category] || t.category;
    if (t.urgency !== undefined) data.nivel_urgencia = urgencyMap[t.urgency] || t.urgency;
    if (t.status !== undefined) data.estado = statusMap[t.status] || t.status;
    if (t.createdBy !== undefined) data.estudiante_id = t.createdBy;
    if (t.createdByName !== undefined) data.nombre_estudiante = t.createdByName;
    if (t.slaDeadline !== undefined) data.sla_deadline = t.slaDeadline;
    if (t.school !== undefined) data.escuela = t.school;
    if (t.career !== undefined) data.carrera = t.career;
    if (t.assignedTo && /^[0-9a-f]{8}-/i.test(t.assignedTo)) {
      data.asignado_a = t.assignedTo;
    }
    return data;
  }

  // English schema (matches database/schema.sql)
  const data: Record<string, any> = {};
  if (t.title !== undefined) data.title = t.title;
  if (t.description !== undefined) data.description = t.description;
  if (t.category !== undefined) data.category = t.category; // lowercase key directly
  if (t.urgency !== undefined) data.urgency = t.urgency;
  if (t.status !== undefined) data.status = t.status;
  if (t.createdBy !== undefined) data.created_by = t.createdBy;
  if (t.createdByName !== undefined) data.created_by_name = t.createdByName;
  if (t.slaDeadline !== undefined) data.sla_deadline = t.slaDeadline;
  if (t.school !== undefined) data.school = t.school;
  if (t.career !== undefined) data.career = t.career;
  if (t.assignedTo && /^[0-9a-f]{8}-/i.test(t.assignedTo)) {
    data.assigned_to = t.assignedTo;
  }
  return data;
}

// ---- Try insert with fallback ----
// If the insert fails due to missing columns, strips them and retries
async function safeInsert(table: string, row: Record<string, any>): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.from(table).insert([row]).select().maybeSingle();

  if (error) {
    const msg = error.message || '';

    // Handle "Could not find column X" errors by removing that column
    const colMatch = msg.match(/Could not find the '(\w+)' column/i) || 
                     msg.match(/column "(\w+)" .* does not exist/i);
    if (colMatch) {
      const badCol = colMatch[1];
      console.warn(`[API] Column "${badCol}" not found in ${table}, retrying without it`);
      const { [badCol]: _removed, ...cleaned } = row;
      return safeInsert(table, cleaned); // Recursive retry
    }

    // Handle FK constraint violations by nullifying the FK
    if (msg.includes('violates foreign key constraint') || msg.includes('not present in table')) {
      const fkMatch = msg.match(/Key \((\w+)\)/i);
      if (fkMatch) {
        const fkCol = fkMatch[1];
        console.warn(`[API] FK constraint failed for "${fkCol}", setting to null`);
        const cleaned = { ...row, [fkCol]: null };
        return supabase.from(table).insert([cleaned]).select().maybeSingle();
      }
    }

    // Handle not-null violations by providing defaults
    if (msg.includes('null value in column')) {
      const nullMatch = msg.match(/column "(\w+)"/i);
      if (nullMatch) {
        const col = nullMatch[1];
        console.warn(`[API] Not-null constraint on "${col}", adding default`);
        const defaults: Record<string, any> = {
          created_by_name: 'Estudiante', nombre_estudiante: 'Estudiante',
          status: 'nuevo', estado: 'Nuevo',
          sla_deadline: new Date(Date.now() + 48 * 3600000).toISOString(),
        };
        if (col in defaults) {
          return supabase.from(table).insert([{ ...row, [col]: defaults[col] }]).select().maybeSingle();
        }
      }
    }
  }

  return { data, error };
}

// ============================================================
// PUBLIC API
// ============================================================

export const db = {
  tickets: {
    async getAll() {
      const schema = await detectSchema();
      return withRetry(async () => {
        const orderCol = schema === 'spanish' ? 'fecha_creacion' : 'created_at';
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order(orderCol, { ascending: false });
        
        if (error) {
          // If the order column doesn't exist, try the other one
          if (error.message?.includes(orderCol)) {
            const altCol = schema === 'spanish' ? 'created_at' : 'fecha_creacion';
            const { data: altData, error: altError } = await supabase
              .from('tickets')
              .select('*')
              .order(altCol, { ascending: false });
            if (altError) throw altError;
            // Update detected schema
            detectedSchema = schema === 'spanish' ? 'english' : 'spanish';
            return (altData || []).map(mapTicketFromDB);
          }
          throw error;
        }
        return (data || []).map(mapTicketFromDB);
      });
    },

    async create(ticket: Partial<Ticket>) {
      const schema = await detectSchema();
      try {
        const dbData = mapTicketToDB(ticket, schema);
        const { data, error } = await safeInsert('tickets', dbData);

        if (error) {
          // Last resort: try with the OTHER schema
          console.warn('[API] Insert failed with', schema, 'schema, trying alternate');
          const altSchema = schema === 'spanish' ? 'english' : 'spanish';
          const altData = mapTicketToDB(ticket, altSchema);
          const { data: altResult, error: altError } = await safeInsert('tickets', altData);
          
          if (altError) {
            throw new Error(friendlyError(altError));
          }
          detectedSchema = altSchema;
          if (altResult) return mapTicketFromDB(altResult);
          // If no data returned, construct from input
          return { ...ticket, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Ticket;
        }

        if (data) return mapTicketFromDB(data);
        return { ...ticket, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Ticket;
      } catch (err: any) {
        console.error('[API] Ticket creation failed:', err);
        throw new Error(err.message || friendlyError(err));
      }
    },

    async updateStatus(id: string, status: TicketStatus) {
      const schema = await detectSchema();
      return withRetry(async () => {
        const updateData = schema === 'spanish'
          ? { estado: statusMap[status] }
          : { status: status };
        
        const { data, error } = await supabase
          .from('tickets')
          .update(updateData)
          .eq('id', id)
          .select()
          .maybeSingle();
        
        if (error) {
          // Try alternate schema
          const altData = schema === 'spanish'
            ? { status: status }
            : { estado: statusMap[status] };
          const { data: altResult, error: altError } = await supabase
            .from('tickets')
            .update(altData)
            .eq('id', id)
            .select()
            .maybeSingle();
          if (altError) throw new Error(friendlyError(altError));
          detectedSchema = schema === 'spanish' ? 'english' : 'spanish';
          if (altResult) return mapTicketFromDB(altResult);
          // If no data returned, return a minimal object
          return { id, status } as Ticket;
        }
        
        if (data) return mapTicketFromDB(data);
        // If update succeeded but no row returned (RLS or trigger), return minimal
        return { id, status } as Ticket;
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
        console.warn('Audit table fetch failed, returning empty:', error.message);
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
    async create(entry: Partial<AuditEntry>) {
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
        if (error) {
          console.warn('Failed to log audit (non-blocking):', error.message);
        }
      } catch (err) {
        // Audit failures should never block the main flow
        console.warn('Audit logging error (non-blocking):', err);
      }
    },
  },

  surveys: {
    async getAll() {
      const { data, error } = await supabase.from('surveys').select('*');
      if (error) {
        console.warn('Surveys table fetch failed, returning empty:', error.message);
        return [];
      }
      return (data || []).map((s: any) => ({
        id: s.id,
        ticketId: s.ticket_id,
        userId: s.user_id,
        csat: s.csat_score || s.csat || 3,
        ces: s.ces_score || s.ces || 3,
        comment: s.comment,
        createdAt: s.created_at,
      }));
    },
    async create(survey: Partial<Survey>) {
      try {
        const { error } = await supabase.from('surveys').insert([{
          ticket_id: survey.ticketId,
          user_id: survey.userId || null,
          csat_score: survey.csat,
          ces_score: survey.ces,
          comment: survey.comment,
        }]);
        if (error) console.error('Failed to save survey:', error.message);
      } catch (err) {
        console.warn('Survey save error (non-blocking):', err);
      }
    },
  },

  users: {
    async getAll() {
      // Try staff_users first, then users
      const { data, error } = await supabase.from('staff_users').select('*');
      if (error) {
        const { data: userData, error: userError } = await supabase.from('users').select('*');
        if (userError) {
          console.warn('Users tables not available, returning empty:', userError.message);
          return [];
        }
        return (userData || []).map((u: any) => ({
          id: u.id,
          name: u.nombre || u.name || u.email?.split('@')[0] || 'Usuario',
          email: u.email,
          role: u.rol || u.role || 'Estudiante',
          department: u.departamento || u.department,
        }));
      }
      return (data || []).map((u: any) => ({
        id: u.id,
        name: u.nombre || u.name || 'Staff',
        email: u.email,
        role: u.rol || u.role || 'Consejo',
        department: u.departamento || u.department,
      }));
    },
  },
};
