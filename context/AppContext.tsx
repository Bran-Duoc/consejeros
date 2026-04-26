"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  Ticket, AuditEntry, Survey, SLAConfig, TicketStatus,
  mockTickets, mockAuditEntries, mockSurveys, mockSLAConfig,
  adminUsers, generateId, STORAGE_KEYS, loadFromStorage, saveToStorage, User,
} from "@/lib/data";
import { logStatusChange, logAssignment, logTicketCreation } from "@/lib/audit";
import { routeTicket } from "@/lib/routing";
import { db } from "@/lib/api";

export type AdminRole = "Consejero" | "Administrador TI";

interface AppState {
  tickets: Ticket[];
  audit: AuditEntry[];
  surveys: Survey[];
  slaConfig: SLAConfig[];
  agents: User[];
  adminRole: AdminRole;
  setAdminRole: (role: AdminRole) => void;
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "slaDeadline">) => Promise<Ticket>;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
  addAuditEntry: (entry: AuditEntry) => void;
  addSurvey: (survey: Omit<Survey, "id" | "createdAt">) => Promise<void>;
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  getAuditForTicket: (ticketId: string) => AuditEntry[];
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [slaConfig, setSlaConfig] = useState<SLAConfig[]>([]);
  const [adminRole, setAdminRole] = useState<AdminRole>("Consejero");
  const [initialized, setInitialized] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [dbTickets, dbAudit, dbSurveys] = await Promise.all([
          db.tickets.getAll(),
          db.audit.getAll(),
          db.surveys.getAll()
        ]);
        
        // If DB is empty, use mock data (optional, but good for first run)
        if (dbTickets.length === 0) {
          setTickets(loadFromStorage(STORAGE_KEYS.tickets, mockTickets));
          setAudit(loadFromStorage(STORAGE_KEYS.audit, mockAuditEntries));
          setSurveys(loadFromStorage(STORAGE_KEYS.surveys, mockSurveys));
        } else {
          setTickets(dbTickets);
          setAudit(dbAudit);
          setSurveys(dbSurveys);
        }
        
        setSlaConfig(loadFromStorage(STORAGE_KEYS.sla, mockSLAConfig));
        setInitialized(true);
      } catch (err) {
        console.error("Supabase load error, falling back to LocalStorage:", err);
        setTickets(loadFromStorage(STORAGE_KEYS.tickets, mockTickets));
        setAudit(loadFromStorage(STORAGE_KEYS.audit, mockAuditEntries));
        setSurveys(loadFromStorage(STORAGE_KEYS.surveys, mockSurveys));
        setSlaConfig(loadFromStorage(STORAGE_KEYS.sla, mockSLAConfig));
        setInitialized(true);
      }
    }
    loadData();
  }, []);

  // No longer needed: we save directly to DB in the actions below
  // Keeping LocalStorage as a secondary backup if desired, but cleaned up for now.
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.tickets, tickets);
  }, [tickets, initialized]);

  const addAuditEntry = useCallback((entry: AuditEntry) => {
    setAudit((prev) => [...prev, entry]);
  }, []);

  const addTicket = useCallback(
    async (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "slaDeadline">) => {
      // Route the ticket intelligently
      const routing = routeTicket({ category: ticketData.category, urgency: ticketData.urgency }, adminUsers);

      // Calculate SLA deadline
      const sla = slaConfig.find((s) => s.category === ticketData.category && s.urgency === ticketData.urgency);
      const slaHours = sla?.maxHours ?? 48;
      const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();

      // Ensure createdBy is a valid UUID for the schema (or a placeholder)
      // Since we don't have auth yet, we use a constant UUID if it's not one
      const createdBy = ticketData.createdBy.length > 20 ? ticketData.createdBy : "00000000-0000-0000-0000-000000000000";

      const ticketToCreate = {
        ...ticketData,
        createdBy,
        status: routing.status,
        assignedTo: routing.assignedTo,
        slaDeadline,
      };

      try {
        const newTicket = await db.tickets.create(ticketToCreate);
        setTickets((prev) => [newTicket, ...prev]);

        // Audit entries
        const creationEntry = logTicketCreation(newTicket.id);
        const assignmentEntry = logAssignment(
          newTicket.id,
          adminUsers.find((a) => a.id === routing.assignedTo)?.name ?? "Desconocido",
          routing.reason
        );

        await Promise.all([
          db.audit.create(creationEntry),
          db.audit.create(assignmentEntry)
        ]);

        setAudit((prev) => [...prev, creationEntry, assignmentEntry]);
        return newTicket;
      } catch (err) {
        console.error("Error creating ticket in Supabase:", err);
        // Fallback for UI if DB fails
        const fallbackTicket: Ticket = { ...ticketToCreate, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setTickets((prev) => [fallbackTicket, ...prev]);
        return fallbackTicket;
      }
    },
    [slaConfig]
  );

  const moveTicket = useCallback(
    async (ticketId: string, newStatus: TicketStatus) => {
      try {
        const updatedTicket = await db.tickets.updateStatus(ticketId, newStatus);
        
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? updatedTicket : t))
        );

        const auditEntry = logStatusChange(ticketId, "00000000-0000-0000-0000-000000000000", "Valentina Rojas", "status_change", newStatus);
        await db.audit.create(auditEntry);
        setAudit((prevAudit) => [...prevAudit, auditEntry]);
      } catch (err) {
        console.error("Error moving ticket in Supabase:", err);
        // Local only fallback
        setTickets((prev) =>
          prev.map((t) => {
            if (t.id !== ticketId) return t;
            return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
          })
        );
      }
    },
    []
  );

  const addSurvey = useCallback(async (surveyData: Omit<Survey, "id" | "createdAt">) => {
    try {
      await db.surveys.create(surveyData);
      // Re-fetch or just update local state
      const newSurvey: Survey = { ...surveyData, id: generateId(), createdAt: new Date().toISOString() };
      setSurveys((prev) => [...prev, newSurvey]);
    } catch (err) {
      console.error("Error adding survey to Supabase:", err);
    }
  }, []);

  const getTicketsByStatus = useCallback(
    (status: TicketStatus) => tickets.filter((t) => t.status === status),
    [tickets]
  );

  const getAuditForTicket = useCallback(
    (ticketId: string) => audit.filter((a) => a.ticketId === ticketId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [audit]
  );

  return (
    <AppContext.Provider
      value={{
        tickets,
        audit,
        surveys,
        slaConfig,
        agents: adminUsers,
        adminRole,
        setAdminRole,
        addTicket,
        moveTicket,
        addAuditEntry,
        addSurvey,
        getTicketsByStatus,
        getAuditForTicket,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
