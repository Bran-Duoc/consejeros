// ============================================================
// Toast Notification Hook — Lightweight, zero-dependency
// ============================================================

"use client";

import { useState, useCallback, useRef } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

export interface ToastAPI {
  toasts: ToastItem[];
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

let globalIdCounter = 0;

export function useToast(): ToastAPI {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info", duration: number = 4000) => {
      const id = `toast-${++globalIdCounter}-${Date.now()}`;
      const item: ToastItem = { id, message, variant, duration };

      setToasts((prev) => [...prev.slice(-4), item]); // Keep max 5 toasts

      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const success = useCallback((msg: string) => toast(msg, "success"), [toast]);
  const error = useCallback((msg: string) => toast(msg, "error", 6000), [toast]);
  const warning = useCallback((msg: string) => toast(msg, "warning", 5000), [toast]);
  const info = useCallback((msg: string) => toast(msg, "info"), [toast]);

  return { toasts, toast, dismiss, success, error, warning, info };
}
