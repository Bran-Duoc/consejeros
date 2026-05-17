"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { transitions, staggerContainer, staggerItem } from "@/lib/transitions";

// Sub-components
import { HeroSection } from "./login/HeroSection";
import { GoogleAuthButton } from "./login/GoogleAuthButton";

const MOBILE_FEATURES = [
  { icon: "lucide:building-2", text: "Reporta situaciones académicas o de infraestructura." },
  { icon: "lucide:handshake", text: "Solicita apoyo, beneficios y orientación." },
  { icon: "lucide:zap", text: "Tu caso llega directo a los consejeros de forma privada y segura." },
];

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isLocalhost, setIsLocalhost] = useState(false);
  const [bypassDisabled, setBypassDisabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("error") === "invalid_domain") {
        setErrorMessage("Acceso denegado. Debes utilizar tu correo institucional (@duocuc.cl).");
      }
      
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(isLocal);
      setBypassDisabled(localStorage.getItem("localhost_bypass_disabled") === "true");
    }
  }, []);

  const handleEnableBypass = () => {
    localStorage.removeItem("localhost_bypass_disabled");
    window.location.reload();
  };

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
    <div className="h-[100dvh] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Hero Image — desktop only */}
      <HeroSection />

      {/* Right Side: Login */}
      <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
        {/* Analog Admin Link */}
        <div className="absolute top-4 right-4 z-[60]">
          <Link 
            href="/admin/login" 
            className="flex items-center gap-2 text-[9px] font-black text-slate-500/50 hover:text-indigo-400 uppercase tracking-[0.2em] transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/5 group backdrop-blur-sm"
          >
            <Icon icon="lucide:terminal" className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            Acceso Administrador
          </Link>
        </div>

        {/* ── MOBILE: Full-bleed hero background ── */}
        <div className="lg:hidden relative">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image src="/login-welcome.png" alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-indigo-900/50 to-slate-900/95" />
          </div>

          {/* Content over background */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-5 w-fit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Sede Viña del Mar</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2 mb-4"
            >
              <span className="text-white/90 text-lg font-bold uppercase tracking-tight">Conecta con tus</span>
              <Image
                src="/logo.svg"
                alt="Consejeros de Carrera"
                width={220}
                height={70}
                className="h-auto"
              />
            </motion.div>

            <motion.p
              className="text-sm text-white/80 leading-relaxed font-medium mb-5 max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              El espacio seguro donde tus representantes te escuchan, te orientan y gestionan tus necesidades ante la sede.
            </motion.p>

            <motion.ul
              className="text-[11px] text-white/70 space-y-2 font-medium w-full max-w-xs"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {MOBILE_FEATURES.map((feat) => (
                <motion.li key={feat.icon} className="flex items-center gap-2.5 text-left" variants={staggerItem}>
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 border border-white/10">
                    <Icon icon={feat.icon} className="w-3 h-3 text-indigo-200" />
                  </div>
                  <span className="leading-snug">{feat.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="flex-1 flex flex-col justify-center items-center px-5 py-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Desktop header */}
            <motion.div
              className="hidden lg:block text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-center mb-5">
                <Image src="/logo.svg" alt="Logo Duoc UC" width={140} height={45} className="h-auto" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Bienvenido</h2>
              <p className="text-slate-500 font-medium text-sm">Inicia sesión con tu cuenta institucional</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...transitions.spring }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100"
            >
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 overflow-hidden"
                  >
                    <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium leading-relaxed">{errorMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile: compact heading */}
              <div className="lg:hidden mb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Inicia sesión</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Correo institucional @duocuc.cl</p>
              </div>

              <GoogleAuthButton loading={loading} onClick={handleGoogleLogin} />

              {isLocalhost && bypassDisabled && (
                <button
                  type="button"
                  onClick={handleEnableBypass}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/70 rounded-2xl transition-all border border-indigo-100/40 active:scale-[0.98] shadow-sm shadow-indigo-100/20"
                >
                  <Icon icon="lucide:zap" className="w-4 h-4 text-indigo-500" />
                  Activar Auto-login (Desarrollo)
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:lock" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal">
                    Acceso seguro mediante <strong>Google Workspace</strong> institucional.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal">
                    Tus datos están protegidos bajo políticas de privacidad Duoc UC.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                © 2026 Sede Viña del Mar · HUB CONSEJEROS DE CARRERAS
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
