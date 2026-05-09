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
import { validateStep, sanitizeInput } from "@/lib/validation";

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
                  ? "bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/30"
                  : i === current
                  ? "bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/30 scale-110"
                  : "bg-foreground/5 text-foreground/30 border border-foreground/10"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-[11px] font-bold hidden sm:block ${
                i <= current ? "text-[#2B2D42]" : "text-foreground/30"
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
      active: "border-[#E07A5F] bg-[#E07A5F]/5 shadow-lg shadow-[#E07A5F]/10",
      inactive: "hover:border-[#E07A5F]/30 hover:bg-[#E07A5F]/5",
      icon: "text-[#E07A5F]"
    },
    infraestructura: {
      active: "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10",
      inactive: "hover:border-amber-500/30 hover:bg-amber-50/30",
      icon: "text-amber-500"
    },
    bienestar: {
      active: "border-[#84A59D] bg-[#84A59D]/5 shadow-lg shadow-[#84A59D]/10",
      inactive: "hover:border-[#84A59D]/30 hover:bg-[#84A59D]/5",
      icon: "text-[#84A59D]"
    },
    financiero: {
      active: "border-[#2B2D42] bg-[#2B2D42]/5 shadow-lg shadow-[#2B2D42]/10",
      inactive: "hover:border-[#2B2D42]/30 hover:bg-[#2B2D42]/5",
      icon: "text-[#2B2D42]"
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
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1" role="alert">
      <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 shrink-0" />
      {error}
    </p>
  );
}

function StepDetails({
  data,
  onChange,
  errors,
}: {
  data: FormData;
  onChange: (key: keyof FormData, val: any) => void;
  errors: Record<string, string>;
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
          <label htmlFor="field-name" className="block text-sm font-medium mb-2">Tu nombre <span className="text-red-400">*</span></label>
          <input
            id="field-name"
            type="text"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ej: María González"
            aria-required="true"
            aria-invalid={!!errors.name}
            className={`w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 outline-none transition-all text-sm ${errors.name ? 'border-red-300' : 'border-border'}`}
          />
          <FieldError error={errors.name} />
        </div>
        <div>
          <label htmlFor="field-email" className="block text-sm font-medium mb-2">Correo electrónico <span className="text-red-400">*</span></label>
          <input
            id="field-email"
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="tu.correo@duocuc.cl"
            aria-required="true"
            aria-invalid={!!errors.email}
            className={`w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 outline-none transition-all text-sm ${errors.email ? 'border-red-300' : 'border-border'}`}
          />
          <FieldError error={errors.email} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-school" className="block text-sm font-medium mb-2">Escuela <span className="text-red-400">*</span></label>
            <select
              id="field-school"
              value={data.school}
              onChange={(e) => {
                onChange("school", e.target.value);
                onChange("career", "");
              }}
              aria-required="true"
              className={`w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm appearance-none ${errors.school ? 'border-red-300' : 'border-border'}`}
            >
              <option value="">Selecciona tu escuela</option>
              {Object.keys(SCHOOLS_DATA).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FieldError error={errors.school} />
          </div>
          <div>
            <label htmlFor="field-career" className="block text-sm font-medium mb-2">Carrera <span className="text-red-400">*</span></label>
            <select
              id="field-career"
              value={data.career}
              disabled={!data.school}
              onChange={(e) => onChange("career", e.target.value)}
              aria-required="true"
              className={`w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm appearance-none disabled:opacity-50 ${errors.career ? 'border-red-300' : 'border-border'}`}
            >
              <option value="">{data.school ? "Selecciona tu carrera" : "Primero elige escuela"}</option>
              {data.school && SCHOOLS_DATA[data.school].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FieldError error={errors.career} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="field-title" className="text-sm font-medium">Título de la solicitud <span className="text-red-400">*</span></label>
            <span className={`text-xs font-mono ${data.title.length > 90 ? 'text-red-400' : 'text-slate-400'}`}>{data.title.length}/100</span>
          </div>
          <input
            id="field-title"
            type="text"
            value={data.title}
            onChange={(e) => onChange("title", sanitizeInput(e.target.value))}
            placeholder="Ej: Certificado de Alumno Regular"
            maxLength={100}
            aria-required="true"
            aria-invalid={!!errors.title}
            className={`w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm ${errors.title ? 'border-red-300' : 'border-border'}`}
          />
          <FieldError error={errors.title} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="field-desc" className="text-sm font-medium">Descripción <span className="text-red-400">*</span></label>
            <span className={`text-xs font-mono ${data.description.length > 1800 ? 'text-red-400' : 'text-slate-400'}`}>{data.description.length}/2000</span>
          </div>
          <textarea
            id="field-desc"
            value={data.description}
            onChange={(e) => onChange("description", sanitizeInput(e.target.value))}
            placeholder="Detalla lo que necesitas..."
            rows={4}
            maxLength={2000}
            aria-required="true"
            aria-invalid={!!errors.description}
            className={`w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm resize-none ${errors.description ? 'border-red-300' : 'border-border'}`}
          />
          <FieldError error={errors.description} />
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
      <div className="p-4 rounded-xl border border-[#E07A5F]/20 bg-[#E07A5F]/5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.arcoConsent}
            onChange={(e) => onChange("arcoConsent", e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#E07A5F] focus:ring-[#E07A5F]"
          />
          <span className="text-sm text-[#2B2D42]/70 leading-relaxed">
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    // Clear field error on change
    if (fieldErrors[key]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const canAdvance = () => {
    const errors = validateStep(step, data);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    const errors = validateStep(step, data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
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
      
      // ---- Formbricks Trigger ----
      // Disparamos un evento personalizado para que Formbricks muestre la encuesta de satisfacción
      if (typeof window !== "undefined" && (window as any).formbricks) {
        (window as any).formbricks.track("ticket_submitted", {
          category: data.category,
          urgency: data.urgency,
          school: data.school
        });
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      const details = err.message || "Error desconocido";
      setSubmitError(`Error al guardar la solicitud: ${details}. Asegúrate de estar conectado o contacta a soporte.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <PublicLayout>
        <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
          <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl mb-6">
              <Icon icon="lucide:lock" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Autenticación Requerida</h1>
            <p className="text-slate-500 mb-8">
              Debes iniciar sesión con tu cuenta institucional para poder enviar solicitudes y hacerles seguimiento.
            </p>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

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
                className="px-8 py-4 rounded-2xl bg-[#E07A5F] text-white font-semibold shadow-lg shadow-[#E07A5F]/20 hover:bg-[#2B2D42] hover:scale-[1.02] transition-all"
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
          {step === 1 && <StepDetails data={data} onChange={updateField} errors={fieldErrors} />}
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
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canAdvance() || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#2B2D42] text-white text-sm font-semibold shadow-lg shadow-[#E07A5F]/25 hover:shadow-[#2B2D42]/40 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:mail" className="w-5 h-5" /> Enviar Solicitud
                  </>
                )}
              </button>
            )}
          </div>
          {submitError && (
            <div className="mt-6 p-4 rounded-xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm font-medium flex items-center gap-3 animate-fade-in-up">
              <Icon icon="lucide:alert-circle" className="w-5 h-5 shrink-0" />
              {submitError}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

