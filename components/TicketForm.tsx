"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import {
  TicketCategory,
  UrgencyLevel,
  categoryLabels,
  categoryIcons,
  urgencyLabels,
  SCHOOLS_DATA,
} from "@/lib/data";
import { validateStep, sanitizeInput, sanitizeForSubmit } from "@/lib/validation";

// ---- Constants ----
const STEPS = ["Categoría", "Detalles", "Urgencia", "Revisión"] as const;
const FORM_STORAGE_KEY = "portal_form_draft";
const DRAFT_SAVE_DELAY = 400; // ms debounce

// ---- Types ----
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

// ---- Progress Bar (linear) ----
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-5">
      <div
        className="h-full bg-brand-blue rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ---- Step 1: Category ----
const CATEGORIES: {
  key: TicketCategory;
  color: string;
  activeBg: string;
  activeBorder: string;
}[] = [
  { key: "academico", color: "text-brand-red", activeBg: "bg-brand-red-light", activeBorder: "border-brand-red" },
  { key: "infraestructura", color: "text-brand-yellow-dark", activeBg: "bg-brand-yellow-light", activeBorder: "border-brand-yellow" },
  { key: "bienestar", color: "text-brand-green-dark", activeBg: "bg-brand-green-light", activeBorder: "border-brand-green" },
  { key: "financiero", color: "text-brand-purple-dark", activeBg: "bg-brand-purple-light", activeBorder: "border-brand-purple" },
  { key: "otro", color: "text-slate-500", activeBg: "bg-slate-50", activeBorder: "border-slate-400" },
];

const CATEGORY_DESCRIPTIONS: Record<TicketCategory, string> = {
  academico: "Inscripción, notas, certificados, convalidaciones",
  infraestructura: "Salas, equipos, WiFi, espacios físicos",
  bienestar: "Salud mental, orientación, apoyo social",
  financiero: "Becas, pagos, aranceles, beneficios",
  otro: "Sugerencias, reclamos u otros temas",
};

function StepCategory({
  value,
  onChange,
}: {
  value: TicketCategory | "";
  onChange: (v: TicketCategory) => void;
}) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">¿En qué podemos ayudarte?</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Selecciona la categoría de tu solicitud.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {CATEGORIES.map((cat) => {
          const isActive = value === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onChange(cat.key)}
              className={`group text-left p-3 rounded-xl border-2 transition-all duration-150 ${
                isActive
                  ? `${cat.activeBorder} ${cat.activeBg} shadow-sm`
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <Icon
                  icon={categoryIcons[cat.key]}
                  className={`w-5 h-5 ${isActive ? cat.color : "text-slate-400 group-hover:" + cat.color}`}
                />
                <span className="font-semibold text-slate-800 text-sm">{categoryLabels[cat.key]}</span>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight block">{CATEGORY_DESCRIPTIONS[cat.key]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Reusable Field Error ----
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1" role="alert">
      <Icon icon="lucide:alert-circle" className="w-3 h-3 shrink-0" />
      {error}
    </p>
  );
}

// ---- Step 2: Details ----
function StepDetails({
  data,
  onChange,
  errors,
}: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">Completa tu solicitud</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Ingresa los detalles para que podamos ayudarte.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
        {/* Nombre */}
        <div>
          <label htmlFor="field-name" className="block text-xs font-semibold text-slate-600 mb-1">
            Nombre completo <span className="text-red-400">*</span>
          </label>
          <input
            id="field-name"
            type="text"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ej: María González"
            autoComplete="name"
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 ${errors.name ? "border-red-300" : "border-slate-200"}`}
          />
          <FieldError error={errors.name} />
        </div>

        {/* Email (readonly) */}
        <div>
          <label htmlFor="field-email" className="block text-xs font-semibold text-slate-600 mb-1">
            Correo institucional
          </label>
          <input
            id="field-email"
            type="email"
            value={data.email}
            disabled
            className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-sm"
          />
        </div>

        {/* Escuela */}
        <div>
          <label htmlFor="field-school" className="block text-xs font-semibold text-slate-600 mb-1">
            Escuela <span className="text-red-400">*</span>
          </label>
          <select
            id="field-school"
            value={data.school}
            onChange={(e) => {
              onChange("school", e.target.value);
              onChange("career", "");
            }}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue appearance-none ${errors.school ? "border-red-300" : "border-slate-200"}`}
          >
            <option value="">Selecciona tu escuela</option>
            {Object.keys(SCHOOLS_DATA).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <FieldError error={errors.school} />
        </div>

        {/* Carrera */}
        <div>
          <label htmlFor="field-career" className="block text-xs font-semibold text-slate-600 mb-1">
            Carrera <span className="text-red-400">*</span>
          </label>
          <select
            id="field-career"
            value={data.career}
            disabled={!data.school}
            onChange={(e) => onChange("career", e.target.value)}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue appearance-none disabled:opacity-50 disabled:bg-slate-50 ${errors.career ? "border-red-300" : "border-slate-200"}`}
          >
            <option value="">{data.school ? "Selecciona tu carrera" : "Primero elige escuela"}</option>
            {data.school && SCHOOLS_DATA[data.school]?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <FieldError error={errors.career} />
        </div>

        {/* Título */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="field-title" className="text-xs font-semibold text-slate-600">
              Asunto de la solicitud <span className="text-red-400">*</span>
            </label>
            <span className={`text-[10px] font-mono tabular-nums ${data.title.length > 90 ? "text-red-400" : "text-slate-300"}`}>
              {data.title.length}/100
            </span>
          </div>
          <input
            id="field-title"
            type="text"
            value={data.title}
            onChange={(e) => onChange("title", sanitizeInput(e.target.value))}
            placeholder="Ej: Certificado de Alumno Regular"
            maxLength={100}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 ${errors.title ? "border-red-300" : "border-slate-200"}`}
          />
          <FieldError error={errors.title} />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="field-desc" className="text-xs font-semibold text-slate-600">
              Descripción <span className="text-red-400">*</span>
            </label>
            <span className={`text-[10px] font-mono tabular-nums ${data.description.length > 1800 ? "text-red-400" : "text-slate-300"}`}>
              {data.description.length}/2000
            </span>
          </div>
          <textarea
            id="field-desc"
            value={data.description}
            onChange={(e) => onChange("description", sanitizeInput(e.target.value))}
            placeholder="Describe tu situación con el mayor detalle posible..."
            rows={3}
            maxLength={2000}
            className={`w-full px-3.5 py-2 rounded-lg bg-white border text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 resize-none ${errors.description ? "border-red-300" : "border-slate-200"}`}
          />
          <FieldError error={errors.description} />
        </div>
      </div>
    </div>
  );
}

// ---- Step 3: Urgency ----
const URGENCY_LEVELS: {
  key: UrgencyLevel;
  icon: string;
  desc: string;
  activeClass: string;
}[] = [
  { key: "bajo", icon: "lucide:circle", desc: "Puede esperar unos días", activeClass: "border-brand-green bg-brand-green-light" },
  { key: "medio", icon: "lucide:clock", desc: "Importante, 24-48h", activeClass: "border-brand-yellow bg-brand-yellow-light" },
  { key: "alto", icon: "lucide:alert-triangle", desc: "Atención pronto, 8-12h", activeClass: "border-brand-red bg-brand-red-light" },
  { key: "critico", icon: "lucide:alert-circle", desc: "Atención inmediata", activeClass: "border-brand-red bg-brand-red-light ring-2 ring-brand-red/20" },
];

function StepUrgency({
  value,
  onChange,
}: {
  value: UrgencyLevel | "";
  onChange: (v: UrgencyLevel) => void;
}) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">Nivel de urgencia</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Esto determina la prioridad y tiempo de respuesta.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {URGENCY_LEVELS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => onChange(l.key)}
            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-150 flex items-center gap-3 ${
              value === l.key ? l.activeClass + " shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <Icon icon={l.icon} className="w-5 h-5 shrink-0 text-slate-600" />
            <div className="min-w-0">
              <span className="font-semibold text-sm text-slate-800 block">{urgencyLabels[l.key]}</span>
              <span className="text-[11px] text-slate-400">{l.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Step 4: Review ----
function StepReview({ data, onChange }: { data: FormData; onChange: (key: keyof FormData, val: boolean) => void }) {
  const reviewItems = [
    { label: "Nombre", value: data.name },
    { label: "Email", value: data.email },
    { label: "Escuela", value: data.school },
    { label: "Carrera", value: data.career },
    {
      label: "Categoría",
      value: data.category ? (
        <span className="inline-flex items-center gap-1.5">
          <Icon icon={categoryIcons[data.category as TicketCategory]} className="w-3.5 h-3.5" />
          {categoryLabels[data.category as TicketCategory]}
        </span>
      ) : "—",
    },
    { label: "Urgencia", value: data.urgency ? urgencyLabels[data.urgency as UrgencyLevel] : "—" },
    { label: "Asunto", value: data.title },
    { label: "Descripción", value: data.description },
  ];

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1 text-slate-800">Revisa tu solicitud</h2>
      <p className="text-slate-500 text-xs sm:text-sm mb-4">Confirma que la información sea correcta.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-slate-100 p-4 bg-slate-50/50 mb-4">
        {reviewItems.map((item) => (
          <div key={item.label} className={`py-1 ${item.label === "Descripción" ? "sm:col-span-2" : ""}`}>
            <span className="text-[11px] text-slate-400 font-medium block">{item.label}</span>
            <span className="text-sm text-slate-800 break-words">{item.value || "—"}</span>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-brand-blue/15 bg-brand-blue-light/30">
        <input
          type="checkbox"
          checked={data.arcoConsent}
          onChange={(e) => onChange("arcoConsent", e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue accent-brand-blue"
        />
        <span className="text-xs text-slate-600 leading-relaxed">
          Consiento el tratamiento de mis datos personales conforme a la <strong>Ley N° 21.719</strong>. 
          Mis datos serán usados exclusivamente para gestionar esta solicitud. 
          Puedo ejercer mis derechos ARCO contactando a la institución.
        </span>
      </label>
    </div>
  );
}

// ---- Main Component ----
export default function TicketForm() {
  const { addTicket, user } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load draft + set user info
  useEffect(() => {
    const draft = loadDraft();
    if (user && !draft.email) {
      draft.email = user.email || "";
      draft.name = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
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

  // Debounced draft save
  useEffect(() => {
    if (typeof window === "undefined") return;
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    }, DRAFT_SAVE_DELAY);
    return () => clearTimeout(draftTimer.current);
  }, [data]);

  const updateField = useCallback((key: keyof FormData, val: string | boolean) => {
    setData((prev) => ({ ...prev, [key]: val }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const canAdvance = useCallback(() => {
    return Object.keys(validateStep(step, data)).length === 0;
  }, [step, data]);

  const handleNext = useCallback(() => {
    const errors = validateStep(step, data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStep((s) => s + 1);
  }, [step, data]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const ticket = await addTicket({
        title: sanitizeForSubmit(data.title),
        description: sanitizeForSubmit(data.description),
        category: data.category as TicketCategory,
        urgency: data.urgency as UrgencyLevel,
        createdBy: data.email,
        createdByName: sanitizeForSubmit(data.name),
        school: data.school,
        career: data.career,
      });
      setTicketId(ticket.id);
      setSubmitted(true);
      localStorage.removeItem(FORM_STORAGE_KEY);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setSubmitError(`Error al guardar: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleCategorySelect = useCallback((cat: TicketCategory) => {
    updateField("category", cat);
    // Auto-advance after selection
    setTimeout(() => {
      setFieldErrors({});
      setStep(1);
    }, 300);
  }, [updateField]);

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-green-light flex items-center justify-center text-2xl mb-4 text-brand-green-dark">
            <Icon icon="lucide:check-circle-2" />
          </div>
          <h1 className="text-xl font-bold mb-1 text-slate-900">¡Solicitud Enviada!</h1>
          <p className="text-slate-500 text-sm mb-1">Tu solicitud fue registrada y asignada.</p>
          <p className="text-xs text-slate-400 mb-5">
            Folio: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-mono font-bold text-slate-800">{ticketId?.slice(0, 8)}</code>
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setData({ ...initialFormData, email: user?.email || "", name: user?.user_metadata?.full_name || "" });
            }}
            className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold shadow-md shadow-brand-blue/20 hover:bg-brand-blue-dark transition-colors"
          >
            Nueva Solicitud
          </button>
        </div>
      </div>
    );
  }

  // ── Form Shell ──
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Nueva Solicitud</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Paso {step + 1} de {STEPS.length} — <span className="text-slate-600 font-medium">{STEPS[step]}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isOffline && (
              <div className="flex items-center gap-1 bg-brand-yellow-light text-brand-yellow-dark border border-brand-yellow/30 px-2 py-1 rounded-lg text-[11px] font-medium">
                <Icon icon="lucide:wifi-off" className="w-3 h-3" />
                <span className="hidden sm:inline">Sin conexión</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Cerrar sesión"
            >
              <Icon icon="lucide:log-out" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <ProgressBar current={step} total={STEPS.length} />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          {step === 0 && <StepCategory value={data.category as TicketCategory | ""} onChange={handleCategorySelect} />}
          {step === 1 && <StepDetails data={data} onChange={updateField} errors={fieldErrors} />}
          {step === 2 && <StepUrgency value={data.urgency as UrgencyLevel | ""} onChange={(v) => updateField("urgency", v)} />}
          {step === 3 && <StepReview data={data} onChange={updateField} />}

          {submitError && (
            <div className="mt-3 p-3 rounded-lg bg-brand-red-light border border-brand-red/20 text-brand-red text-sm font-medium flex items-center gap-2">
              <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Icon icon="lucide:send" className="w-4 h-4" />
                  Enviar Solicitud
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
