"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
  const { user, role } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const [isLocalhost, setIsLocalhost] = useState(false);
  const [bypassDisabled, setBypassDisabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(isLocal);
      setBypassDisabled(localStorage.getItem("localhost_bypass_disabled") === "true");
    }
  }, []);

  const handleEnableBypass = () => {
    localStorage.removeItem("localhost_bypass_disabled");
    window.location.reload();
  };

  useEffect(() => {
    if (user && role && role !== "Estudiante") {
      router.push("/admin");
    } else if (user && role === "Estudiante") {
      router.push("/perfil");
    }
  }, [user, role, router]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!agentId || !pin) {
      setErrorMessage("Ingresa tus credenciales");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${agentId.toLowerCase()}@staff.internal`,
        password: pin,
      });

      if (error) throw error;
      router.push("/admin");
    } catch (error: any) {
      setErrorMessage("Credenciales no válidas");
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (digit: string) => {
    if (pin.length < 6) setPin(prev => prev + digit);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100">
              <Icon icon="lucide:user-check" className="w-8 h-8" />
            </div>
            <h1 className="text-slate-900 text-2xl font-black tracking-tight">Acceso Staff</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Portal de administración interna</p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600"
              >
                <Icon icon="lucide:alert-circle" className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wide">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Agent ID */}
            <div className="space-y-3">
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest ml-1">Código Identificador</label>
              <div className="relative group">
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="ID de usuario"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
                <Icon icon="lucide:hash" className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500" />
              </div>
            </div>

            {/* PIN Display */}
            <div className="space-y-3">
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest ml-1">Pin de Seguridad</label>
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      pin.length > i ? "border-indigo-500 bg-white text-indigo-600 shadow-sm" : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    {pin.length > i ? (showPin ? pin[i] : "•") : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Keypad */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === "C") setPin("");
                    else if (key === "DEL") setPin(prev => prev.slice(0, -1));
                    else addDigit(key);
                  }}
                  className={`h-14 rounded-2xl text-lg font-bold transition-all active:scale-90 flex items-center justify-center ${
                    key === "C" ? "text-slate-400 hover:bg-slate-100" : 
                    key === "DEL" ? "text-slate-400 hover:bg-slate-100" :
                    "text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 shadow-sm"
                  }`}
                >
                  {key === "DEL" ? <Icon icon="lucide:delete" className="w-5 h-5" /> : key}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 mt-6 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Verificar Acceso
                  <Icon icon="lucide:chevron-right" className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

           <div className="mt-10 text-center space-y-4">
             {isLocalhost && bypassDisabled && (
               <button
                 type="button"
                 onClick={handleEnableBypass}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/70 rounded-2xl transition-all border border-indigo-100/40 active:scale-[0.98] shadow-sm shadow-indigo-100/20"
               >
                 <Icon icon="lucide:zap" className="w-4 h-4 text-indigo-500" />
                 Activar Auto-login (Desarrollo)
               </button>
             )}
             <button 
               onClick={() => router.push("/")}
               className="text-[11px] text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
             >
               <Icon icon="lucide:arrow-left" className="w-3 h-3" />
               Volver al inicio
             </button>
           </div>
        </div>
      </div>
    </main>
  );
}
