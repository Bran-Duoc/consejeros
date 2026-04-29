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
import { Icon } from "@iconify/react";
import { db } from "@/lib/api";
import { useToast, type ToastAPI } from "@/lib/useToast";
import { ToastContainer } from "@/components/Toast";

export type AdminRole = "Estudiante" | "Supervisor" | "Consejo" | "Admin TI" | "Admin_TI";

interface AppState {
  tickets: Ticket[];
  audit: AuditEntry[];
  surveys: Survey[];
  slaConfig: SLAConfig[];
  agents: User[];
  user: AuthUser | null;
  role: AdminRole | null;
  profile: any | null;
  isLoading: boolean;
  toastAPI: ToastAPI;
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "slaDeadline">) => Promise<Ticket>;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
  addAuditEntry: (entry: AuditEntry) => void;
  addSurvey: (survey: Omit<Survey, "id" | "createdAt">) => Promise<void>;
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  getAuditForTicket: (ticketId: string) => AuditEntry[];
  isServerOnline: boolean;
  isInitializing: boolean;
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
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toastAPI = useToast();

  // Handle Splash Screen Delayed Exit
  useEffect(() => {
    if (!isInitializing) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const completeTimer = setTimeout(() => {
          setIsSplashComplete(true);
        }, 800); // Match splash-exit duration
        return () => clearTimeout(completeTimer);
      }, 1000); // Minimum 1s after loading
      return () => clearTimeout(exitTimer);
    }
  }, [isInitializing]);

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
      setIsLoading(true);
      try {
        // Ping Supabase to check connectivity
        const { error: pingError } = await supabase.from('tickets').select('id').limit(1);
        if (pingError) throw pingError;

        const [dbTickets, dbAudit, dbSurveys, dbUsers] = await Promise.all([
          db.tickets.getAll(),
          db.audit.getAll(),
          db.surveys.getAll(),
          db.users.getAll()
        ]);
        
        setTickets(dbTickets);
        setAudit(dbAudit);
        setSurveys(dbSurveys);
        setAgents(dbUsers.length > 0 ? dbUsers : adminUsers);
        setSlaConfig(loadFromStorage(STORAGE_KEYS.sla, mockSLAConfig));
        
        setIsServerOnline(true);
      } catch (err) {
        console.error("Critical: Server is offline or connection failed:", err);
        setIsServerOnline(false);
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Supabase Realtime — subscribe to ticket changes
  useEffect(() => {
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Import mapTicketFromDB is internal to api.ts, so we re-fetch
            db.tickets.getAll().then((fresh) => setTickets(fresh)).catch(console.error);
          } else if (payload.eventType === 'UPDATE') {
            db.tickets.getAll().then((fresh) => setTickets(fresh)).catch(console.error);
          } else if (payload.eventType === 'DELETE') {
            setTickets((prev) => prev.filter((t) => t.id !== payload.old?.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        assignedTo: routing.assignedTo && routing.assignedTo.includes('-') ? routing.assignedTo : null,
        slaDeadline,
      };

      try {
        const newTicket = await db.tickets.create(ticketToCreate);
        setTickets((prev) => [newTicket, ...prev]);

        // Audit logging is non-blocking — never fails the main operation
        try {
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
        } catch (auditErr) {
          console.warn("Audit logging failed (non-blocking):", auditErr);
        }

        toastAPI.success("¡Solicitud enviada exitosamente!");
        return newTicket;
      } catch (err: any) {
        console.error("Error creating ticket:", err);
        toastAPI.error(err.message || "Error al crear la solicitud.");
        throw err;
      }
    },
    [slaConfig, agents, user, toastAPI]
  );

  const moveTicket = useCallback(
    async (ticketId: string, newStatus: TicketStatus) => {
      // Optimistic update
      const previousTickets = tickets;
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));

      try {
        const updatedTicket = await db.tickets.updateStatus(ticketId, newStatus);
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? updatedTicket : t)));
        const auditEntry = logStatusChange(ticketId, (user?.id || null) as any, user?.email || "Sistema", "status_change", newStatus);
        await db.audit.create(auditEntry);
        setAudit((prevAudit) => [...prevAudit, auditEntry]);
        toastAPI.success("Estado actualizado correctamente.");
      } catch (err: any) {
        // Revert optimistic update
        setTickets(previousTickets);
        toastAPI.error(err.message || "Error al mover el ticket.");
        console.error("Error moving ticket:", err);
      }
    },
    [user, tickets, toastAPI]
  );

  const addSurvey = useCallback(async (surveyData: Omit<Survey, "id" | "createdAt">) => {
    try {
      await db.surveys.create(surveyData);
      const newSurvey: Survey = { ...surveyData, id: generateId(), createdAt: new Date().toISOString() };
      setSurveys((prev) => [...prev, newSurvey]);
      toastAPI.success("¡Gracias por tu feedback!");
    } catch (err: any) {
      console.error("Error adding survey:", err);
      toastAPI.error("No se pudo enviar la encuesta. Intenta de nuevo.");
    }
  }, [toastAPI]);

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
        isLoading,
        toastAPI,
        addTicket,
        moveTicket,
        addAuditEntry,
        addSurvey,
        getTicketsByStatus,
        getAuditForTicket,
        isServerOnline,
        isInitializing,
      }}
    >
      {!isSplashComplete ? (
        <div className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center splash-container ${isExiting ? "exit" : ""}`}>
          <div className="flex flex-col items-center gap-8">
            <div className="splash-logo">
              <img src="/logo.svg" alt="Logo" className="w-40 h-40 object-contain" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h2 className="splash-text text-2xl font-black text-slate-800 tracking-tight">Sede Viña del Mar</h2>
              {/* Color Squares Loader */}
              <div className="squares-loader">
                <div className="square" />
                <div className="square" />
                <div className="square" />
                <div className="square" />
                <div className="square" />
                <div className="square" />
                <div className="square" />
              </div>
            </div>
          </div>
        </div>
      ) : !isServerOnline ? (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-red-light flex items-center justify-center mb-6">
            <Icon icon="lucide:server-off" className="w-10 h-10 text-brand-red" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Servidor no disponible</h2>
          <p className="text-slate-500 max-w-sm mb-8">No hemos podido establecer conexión con el sistema central. Por favor, verifica tu conexión a internet o intenta más tarde.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-brand-blue text-white font-bold rounded-2xl shadow-lg shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Reintentar Conexión
          </button>
        </div>
      ) : (
        <>
          {children}
          <ToastContainer toasts={toastAPI.toasts} onDismiss={toastAPI.dismiss} />
        </>
      )}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
