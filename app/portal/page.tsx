"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";
import {
  statusLabels,
  statusColors,
  categoryIcons,
  urgencyLabels,
  TicketCategory,
  UrgencyLevel,
  TicketStatus,
} from "@/lib/data";
import { calculateSLAStatus } from "@/lib/sla";
import type { User } from "@supabase/supabase-js";

// ---- Constantes de dominio institucional ----
const ALLOWED_DOMAINS = ["@duoc.cl", "@duocuc.cl"];
const isValidDomain = (email: string) =>
  ALLOWED_DOMAINS.some((d) => email.toLowerCase().endsWith(d));

// ============================================================
// PANTALLA: Login con Magic Link
// ============================================================
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const emailValid = email.includes("@") && isValidDomain(email);
  const showDomainError = email.length > 3 && !emailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;
    setStatus("loading");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        shouldCreateUser: false, // Solo login, no registro
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message.includes("not found") || error.message.includes("not authorized")
          ? "No encontramos una cuenta Duoc UC con este correo. Contacta al Consejo de Sede."
          : "Error al enviar el enlace. Inténtalo nuevamente."
      );
    } else {
      setStatus("sent");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8 sm:p-10">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.svg" alt="Sede Viña del Mar" className="w-[121px] h-[40px] object-contain mb-5" />
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Icon icon="lucide:layout-dashboard" className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center">Mi Portal</h1>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-xs">
              Ingresa con tu correo Duoc UC para ver el estado de tus solicitudes.
            </p>
          </div>

          {/* Estado enviado */}
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-4 py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Icon icon="lucide:mail-check" className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-slate-800 text-lg">Enlace enviado</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Revisa tu bandeja en{" "}
                  <span className="font-medium text-indigo-600">{email}</span>.
                  El enlace expira en 10 minutos.
                </p>
              </div>
              <button
                onClick={() => { setStatus("idle"); setEmail(""); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition"
              >
                ← Usar otro correo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="portal-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Icon
                      icon="lucide:mail"
                      className={`w-4 h-4 transition-colors ${
                        showDomainError ? "text-rose-400" : emailValid ? "text-indigo-500" : "text-slate-400"
                      }`}
                    />
                  </div>
                  <input
                    id="portal-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@duoc.cl"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      showDomainError
                        ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                        : emailValid
                        ? "border-indigo-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
                    }`}
                  />
                </div>

                {showDomainError && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-fade-in">
                    <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 shrink-0" />
                    Solo se admiten correos @duoc.cl o @duocuc.cl
                  </p>
                )}
                {emailValid && (
                  <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1 animate-fade-in">
                    <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 shrink-0" />
                    Correo institucional válido
                  </p>
                )}
              </div>

              {status === "error" && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
                  <Icon icon="lucide:shield-x" className="w-4 h-4 shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={!emailValid || status === "loading"}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                           shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 hover:scale-[1.01]
                           active:scale-[0.99] transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                           flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> Enviando enlace…</>
                ) : (
                  <><Icon icon="lucide:send" className="w-4 h-4" /> Ingresar con Magic Link</>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Sin contraseñas — acceso seguro vía enlace institucional
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Sede Viña del Mar · Ley 21.719
        </p>
      </div>
    </main>
  );
}

// ============================================================
// PANTALLA: Mis Solicitudes (usuario autenticado)
// ============================================================
function PortalDashboard({ user }: { user: User }) {
  const { tickets, audit, addSurvey } = useApp();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState({ csat: 0, ces: 0, comment: "" });
  const [surveySubmitted, setSurveySubmitted] = useState<Set<string>>(new Set());

  // Filtrar tickets por el email del usuario autenticado
  const myTickets = tickets.filter(
    (t) =>
      t.createdBy === user.id ||
      t.createdByName.toLowerCase() === (user.email ?? "").toLowerCase() ||
      t.createdBy === user.email
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSurveySubmit = (ticketId: string) => {
    if (surveyData.csat === 0 || surveyData.ces === 0) return;
    addSurvey({
      ticketId,
      userId: user.id,
      csat: surveyData.csat,
      ces: surveyData.ces,
      comment: surveyData.comment,
    });
    setSurveySubmitted((prev) => new Set(prev).add(ticketId));
    setSurveyData({ csat: 0, ces: 0, comment: "" });
  };

  return (
    <main className="min-h-screen pt-32 pb-12 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mis Solicitudes</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {user.email} · {myTickets.length} solicitud(es)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/solicitud"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
            >
              <Icon icon="lucide:plus" className="w-4 h-4" /> Nueva Solicitud
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <Icon icon="lucide:log-out" className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Sin solicitudes */}
        {myTickets.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Icon icon="lucide:inbox" className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sin solicitudes aún</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              No tienes solicitudes registradas. Puedes enviar una ahora mismo.
            </p>
            <Link
              href="/solicitud"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
            >
              <Icon icon="lucide:mail" className="w-4 h-4" /> Enviar Solicitud
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myTickets.map((ticket) => {
              const sla = calculateSLAStatus(ticket.slaDeadline);
              const isSelected = selectedTicket === ticket.id;
              const ticketAudit = audit.filter((a) => a.ticketId === ticket.id);

              return (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-fade-in-up"
                >
                  {/* Ticket header — clickeable para expandir */}
                  <button
                    onClick={() => setSelectedTicket(isSelected ? null : ticket.id)}
                    className="w-full text-left p-5 hover:bg-slate-50 transition flex items-start gap-4"
                  >
                    <span className="text-2xl text-indigo-600 mt-0.5">
                      <Icon icon={categoryIcons[ticket.category as TicketCategory]} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[ticket.status as TicketStatus]}`}>
                          {statusLabels[ticket.status as TicketStatus]}
                        </span>
                        <span className="text-xs text-slate-400">
                          {urgencyLabels[ticket.urgency as UrgencyLevel]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800">{ticket.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>
                          SLA:{" "}
                          <span style={{ color: sla.color }} className="font-medium">
                            {sla.remainingFormatted}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString("es-CL")}</span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-300 shrink-0 transition-transform ${isSelected ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Detalle expandido */}
                  {isSelected && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50 animate-fade-in">
                      <p className="text-sm text-slate-600 mb-6">{ticket.description}</p>

                      {/* Timeline de auditoría */}
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Icon icon="lucide:history" className="w-4 h-4" /> Historial
                      </h4>
                      {ticketAudit.length > 0 ? (
                        <div className="space-y-3 mb-6">
                          {ticketAudit.map((entry) => (
                            <div key={entry.id} className="flex items-start gap-3 text-sm">
                              <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              <div>
                                <span className="text-slate-600">{entry.action}</span>
                                {entry.previousState && entry.newState && (
                                  <span className="text-slate-400">
                                    {" "}({entry.previousState} → {entry.newState})
                                  </span>
                                )}
                                <span className="block text-xs text-slate-400 mt-0.5">
                                  {entry.userName} — {new Date(entry.timestamp).toLocaleString("es-CL")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mb-6">Sin actividad registrada aún.</p>
                      )}

                      {/* Encuesta CSAT/CES — solo tickets resueltos */}
                      {ticket.status === "resuelto" && !surveySubmitted.has(ticket.id) && (
                        <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
                          <h4 className="font-semibold text-sm text-slate-800 mb-4 flex items-center gap-2">
                            <Icon icon="lucide:bar-chart-2" className="text-indigo-600" /> Ayúdanos a mejorar
                          </h4>
                          <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-2">¿Qué tan satisfecho estás? (CSAT 1-5)</p>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => setSurveyData((d) => ({ ...d, csat: n }))}
                                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                                    surveyData.csat >= n
                                      ? "bg-amber-400 text-white shadow-md"
                                      : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                                  }`}
                                >
                                  <Icon icon="lucide:star" className={surveyData.csat >= n ? "fill-white" : ""} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-2">¿Cuánto esfuerzo te tomó? (CES 1=fácil, 7=difícil)</p>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => setSurveyData((d) => ({ ...d, ces: n }))}
                                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                    surveyData.ces === n
                                      ? "bg-indigo-600 text-white shadow-md"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={surveyData.comment}
                            onChange={(e) => setSurveyData((d) => ({ ...d, comment: e.target.value }))}
                            placeholder="Comentario opcional…"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm outline-none resize-none mb-3 focus:border-indigo-300 transition"
                          />
                          <button
                            onClick={() => handleSurveySubmit(ticket.id)}
                            disabled={surveyData.csat === 0 || surveyData.ces === 0}
                            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 hover:scale-[1.02] transition-all"
                          >
                            Enviar Encuesta
                          </button>
                        </div>
                      )}
                      {surveySubmitted.has(ticket.id) && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-sm text-emerald-700 font-medium flex items-center justify-center gap-2">
                          <Icon icon="lucide:check-circle-2" /> ¡Gracias por tu feedback!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL — gestiona el estado de sesión
// ============================================================
export default function PortalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de sesión (login via magic link, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Estado de carga inicial
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="lucide:loader-2" className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-400">Verificando sesión…</p>
        </div>
      </main>
    );
  }

  // Sin sesión → mostrar login
  if (!user) return <LoginScreen />;

  // Con sesión → mostrar el dashboard de tickets
  return <PortalDashboard user={user} />;
}
