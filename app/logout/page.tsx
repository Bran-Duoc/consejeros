"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function LogoutPage() {
  const [status, setStatus] = useState("Procesando cierre de sesión...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function clearAll() {
      try {
        setStatus("Limpiando service workers...");
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
      } catch (e) {
        console.warn("Failed to unregister SW:", e);
      }

      try {
        setStatus("Cerrando sesión en base de datos...");
        const { supabase } = await import("@/lib/supabase");
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Failed to sign out from Supabase:", e);
      }

      try {
        setStatus("Limpiando almacenamiento local...");
        localStorage.clear();
        sessionStorage.clear();
        // Force localhost bypass disabled in local dev to let user re-auth
        localStorage.setItem("localhost_bypass_disabled", "true");
      } catch (e) {
        console.warn("Failed to clear local storage:", e);
      }

      setStatus("Sesión cerrada con éxito. Redirigiendo...");
      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }

    clearAll();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border transition-all ${
          success ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-indigo-50 border-indigo-100 text-indigo-500"
        }`}>
          <Icon icon={success ? "lucide:check-circle-2" : "lucide:loader-2"} className={success ? "" : "animate-spin"} />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">Restableciendo Sesión</h1>
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mb-6">
          Estamos cerrando todas tus sesiones activas y limpiando la caché para solucionar problemas de acceso.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
          <div className={`w-2 h-2 rounded-full ${success ? "bg-emerald-500 animate-pulse" : "bg-indigo-500 animate-pulse"}`} />
          <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">{status}</span>
        </div>
      </div>
    </div>
  );
}
