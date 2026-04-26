"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  Ticket, AuditEntry, Survey, SLAConfig, TicketStatus,
  mockTickets, mockAuditEntries, mockSurveys, mockSLAConfig,
  adminUsers, generateId, STORAGE_KEYS, loadFromStorage, saveToStorage, User,
} from "@/lib/data";
import { logStatusChange, logAssignment, logTicketCreation } from "@/lib/audit";
import { routeTicket } from "@/lib/routing";

export type AdminRole = "Consejero" | "Administrador TI";

interface AppState {
  tickets: Ticket[];
  audit: AuditEntry[];
  surveys: Survey[];
  slaConfig: SLAConfig[];
  agents: User[];
  adminRole: AdminRole;
  setAdminRole: (role: AdminRole) => void;
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "slaDeadline">) => Ticket;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => void;
  addAuditEntry: (entry: AuditEntry) => void;
  addSurvey: (survey: Omit<Survey, "id" | "createdAt">) => void;
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

  // Load data from localStorage on mount
  useEffect(() => {
    setTickets(loadFromStorage(STORAGE_KEYS.tickets, mockTickets));
    setAudit(loadFromStorage(STORAGE_KEYS.audit, mockAuditEntries));
    setSurveys(loadFromStorage(STORAGE_KEYS.surveys, mockSurveys));
    setSlaConfig(loadFromStorage(STORAGE_KEYS.sla, mockSLAConfig));
    setInitialized(true);
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.tickets, tickets);
  }, [tickets, initialized]);

  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.audit, audit);
  }, [audit, initialized]);

  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.surveys, surveys);
  }, [surveys, initialized]);

  const addAuditEntry = useCallback((entry: AuditEntry) => {
    setAudit((prev) => [...prev, entry]);
  }, []);

  const addTicket = useCallback(
    (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "slaDeadline">) => {
      // Route the ticket intelligently
      const routing = routeTicket({ category: ticketData.category, urgency: ticketData.urgency }, adminUsers);

      // Calculate SLA deadline
      const sla = slaConfig.find((s) => s.category === ticketData.category && s.urgency === ticketData.urgency);
      const slaHours = sla?.maxHours ?? 48;
      const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();

      const newTicket: Ticket = {
        ...ticketData,
        id: generateId(),
        status: routing.status,
        assignedTo: routing.assignedTo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDeadline,
      };

      setTickets((prev) => [newTicket, ...prev]);

      // Audit entries
      const creationEntry = logTicketCreation(newTicket.id);
      const assignmentEntry = logAssignment(
        newTicket.id,
        adminUsers.find((a) => a.id === routing.assignedTo)?.name ?? "Desconocido",
        routing.reason
      );
      setAudit((prev) => [...prev, creationEntry, assignmentEntry]);

      return newTicket;
    },
    [slaConfig]
  );

  const moveTicket = useCallback(
    (ticketId: string, newStatus: TicketStatus) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          const oldStatus = t.status;
          const auditEntry = logStatusChange(ticketId, "u1", "Valentina Rojas", oldStatus, newStatus);
          setAudit((prevAudit) => [...prevAudit, auditEntry]);
          return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
        })
      );
    },
    []
  );

  const addSurvey = useCallback((surveyData: Omit<Survey, "id" | "createdAt">) => {
    const newSurvey: Survey = {
      ...surveyData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setSurveys((prev) => [...prev, newSurvey]);
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
