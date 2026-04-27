import { supabase } from './supabase';
import { Ticket, AuditEntry, Survey, TicketStatus } from './data';

// Helper to map snake_case from DB (Schema v2) to camelCase for App
const mapTicketFromDB = (t: any): Ticket => ({
  id: t.id,
  title: t.titulo || t.title, // Handle both for safety
  description: t.descripcion || t.description,
  category: t.categoria || t.category,
  urgency: t.nivel_urgencia || t.urgency,
  status: t.estado || t.status,
  assignedTo: null, // assigned_to removed in v2 schema requirements
  createdBy: t.estudiante_id || t.created_by,
  createdByName: t.created_by_name || "Usuario",
  createdAt: t.fecha_creacion || t.created_at,
  updatedAt: t.fecha_creacion || t.updated_at,
  slaDeadline: t.sla_deadline,
  attachments: t.attachments || [],
  tags: t.tags || [],
});

const mapTicketToDB = (t: Partial<Ticket>) => ({
  titulo: t.title,
  descripcion: t.description,
  categoria: t.category,
  nivel_urgencia: t.urgency,
  estado: t.status,
  estudiante_id: t.createdBy,
  sla_deadline: t.slaDeadline,
});

export const db = {
  tickets: {
    async getAll() {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapTicketFromDB);
    },
    async create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) {
      const { data, error } = await supabase
        .from('tickets')
        .insert([mapTicketToDB(ticket)])
        .select()
        .single();
      if (error) throw error;
      return mapTicketFromDB(data);
    },
    async updateStatus(id: string, status: TicketStatus) {
      const { data, error } = await supabase
        .from('tickets')
        .update({ estado: status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return mapTicketFromDB(data);
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

