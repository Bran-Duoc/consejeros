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
      setErrorMessage("Identificación requerida");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Usamos una convención interna: agent_id + @staff.internal
      const { error } = await supabase.auth.signInWithPassword({
        email: `${agentId.toLowerCase()}@staff.internal`,
        password: pin,
      });

      if (error) throw error;
      router.push("/admin");
    } catch (error: any) {
      setErrorMessage("Acceso denegado: Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (digit: string) => {
    if (pin.length < 6) setPin(prev => prev + digit);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0D11] p-4 font-mono">
      <div className="w-full max-w-sm relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-indigo-500/20 blur-2xl rounded-full opacity-50" />
        
        <div className="relative bg-[#161922] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
              <Icon icon="lucide:shield-alert" className="w-6 h-6" />
            </div>
            <h1 className="text-white text-lg font-bold tracking-tight uppercase">Terminal de Acceso</h1>
            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Protocolo de Staff Análogo</p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2"
              >
                <Icon icon="lucide:octagon-alert" className="w-4 h-4 text-red-500" />
                <p className="text-[10px] text-red-400 font-bold uppercase">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Agent ID */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Código de Agente</label>
              <div className="relative group">
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="ID-000"
                  className="w-full bg-[#0B0D11] border border-white/10 rounded-2xl px-5 py-4 text-indigo-400 text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700"
                />
                <Icon icon="lucide:user" className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-indigo-500" />
              </div>
            </div>

            {/* PIN Display */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Pin de Seguridad</label>
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 h-12 rounded-xl border flex items-center justify-center transition-all ${
                      pin.length > i ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-white/5 bg-[#0B0D11]"
                    }`}
                  >
                    {pin.length > i ? (showPin ? pin[i] : "•") : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Analog Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === "C") setPin("");
                    else if (key === "DEL") setPin(prev => prev.slice(0, -1));
                    else addDigit(key);
                  }}
                  className={`h-12 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center ${
                    key === "C" ? "text-red-400 hover:bg-red-500/10" : 
                    key === "DEL" ? "text-slate-400 hover:bg-white/5" :
                    "text-white bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {key === "DEL" ? <Icon icon="lucide:delete" /> : key}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Icon icon="lucide:key" className="w-4 h-4" />
                  Autorizar Acceso
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push("/")}
              className="text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Volver al Portal Civil
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
