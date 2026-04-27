"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  Ticket, AuditEntry, Survey, SLAConfig, TicketStatus,
  generateId, STORAGE_KEYS, loadFromStorage, User,
} from "@/lib/data";
import {
  mockTickets, mockAuditEntries, mockSurveys, mockSLAConfig, adminUsers
} from "@/lib/mock";
import { logStatusChange, logAssignment, logTicketCreation } from "@/lib/audit";
import { routeTicket } from "@/lib/routing";
import { supabase } from "@/lib/supabase";
import { User as AuthUser } from "@supabase/supabase-js";
import { db } from "@/lib/api";

export type AdminRole = "Estudiante" | "Consejero" | "Admin_TI";

interface AppState {
  tickets: Ticket[];
  audit: AuditEntry[];
  surveys: Survey[];
  slaConfig: SLAConfig[];
  agents: User[];
  user: AuthUser | null;
  role: AdminRole | null;
  profile: any | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [agents, setAgents] = useState<User[]>(adminUsers);
  const [initialized, setInitialized] = useState(false);

  // Sync Auth State & Fetch Role
  useEffect(() => {
    const syncUserAndRole = async (sessionUser: AuthUser | null) => {
      // BARRERA DE SEGURIDAD SECUNDARIA: Validación de Dominio (Solo para Google)
      const isGoogleLogin = sessionUser?.app_metadata?.provider === 'google';
      if (sessionUser && isGoogleLogin && !sessionUser.email?.endsWith("@duocuc.cl")) {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        window.location.href = "/login?error=invalid_domain";
        return;
      }

      setUser(sessionUser);
      if (sessionUser) {
        // Primero intentamos buscar en staff_users
        const { data: staffData, error: staffError } = await supabase
          .from("staff_users")
          .select("*")
          .eq("id", sessionUser.id)
          .single();
        
        if (staffData && !staffError) {
          setRole(staffData.rol as AdminRole);
          setProfile(staffData);
        } else {
          // Si no es staff, buscamos en users (estudiantes)
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", sessionUser.id)
            .single();

          if (userData && !userError) {
            setRole(userData.rol as AdminRole);
            setProfile(userData);
          } else {
            setRole("Estudiante"); // Fallback
            setProfile(null);
          }
        }
      } else {
        setRole(null);
        setProfile(null);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      syncUserAndRole(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [dbTickets, dbAudit, dbSurveys, dbUsers] = await Promise.all([
          db.tickets.getAll(),
          db.audit.getAll(),
          db.surveys.getAll(),
          db.users.getAll()
        ]);
        
        if (dbTickets.length > 0) {
          setTickets(dbTickets);
          setAudit(dbAudit);
          setSurveys(dbSurveys);
          setAgents(dbUsers);
        } else {
          // Si no hay datos, inicializamos con los fallbacks
          setTickets([]);
          setAudit([]);
          setSurveys([]);
          setAgents(adminUsers);
        }
        
        setSlaConfig(loadFromStorage(STORAGE_KEYS.sla, mockSLAConfig));
        setInitialized(true);
      } catch (err) {
        console.error("Supabase load error, falling back to minimal state:", err);
        setAgents(adminUsers);
        setSlaConfig(loadFromStorage(STORAGE_KEYS.sla, mockSLAConfig));
        setInitialized(true);
      }
    }
    loadData();
  }, []);

  const addAuditEntry = useCallback((entry: AuditEntry) => {
    setAudit((prev) => [...prev, entry]);
  }, []);

  const addTicket = useCallback(
    async (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "slaDeadline">) => {
      const routing = routeTicket({ category: ticketData.category, urgency: ticketData.urgency }, agents);
      const sla = slaConfig.find((s) => s.category === ticketData.category && s.urgency === ticketData.urgency);
      const slaHours = sla?.maxHours ?? 48;
      const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();

      const ticketToCreate = {
        ...ticketData,
        createdBy: user?.id || ticketData.createdBy,
        createdByName: user?.email || ticketData.createdByName || "Estudiante",
        status: routing.status,
        assignedTo: routing.assignedTo,
        slaDeadline,
      };

      try {
        const newTicket = await db.tickets.create(ticketToCreate);
        setTickets((prev) => [newTicket, ...prev]);

        const creationEntry = logTicketCreation(newTicket.id);
        const assignmentEntry = logAssignment(
          newTicket.id,
          agents.find((a) => a.id === routing.assignedTo)?.name ?? "Desconocido",
          routing.reason
        );

        await Promise.all([
          db.audit.create(creationEntry),
          db.audit.create(assignmentEntry)
        ]);

        setAudit((prev) => [...prev, creationEntry, assignmentEntry]);
        return newTicket;
      } catch (err) {
        console.error("Error creating ticket:", err);
        const fallbackTicket: Ticket = { ...ticketToCreate, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setTickets((prev) => [fallbackTicket, ...prev]);
        return fallbackTicket;
      }
    },
    [slaConfig, agents, user]
  );

  const moveTicket = useCallback(
    async (ticketId: string, newStatus: TicketStatus) => {
      try {
        const updatedTicket = await db.tickets.updateStatus(ticketId, newStatus);
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? updatedTicket : t)));
        const auditEntry = logStatusChange(ticketId, user?.id || "system", user?.email || "Sistema", "status_change", newStatus);
        await db.audit.create(auditEntry);
        setAudit((prevAudit) => [...prevAudit, auditEntry]);
      } catch (err) {
        console.error("Error moving ticket:", err);
      }
    },
    [user]
  );

  const addSurvey = useCallback(async (surveyData: Omit<Survey, "id" | "createdAt">) => {
    try {
      await db.surveys.create(surveyData);
      const newSurvey: Survey = { ...surveyData, id: generateId(), createdAt: new Date().toISOString() };
      setSurveys((prev) => [...prev, newSurvey]);
    } catch (err) {
      console.error("Error adding survey:", err);
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
        agents,
        user,
        role,
        profile,
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
