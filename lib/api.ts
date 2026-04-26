import { supabase } from './supabase';
import { Ticket, AuditEntry, Survey, TicketStatus } from './data';

// Helper to map snake_case from DB to camelCase for App
const mapTicketFromDB = (t: any): Ticket => ({
  id: t.id,
  title: t.title,
  description: t.description,
  category: t.category,
  urgency: t.urgency,
  status: t.status,
  assignedTo: t.assigned_to,
  createdBy: t.created_by,
  createdByName: t.created_by_name,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
  slaDeadline: t.sla_deadline,
  attachments: t.attachments,
  tags: t.tags,
});

const mapTicketToDB = (t: Partial<Ticket>) => ({
  title: t.title,
  description: t.description,
  category: t.category,
  urgency: t.urgency,
  status: t.status,
  assigned_to: t.assignedTo,
  created_by: t.createdBy, // Note: must be UUID or valid string depending on DB
  created_by_name: t.createdByName,
  sla_deadline: t.slaDeadline,
  attachments: t.attachments,
  tags: t.tags,
});

export const db = {
  tickets: {
    async getAll() {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
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
        .update({ status, updated_at: new Date().toISOString() })
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
      if (error) throw error;
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
      if (error) throw error;
    },
  },
  surveys: {
    async getAll() {
      const { data, error } = await supabase.from('surveys').select('*');
      if (error) throw error;
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
      if (error) throw error;
    },
  },
};
