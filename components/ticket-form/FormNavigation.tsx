"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  isSubmitting: boolean;
  canAdvance: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function FormNavigation({
  step, totalSteps, isSubmitting, canAdvance,
  onPrev, onNext, onSubmit,
}: FormNavigationProps) {
  return (
    <div className="max-w-3xl mx-auto flex justify-between items-center">
      <motion.button
        type="button"
        onClick={onPrev}
        disabled={step === 0}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
      >
        Anterior
      </motion.button>

      {step === 0 ? (
        <div /> // Spacer
      ) : step < totalSteps - 1 ? (
        <motion.button
          type="button"
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold shadow-sm transition-colors"
        >
          Siguiente
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!canAdvance || isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
          whileTap={!isSubmitting ? { scale: 0.97 } : undefined}
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
        </motion.button>
      )}
    </div>
  );
}
