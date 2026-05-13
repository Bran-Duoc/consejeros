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
    <div className="h-full flex flex-col lg:flex-row relative bg-slate-900 overflow-hidden">
      {/* Background (Hero) — Hidden text on mobile, full bg */}
      <div className="lg:hidden absolute inset-0 z-0">
        <Image
          src="/login-welcome.png"
          alt="Background"
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-transparent to-indigo-950/90" />
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative">
        <HeroSection />
      </div>

      {/* Right Side: Login — Centered with glassmorphism on mobile */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-8 lg:p-12 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md">
          {/* Header for mobile only: Hero Content */}
          <div className="lg:hidden mb-8 text-center">
             <HeroSection />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...transitions.spring }}
            className="bg-white/95 backdrop-blur-xl lg:bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-white/20 lg:border-slate-100"
          >
            {/* Desktop Logo */}
            <div className="hidden lg:flex justify-center mb-6">
              <Image src="/logo.svg" alt="Logo Duoc UC" width={160} height={50} className="h-auto" />
            </div>

            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 overflow-hidden"
                >
                  <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-bold leading-relaxed">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight lg:text-center">Bienvenido</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6 lg:text-center">Portal de Gestión Hub</p>

            <GoogleAuthButton loading={loading} onClick={handleGoogleLogin} />

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:lock" className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Acceso seguro institucional mediante <strong>Google Workspace (@duocuc.cl)</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:shield-check" className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Canal privado y confidencial. Tus datos están protegidos por la normativa de seguridad Duoc UC.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[10px] text-white/50 lg:text-slate-400 font-bold uppercase tracking-widest">
              © 2026 Sede Viña del Mar · HUB CONSEJEROS
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
