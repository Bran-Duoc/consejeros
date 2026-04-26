"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useApp } from "@/context/AppContext";
import { statusLabels, statusColors, categoryLabels, categoryIcons, urgencyLabels, TicketCategory, UrgencyLevel, TicketStatus } from "@/lib/data";
import { calculateSLAStatus } from "@/lib/sla";

export default function PortalPage() {
  const { tickets, audit, addSurvey } = useApp();
  const [email, setEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState({ csat: 0, ces: 0, comment: "" });
  const [surveySubmitted, setSurveySubmitted] = useState<Set<string>>(new Set());

  const myTickets = tickets.filter((t) => t.createdBy === email || t.createdByName.toLowerCase().includes(email.toLowerCase()));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setLoggedIn(true);
  };

  const handleSurveySubmit = (ticketId: string) => {
    if (surveyData.csat === 0 || surveyData.ces === 0) return;
    addSurvey({ ticketId, userId: email, csat: surveyData.csat, ces: surveyData.ces, comment: surveyData.comment });
    setSurveySubmitted((prev) => new Set(prev).add(ticketId));
    setSurveyData({ csat: 0, ces: 0, comment: "" });
  };

  if (!loggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in-up">


          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl mb-6 text-indigo-700">
            <Icon icon="lucide:user" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Mi Portal</h1>
          <p className="text-foreground/50 mb-8">Ingresa tu correo para ver el estado de tus solicitudes.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo o nombre"
              className="w-full px-4 py-3.5 rounded-2xl bg-foreground/[0.03] border border-border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm"
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:scale-[1.01] transition-all active:scale-[0.99]"
            >
              Ingresar
            </button>
          </form>

          <p className="mt-6 text-xs text-foreground/30 text-center">
            Demo: usa cualquier nombre o email de los tickets de ejemplo (ej: &quot;Diego&quot; o &quot;est1&quot;)
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-8 px-4">
      <div className="max-w-4xl mx-auto">


        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mis Solicitudes</h1>
            <p className="text-foreground/50 mt-1">{myTickets.length} solicitud(es) encontrada(s)</p>
          </div>
          <button
            onClick={() => { setLoggedIn(false); setEmail(""); }}
            className="px-4 py-2 rounded-xl border border-border text-sm text-foreground/50 hover:bg-foreground/5 transition"
          >
            Cerrar Sesión
          </button>
        </div>

        {myTickets.length === 0 ? (
          <div className="text-center py-20 animate-fade-in flex flex-col items-center">
            <div className="text-5xl mb-4 text-foreground/20"><Icon icon="lucide:inbox" /></div>
            <h2 className="text-xl font-bold mb-2">Sin solicitudes</h2>
            <p className="text-foreground/40 mb-6">No encontramos solicitudes asociadas a &quot;{email}&quot;</p>
            <Link href="/solicitud" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
              <Icon icon="lucide:mail" className="w-4 h-4" /> Enviar Solicitud
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myTickets.map((ticket) => {
              const sla = calculateSLAStatus(ticket.slaDeadline);
              const isSelected = selectedTicket === ticket.id;
              const ticketAudit = audit.filter((a) => a.ticketId === ticket.id);

              return (
                <div key={ticket.id} className="rounded-2xl border border-border overflow-hidden animate-fade-in-up">
                  {/* Ticket header */}
                  <button
                    onClick={() => setSelectedTicket(isSelected ? null : ticket.id)}
                    className="w-full text-left p-5 hover:bg-foreground/[0.01] transition flex items-start gap-4"
                  >
                    <span className="text-2xl text-indigo-600"><Icon icon={categoryIcons[ticket.category as TicketCategory]} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[ticket.status as TicketStatus]}`}>
                          {statusLabels[ticket.status as TicketStatus]}
                        </span>
                        <span className="text-xs text-foreground/30">{urgencyLabels[ticket.urgency as UrgencyLevel]}</span>
                      </div>
                      <h3 className="font-semibold">{ticket.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-foreground/30">
                        <span>SLA: <span style={{ color: sla.color }}>{sla.remainingFormatted}</span></span>
                        <span>•</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString("es-CL")}</span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-foreground/20 shrink-0 transition-transform ${isSelected ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="border-t border-border p-5 bg-foreground/[0.01] animate-fade-in">
                      <p className="text-sm text-foreground/60 mb-6">{ticket.description}</p>

                      {/* Timeline */}
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Icon icon="lucide:history" /> Historial
                      </h4>
                      <div className="space-y-3 mb-6">
                        {ticketAudit.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                            <div>
                              <span className="text-foreground/70">{entry.action}</span>
                              {entry.previousState && entry.newState && (
                                <span className="text-foreground/40"> ({entry.previousState} → {entry.newState})</span>
                              )}
                              <span className="block text-xs text-foreground/30 mt-0.5">
                                {entry.userName} — {new Date(entry.timestamp).toLocaleString("es-CL")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Survey (only for resolved tickets) */}
                      {ticket.status === "resuelto" && !surveySubmitted.has(ticket.id) && (
                        <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
                          <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                            <Icon icon="lucide:bar-chart-2" className="text-indigo-600" /> Ayúdanos a mejorar
                          </h4>

                          <div className="mb-4">
                            <p className="text-sm text-foreground/50 mb-2">¿Qué tan satisfecho estás? (CSAT 1-5)</p>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => setSurveyData((d) => ({ ...d, csat: n }))}
                                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                                    surveyData.csat >= n ? "bg-status-warning text-black shadow-md" : "bg-foreground/5 hover:bg-foreground/10"
                                  }`}
                                >
                                  <Icon icon="lucide:star" className={surveyData.csat >= n ? "fill-black" : ""} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-foreground/50 mb-2">¿Cuánto esfuerzo te tomó? (CES 1=fácil, 7=difícil)</p>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => setSurveyData((d) => ({ ...d, ces: n }))}
                                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                    surveyData.ces === n ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                            placeholder="Comentario opcional..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-border text-sm outline-none resize-none mb-3"
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
                        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/20 text-center text-sm text-status-success-dark font-medium flex items-center justify-center gap-2">
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
