"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import PublicLayout from "@/components/PublicLayout";
import { useApp } from "@/context/AppContext";
import {
  TicketCategory,
  UrgencyLevel,
  categoryLabels,
  categoryIcons,
  urgencyLabels,
} from "@/lib/data";

const STEPS = ["Categoría", "Detalles", "Urgencia", "Revisión"];
const FORM_STORAGE_KEY = "portal_form_draft";

const SCHOOLS_DATA: Record<string, string[]> = {
  "🏢 Escuela de Administración y Negocios": [
    "Auditoría", "Comercio Exterior", "Contabilidad General Mención Legislación Tributaria",
    "Ingeniería en Administración Mención Finanzas", "Ingeniería en Administración Mención Gestión de Personas",
    "Ingeniería en Administración Mención Innovación y Emprendimiento", "Ingeniería en Comercio Exterior",
    "Ingeniería en Gestión Logística", "Ingeniería en Marketing Digital", "Técnico en Administración",
    "Técnico en Gestión Logística"
  ],
  "💻 Escuela de Informática y Telecomunicaciones": [
    "Analista Programador", "Ingeniería en Informática", "Ingeniería en Redes y Telecomunicaciones"
  ],
  "🎨 Escuela de Diseño": [
    "Desarrollo y Diseño Web", "Diseño de Ambientes", "Diseño de Vestuario", "Diseño Gráfico",
    "Diseño Industrial e Innovación en Productos", "Ilustración para Contextos Globales"
  ],
  "🎬 Escuela de Comunicación": [
    "Animación Digital", "Comunicación Audiovisual", "Ingeniería en Sonido", "Publicidad",
    "Relaciones Públicas y Comunicación Organizacional", "Tecnología en Sonido e Iluminación"
  ]
};

interface FormData {
  category: TicketCategory | "";
  title: string;
  description: string;
  urgency: UrgencyLevel | "";
  name: string;
  email: string;
  school: string;
  career: string;
  arcoConsent: boolean;
}

const initialFormData: FormData = {
  category: "",
  title: "",
  description: "",
  urgency: "",
  name: "",
  email: "",
  school: "",
  career: "",
  arcoConsent: false,
};

function loadDraft(): FormData {
  if (typeof window === "undefined") return initialFormData;
  try {
    const d = localStorage.getItem(FORM_STORAGE_KEY);
    return d ? JSON.parse(d) : initialFormData;
  } catch {
    return initialFormData;
  }
}

// ---- Step Progress Bar ----
function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < current
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : i === current
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110"
                  : "bg-foreground/5 text-foreground/30 border border-foreground/10"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-[11px] font-medium hidden sm:block ${
                i <= current ? "text-foreground/70" : "text-foreground/30"
              }`}
            >
              {STEPS[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className={`flex-1 h-[2px] rounded-full transition-all duration-500 ${
                i < current ? "bg-indigo-600" : "bg-foreground/10"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---- Step 1: Category ----
function StepCategory({
  value,
  onChange,
}: {
  value: TicketCategory | "";
  onChange: (v: TicketCategory) => void;
}) {
  const categories: TicketCategory[] = ["academico", "infraestructura", "bienestar", "financiero", "otro"];
  const descriptions: Record<TicketCategory, string> = {
    academico: "Inscripción, notas, certificados, convalidaciones",
    infraestructura: "Salas, equipos, WiFi, espacios físicos",
    bienestar: "Salud mental, orientación, apoyo social",
    financiero: "Becas, pagos, aranceles, beneficios",
    otro: "Sugerencias, reclamos u otros temas",
  };

  const categoryStyles: Record<TicketCategory, { active: string, inactive: string, icon: string }> = {
    academico: {
      active: "border-indigo-600 bg-indigo-600/5 shadow-lg shadow-indigo-600/10",
      inactive: "hover:border-indigo-600/30 hover:bg-indigo-50/30",
      icon: "text-indigo-600"
    },
    infraestructura: {
      active: "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10",
      inactive: "hover:border-amber-500/30 hover:bg-amber-50/30",
      icon: "text-amber-500"
    },
    bienestar: {
      active: "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10",
      inactive: "hover:border-emerald-500/30 hover:bg-emerald-50/30",
      icon: "text-emerald-500"
    },
    financiero: {
      active: "border-violet-500 bg-violet-500/5 shadow-lg shadow-violet-500/10",
      inactive: "hover:border-violet-500/30 hover:bg-violet-50/30",
      icon: "text-violet-500"
    },
    otro: {
      active: "border-slate-500 bg-slate-500/5 shadow-lg shadow-slate-500/10",
      inactive: "hover:border-slate-500/30 hover:bg-slate-50/30",
      icon: "text-slate-500"
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2 text-slate-800">¿En qué podemos ayudarte?</h2>
      <p className="text-slate-600 font-medium mb-8">Selecciona la categoría que mejor describe tu solicitud.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`group text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm ${
              value === cat
                ? categoryStyles[cat].active + " bg-white/40"
                : `border-white/40 bg-white/20 ${categoryStyles[cat].inactive}`
            }`}
          >
            <span className={`text-3xl block mb-3 transition-colors ${value === cat ? categoryStyles[cat].icon : 'text-slate-400 group-hover:' + categoryStyles[cat].icon}`}>
              <Icon icon={categoryIcons[cat]} />
            </span>
            <span className="font-bold text-slate-800 text-base block">{categoryLabels[cat]}</span>
            <span className="text-sm font-semibold text-slate-600 mt-1.5 block leading-snug">{descriptions[cat]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Step 2: Details ----
function StepDetails({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (key: keyof FormData, val: any) => void;
}) {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Completa tu solicitud</h2>
        <p className="text-foreground/50">
          Ingresa los detalles de tu solicitud para que podamos ayudarte mejor.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tu nombre</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ej: María González"
            className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Correo electrónico</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="tu.correo@duoc.cl"
            className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Escuela</label>
            <select
              value={data.school}
              onChange={(e) => {
                onChange("school", e.target.value);
                onChange("career", ""); // Reset career when school changes
              }}
              className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm appearance-none"
            >
              <option value="">Selecciona tu escuela</option>
              {Object.keys(SCHOOLS_DATA).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Carrera</label>
            <select
              value={data.career}
              disabled={!data.school}
              onChange={(e) => onChange("career", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm appearance-none disabled:opacity-50"
            >
              <option value="">{data.school ? "Selecciona tu carrera" : "Primero elige escuela"}</option>
              {data.school && SCHOOLS_DATA[data.school].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Título de la solicitud</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Ej: Certificado de Alumno Regular"
            className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            value={data.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Detalla lo que necesitas..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ---- Step 3: Urgency ----
function StepUrgency({
  value,
  onChange,
}: {
  value: UrgencyLevel | "";
  onChange: (v: UrgencyLevel) => void;
}) {
  const levels: { key: UrgencyLevel; icon: string; desc: string; color: string }[] = [
    { key: "bajo", icon: "lucide:circle", desc: "No es urgente, puede esperar unos días", color: "border-status-success/40 bg-status-success/5" },
    { key: "medio", icon: "lucide:circle-dashed", desc: "Importante pero no inmediato (24-48h)", color: "border-status-warning/40 bg-status-warning/5" },
    { key: "alto", icon: "lucide:circle-dot", desc: "Necesita atención pronto (8-12h)", color: "border-status-danger/30 bg-status-danger/5" },
    { key: "critico", icon: "lucide:alert-circle", desc: "Urgencia máxima — atención inmediata", color: "border-status-danger bg-status-danger/10 text-white" },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2">Nivel de urgencia</h2>
      <p className="text-foreground/50 mb-8">
        Selecciona qué tan urgente es tu solicitud. Esto afecta el tiempo de respuesta.
      </p>
      <div className="space-y-3">
        {levels.map((l) => (
          <button
            key={l.key}
            onClick={() => onChange(l.key)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4 ${
              value === l.key ? l.color + " shadow-md" : "border-border hover:border-foreground/20"
            }`}
          >
            <span className="text-2xl"><Icon icon={l.icon} /></span>
            <div>
              <span className="font-semibold block">{urgencyLabels[l.key]}</span>
              <span className="text-sm text-foreground/40">{l.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}




// ---- Step 4: Review ----
function StepReview({ data, onChange }: { data: FormData; onChange: (key: keyof FormData, val: boolean) => void }) {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2">Revisa tu solicitud</h2>
      <p className="text-foreground/50 mb-8">Confirma que toda la información sea correcta antes de enviar.</p>

      <div className="space-y-4 rounded-2xl border border-border p-6 bg-foreground/[0.01] mb-6">
        {[
          { label: "Nombre", value: data.name },
          { label: "Email", value: data.email },
          { label: "Escuela", value: data.school },
          { label: "Carrera", value: data.career },
          { label: "Categoría", value: data.category ? <div className="flex items-center gap-2"><Icon icon={categoryIcons[data.category as TicketCategory]} className="w-4 h-4"/> {categoryLabels[data.category as TicketCategory]}</div> : "" },
          { label: "Urgencia", value: data.urgency ? urgencyLabels[data.urgency as UrgencyLevel] : "" },
          { label: "Título", value: data.title },
          { label: "Descripción", value: data.description },
        ].map((item) => (
          <div key={item.label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <span className="text-sm text-foreground/40 font-medium sm:w-32 shrink-0">{item.label}</span>
            <span className="text-sm">{item.value || "—"}</span>
          </div>
        ))}
      </div>

      {/* Normativa de Consentimiento (Ley 21.719) */}
      <div className="p-4 rounded-xl border border-indigo-600/20 bg-indigo-600/5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.arcoConsent}
            onChange={(e) => onChange("arcoConsent", e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <span className="text-sm text-foreground/70 leading-relaxed">
            Consiento expresamente el tratamiento de mis datos personales y sensibles ingresados en este formulario, en conformidad con la <strong>Ley N° 21.719</strong> sobre protección de datos personales. Comprendo que mis datos serán utilizados exclusivamente para gestionar esta solicitud y puedo ejercer mis derechos ARCO comunicándome con la institución.
          </span>
        </label>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function SolicitudPage() {
  const { addTicket, user } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    
    if (user && !draft.email) {
      draft.email = user.email || "";
      draft.name = user.user_metadata?.full_name || user.email?.split('@')[0] || "";
    }
    
    setData(draft);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const updateField = (key: keyof FormData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const canAdvance = () => {
    switch (step) {
      case 0: return !!data.category;
      case 1: return !!data.title && !!data.description && !!data.name && !!data.email && !!data.school && !!data.career;
      case 2: return !!data.urgency;
      case 3: return data.arcoConsent;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    const ticket = await addTicket({
      title: data.title,
      description: data.description,
      category: data.category as TicketCategory,
      urgency: data.urgency as UrgencyLevel,
      createdBy: data.email,
      createdByName: data.name,
      school: data.school,
      career: data.career,
    });
    setTicketId(ticket.id);
    setSubmitted(true);
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center animate-fade-in-up">
            <div className="w-20 h-20 mx-auto rounded-full bg-status-success/15 flex items-center justify-center text-4xl mb-6 text-status-success">
              <Icon icon="lucide:check-circle-2" />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-slate-900">¡Solicitud Enviada!</h1>
            <p className="text-slate-500 mb-2">
              Tu solicitud ha sido registrada y asignada automáticamente.
            </p>
            <p className="text-sm text-slate-400 mb-8">
              Folio: <code className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono font-bold text-slate-900">{ticketId?.slice(0, 8)}</code>
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/perfil"
                className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
              >
                Ver Mi Perfil
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="pb-20 sm:pb-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8 px-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Nueva Solicitud</h1>
              <p className="text-foreground/50 mt-1">Completa el formulario paso a paso</p>
            </div>
            {isOffline && (
              <div className="flex items-center gap-2 bg-status-warning/10 text-status-warning-dark border border-status-warning/30 px-3 py-1.5 rounded-xl text-xs font-medium animate-pulse-soft">
                <Icon icon="lucide:wifi-off" />
                <span>Modo Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4">
          <StepProgress current={step} total={STEPS.length} />

          {step === 0 && (
            <StepCategory value={data.category as TicketCategory | ""} onChange={(v) => updateField("category", v)} />
          )}
          {step === 1 && <StepDetails data={data} onChange={updateField} />}
          {step === 2 && <StepUrgency value={data.urgency as UrgencyLevel | ""} onChange={(v) => updateField("urgency", v)} />}
          {step === 3 && <StepReview data={data} onChange={updateField} />}

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-foreground/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canAdvance()}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-40"
              >
                <Icon icon="lucide:mail" className="w-5 h-5" /> Enviar Solicitud
              </button>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

