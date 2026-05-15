"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { TicketCategory, UrgencyLevel } from "@/lib/data";
import { validateStep, sanitizeForSubmit, type SolicitudFormInput } from "@/lib/validations";

// Sub-components
import { ProgressBar } from "./ticket-form/ProgressBar";
import { StepCategory } from "./ticket-form/StepCategory";
import { StepDetails } from "./ticket-form/StepDetails";
import { StepUrgency } from "./ticket-form/StepUrgency";
import { StepReview } from "./ticket-form/StepReview";
import { SuccessScreen } from "./ticket-form/SuccessScreen";
import { FormHeader } from "./ticket-form/FormHeader";
import { FormNavigation } from "./ticket-form/FormNavigation";

// ---- Constants ----
const STEPS = ["Categoría", "Detalles", "Urgencia", "Revisión"] as const;
const FORM_STORAGE_KEY = "portal_form_draft";
const DRAFT_SAVE_DELAY = 400;
const DRAFT_EXPIRATION_MS = 5 * 60 * 1000;

// ---- Types ----
interface FormDraft {
  data: FormData;
  timestamp: number;
}

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
    const raw = localStorage.getItem(FORM_STORAGE_KEY);
    if (!raw) return initialFormData;
    const draft = JSON.parse(raw) as FormDraft;
    if (Date.now() - draft.timestamp > DRAFT_EXPIRATION_MS) {
      localStorage.removeItem(FORM_STORAGE_KEY);
      return initialFormData;
    }
    return draft.data;
  } catch {
    return initialFormData;
  }
}

// ---- Step transition variants ----
const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ---- Main Component ----
export default function TicketForm() {
  const { addTicket, user } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
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
      const draft: FormDraft = { data, timestamp: Date.now() };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft));
    }, DRAFT_SAVE_DELAY);
    return () => clearTimeout(draftTimer.current);
  }, [data]);

  const updateField = useCallback((key: keyof FormData | string, val: string | boolean) => {
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
    setDirection(1);
    setStep((s) => s + 1);
  }, [step, data]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

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
    localStorage.removeItem(FORM_STORAGE_KEY);
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleCategorySelect = useCallback((cat: TicketCategory) => {
    updateField("category", cat);
    setFieldErrors({});
  }, [updateField]);

  const handleCategoryContinue = useCallback((cat: TicketCategory) => {
    updateField("category", cat);
    setFieldErrors({});
    setDirection(1);
    setStep(1);
  }, [updateField]);

  const handleNewTicket = useCallback(() => {
    setSubmitted(false);
    setStep(0);
    setData({ ...initialFormData, email: user?.email || "", name: user?.user_metadata?.full_name || "" });
  }, [user]);

  // ── Success Screen ──
  if (submitted) {
    return <SuccessScreen ticketId={ticketId} onNewTicket={handleNewTicket} />;
  }

  // ── Form Shell ──
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <FormHeader step={step} isOffline={isOffline} onSignOut={handleSignOut} />
        <div className="max-w-3xl mx-auto mt-2">
          <ProgressBar current={step} total={STEPS.length} />
        </div>
      </div>

      {/* Scrollable Content with Step Transitions */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {step === 0 && (
                <StepCategory 
                  value={data.category as TicketCategory | ""} 
                  onChange={handleCategorySelect} 
                  onContinue={handleCategoryContinue}
                />
              )}
              {step === 1 && <StepDetails data={data} onChange={updateField} errors={fieldErrors} />}
              {step === 2 && <StepUrgency value={data.urgency as UrgencyLevel | ""} onChange={(v) => updateField("urgency", v)} />}
              {step === 3 && <StepReview data={data} onChange={updateField} />}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 p-3 rounded-lg bg-brand-red-light border border-brand-red/20 text-brand-red text-sm font-medium flex items-center gap-2"
              >
                <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
                {submitError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-100 bg-white/90 backdrop-blur-sm">
        <FormNavigation
          step={step}
          totalSteps={STEPS.length}
          isSubmitting={isSubmitting}
          canAdvance={canAdvance()}
          onPrev={handlePrev}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
