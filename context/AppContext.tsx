"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, AuditEntry, Survey, SLAConfig, TicketStatus,
  generateId, STORAGE_KEYS, loadFromStorage, User, AdminRole,
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
import { enqueueSubmission, startAutoSync } from "@/lib/offline-queue";
import { useToast, type ToastAPI } from "@/lib/useToast";
import { ToastContainer } from "@/components/Toast";


export interface UserProfile {
  id: string;
  nombre?: string;
  name?: string;
  email: string;
  rol?: string;
  role?: string;
  departamento?: string;
  department?: string;
}

interface AppState {
  tickets: Ticket[];
  audit: AuditEntry[];
  surveys: Survey[];
  slaConfig: SLAConfig[];
  agents: User[];
  user: AuthUser | null;
  role: AdminRole | null;
  profile: UserProfile | null;
  isLoading: boolean;
  toastAPI: ToastAPI;
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo" | "slaDeadline">) => Promise<Ticket>;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
  addAuditEntry: (entry: AuditEntry) => void;
  addSurvey: (survey: Omit<Survey, "id" | "createdAt">) => Promise<void>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  getAuditForTicket: (ticketId: string) => AuditEntry[];
  isServerOnline: boolean;
  isInitializing: boolean;
  isAuthLoading: boolean;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [slaConfig, setSlaConfig] = useState<SLAConfig[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agents, setAgents] = useState<User[]>(adminUsers);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const toastAPI = useToast();

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Sync Auth State & Fetch Role
  useEffect(() => {
    const syncUserAndRole = async (sessionUser: AuthUser | null) => {
      setIsAuthLoading(true);

      // --- LOCALHOST BYPASS ---
      // Auto-login para desarrollo sin afectar producción en Vercel/GitHub
      const bypassDisabled = typeof window !== 'undefined' && localStorage.getItem("localhost_bypass_disabled") === 'true';
      if (typeof window !== 'undefined' && !bypassDisabled && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        console.warn("🔧 Localhost Bypass Activado: Iniciando sesión automáticamente como Admin TI");
        setUser({ id: "dev-bypass-id", email: "admin@localhost" } as AuthUser);
        setRole("Admin_TI");
        setProfile({ id: "dev-bypass-id", email: "admin@localhost", name: "Desarrollador Local", role: "Admin_TI" });
        setIsAuthLoading(false);
        return;
      }
      // ------------------------
      // BARRERA DE SEGURIDAD SECUNDARIA: Validación de Dominio (Solo para Google)
      const isGoogleLogin = sessionUser?.app_metadata?.provider === 'google';
      const email = sessionUser?.email;
      
      if (sessionUser && isGoogleLogin && email && !email.endsWith("@duocuc.cl")) {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        setIsAuthLoading(false);
        window.location.href = "/login?error=invalid_domain";
        return;
      }

      setUser(sessionUser);
      if (sessionUser) {
        const { data: staffData, error: staffError } = await supabase
          .from("staff_users")
          .select("*")
          .eq("id", sessionUser.id)
          .single();
        
        if (staffData && !staffError) {
          setRole(staffData.rol as AdminRole);
          setProfile(staffData);
        } else {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", sessionUser.id)
            .single();

          if (userData && !userError) {
            setRole(userData.rol as AdminRole);
            setProfile(userData);
          } else {
            setRole("Estudiante");
            setProfile(null);
          }
        }
      } else {
        setRole(null);
        setProfile(null);
      }
      setIsAuthLoading(false);
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
        
        // Si hay error de ping, probamos de nuevo una vez antes de rendirnos
        if (pingError) {
           console.warn("Ping fallback attempt...");
           const { error: retryError } = await supabase.from('tickets').select('id').limit(1);
           if (retryError) throw retryError;
        }

        const [dbTickets, dbAudit, dbSurveys, dbUsers] = await Promise.all([
          db.tickets.getAll(),
          db.audit.getAll(),
          db.surveys.getAll(),
          db.users.getAll()
        ]);
        
        setTickets(dbTickets);
        setAudit(dbAudit);
        setSurveys(dbSurveys);
        
        // Solo actualizamos agents si hay datos nuevos y son diferentes
        if (dbUsers.length > 0) {
          setAgents(dbUsers);
        }
        
        setSlaConfig(loadFromStorage(STORAGE_KEYS.sla, mockSLAConfig));
        setIsServerOnline(true);
      } catch (err) {
        console.error("Critical: Server is offline or connection failed:", err);
        // Si estamos offline pero tenemos datos en memoria/local, no bloqueamos la app
        // Pero marcamos que estamos en modo offline
        setIsServerOnline(false);
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    }
    loadData();
  }, []); // Solo al montar



  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("Browser back online, checking server...");
      // Re-fetch data or just set server online if ping works
      supabase.from('tickets').select('id').limit(1).then(({ error }) => {
        if (!error) setIsServerOnline(true);
      });
    };
    const handleOffline = () => setIsServerOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

      const name = ticketData.createdByName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Estudiante";
      const email = ticketData.createdBy || user?.email || "";
      const formattedName = email ? `${name} <${email}>` : name;

      const ticketToCreate = {
        ...ticketData,
        createdBy: user?.id || ticketData.createdBy,
        createdByName: formattedName,
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
      } catch (err: unknown) {
        if (!navigator.onLine) {
          enqueueSubmission(ticketToCreate);
          const mockTicket = {
            ...ticketToCreate,
            id: `offline-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Ticket;
          setTickets((prev) => [mockTicket, ...prev]);
          toastAPI.warning("Guardado offline. Se enviará automáticamente al reconectarte.");
          return mockTicket;
        }

        const message = err instanceof Error ? err.message : "Error al crear la solicitud.";
        console.error("Error creating ticket:", err);
        toastAPI.error(message);
        throw err;
      }
    },
    [slaConfig, agents, user, toastAPI]
  );

  useEffect(() => {
    if (isInitializing) return;

    const stopSync = startAutoSync(async (data) => {
      // Cast to the type addTicket expects
      await addTicket(data as any);
    }, (res) => {
      if (res.success > 0) {
        toastAPI.success(`Sincronizadas ${res.success} solicitudes pendientes.`);
      }
    });

    return () => {
      stopSync();
    };
  }, [isInitializing, addTicket, toastAPI]);

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
      } catch (err: unknown) {
        // Revert optimistic update
        setTickets(previousTickets);
        const message = err instanceof Error ? err.message : "Error al mover el ticket.";
        toastAPI.error(message);
        console.error("Error moving ticket:", err);
      }
    },
    [user, tickets, toastAPI]
  );

  const updateTicket = useCallback(
    async (ticketId: string, updates: Partial<Ticket>) => {
      // Optimistic update
      const previousTickets = tickets;
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t)));

      try {
        const updatedTicket = await db.tickets.update(ticketId, updates);
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? updatedTicket : t)));
        
        // Log assignment if changed
        if (updates.assignedTo) {
          const auditEntry = logAssignment(ticketId, updates.assignedTo, "Manual or Auto-assignment");
          await db.audit.create(auditEntry);
          setAudit((prev) => [...prev, auditEntry]);
        }
        
        // Log status if changed
        if (updates.status) {
          const auditEntry = logStatusChange(ticketId, (user?.id || null) as any, user?.email || "Sistema", "status_update", updates.status);
          await db.audit.create(auditEntry);
          setAudit((prev) => [...prev, auditEntry]);
        }
      } catch (err: unknown) {
        setTickets(previousTickets);
        console.error("Error updating ticket:", err);
      }
    },
    [user, tickets]
  );

  const addSurvey = useCallback(async (surveyData: Omit<Survey, "id" | "createdAt">) => {
    try {
      await db.surveys.create(surveyData);
      const newSurvey: Survey = { ...surveyData, id: generateId(), createdAt: new Date().toISOString() };
      setSurveys((prev) => [...prev, newSurvey]);
      toastAPI.success("¡Gracias por tu feedback!");
    } catch (err: unknown) {
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
        updateTicket,
        getTicketsByStatus,
        getAuditForTicket,
        isServerOnline,
        isInitializing,
        isAuthLoading,
      }}
    >
      {isInitializing ? null : !isServerOnline && tickets.length === 0 ? (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
            <Icon icon="lucide:server-off" className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Servidor no disponible</h2>
          <p className="text-slate-500 max-w-sm mb-8">No hemos podido establecer conexión con el sistema central. Por favor, verifica tu conexión a internet o intenta más tarde.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-brand-blue text-white font-bold rounded-2xl shadow-lg shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Reintentar Conexión
          </button>
          <button 
            onClick={() => { window.location.href = "/logout"; }}
            className="mt-4 text-xs text-slate-400 hover:text-rose-600 font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Icon icon="lucide:shield-alert" className="w-3.5 h-3.5" />
            Cerrar sesión y Limpiar Caché
          </button>
        </div>
      ) : (
        <>
          {children}
          <OfflineBanner isOnline={isServerOnline} />
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

function OfflineBanner({ isOnline }: { isOnline: boolean }) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-3rem)] max-w-sm"
        >
          <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <Icon icon="lucide:wifi-off" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Modo Offline</p>
              <p className="text-[10px] text-white/60 font-medium leading-tight">Trabajando con datos locales. Algunas funciones pueden estar limitadas.</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
