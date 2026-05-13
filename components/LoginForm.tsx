"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { transitions } from "@/lib/transitions";

// Sub-components
import { HeroSection } from "./login/HeroSection";
import { MobileInfo } from "./login/MobileInfo";
import { GoogleAuthButton } from "./login/GoogleAuthButton";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("error") === "invalid_domain") {
        setErrorMessage("Acceso denegado. Debes utilizar tu correo institucional (@duocuc.cl).");
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
            hd: "duocuc.cl",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Hero Image — desktop only */}
      <HeroSection />

      {/* Right Side: Login — always visible, centered */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-6 sm:p-8 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md">
          {/* ── Mobile-only: Platform info ── */}
          <MobileInfo />

          {/* ── Desktop-only: Simple header ── */}
          <motion.div
            className="hidden lg:block text-center mb-5 sm:mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center mb-3 sm:mb-5">
              <Image src="/logo.svg" alt="Logo Duoc UC" width={140} height={45} className="h-auto" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 font-medium text-sm">Inicia sesión con tu cuenta institucional</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...transitions.spring }}
            className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100"
          >
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 overflow-hidden"
                >
                  <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium leading-relaxed">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile: brief instruction */}
            <p className="lg:hidden text-sm font-semibold text-slate-700 mb-3">
              Inicia sesión con tu correo institucional
            </p>

            <GoogleAuthButton loading={loading} onClick={handleGoogleLogin} />

            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:lock" className="w-3.5 h-3.5" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal">
                  Acceso seguro mediante <strong>Microsoft SSO / Google Workspace</strong> institucional.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:info" className="w-3.5 h-3.5" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal">
                  Tus datos personales están protegidos bajo la <strong>Ley 21.719</strong> y políticas de privacidad Duoc UC.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="mt-5 sm:mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              © 2026 Sede Viña del Mar · HUB CONSEJEROS DE CARRERAS
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
