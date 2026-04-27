"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { ToastItem, ToastVariant } from "@/lib/useToast";

// ---- Variant Config ----
const variantConfig: Record<ToastVariant, { icon: string; bg: string; border: string; text: string; progressColor: string }> = {
  success: {
    icon: "lucide:check-circle-2",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    progressColor: "bg-emerald-500",
  },
  error: {
    icon: "lucide:alert-circle",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    progressColor: "bg-red-500",
  },
  warning: {
    icon: "lucide:alert-triangle",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    progressColor: "bg-amber-500",
  },
  info: {
    icon: "lucide:info",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    progressColor: "bg-blue-500",
  },
};

// ---- Single Toast ----
function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const config = variantConfig[toast.variant];

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative overflow-hidden rounded-xl border shadow-lg shadow-black/5
        ${config.bg} ${config.border} ${config.text}
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
      `}
      style={{ maxWidth: "420px", width: "100%" }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <Icon icon={config.icon} className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
        <button
          onClick={handleDismiss}
          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5 -m-0.5"
          aria-label="Cerrar notificación"
        >
          <Icon icon="lucide:x" className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-full bg-black/5">
        <div
          className={`h-full ${config.progressColor} rounded-r-full`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

// ---- Toast Container ----
export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <>
      {/* Desktop: bottom-right */}
      <div
        className="hidden sm:flex fixed bottom-6 right-6 z-[200] flex-col-reverse gap-2 pointer-events-auto"
        aria-label="Notificaciones"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>

      {/* Mobile: top */}
      <div
        className="sm:hidden fixed top-20 left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-auto"
        aria-label="Notificaciones"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}
