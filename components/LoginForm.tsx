"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/20 z-10" />
        <Image 
          src="/login-welcome.png" 
          alt="Vista del Campus Duoc UC" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-8 left-8 right-8 xl:bottom-12 xl:left-12 xl:right-12 z-20 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 xl:mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest">Sede Viña del Mar</span>
          </div>
          
          <div 
            className="p-5 xl:p-6 -ml-5 xl:-ml-6 rounded-[2rem] xl:rounded-[2.5rem] bg-white/5 border border-white/10"
            style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          >
            <div className="mb-3 xl:mb-6 drop-shadow-lg flex flex-col gap-2">
              <span className="text-white/90 text-xl xl:text-3xl font-bold uppercase tracking-tight">Conecta con tus</span>
              <Image 
                src="/logo.svg" 
                alt="Consejeros de Carrera" 
                width={280} 
                height={80} 
                className="h-auto invert brightness-[2] contrast-[1.2]" 
              />
            </div>
            <p className="text-base xl:text-lg text-white/90 max-w-md leading-relaxed drop-shadow-md font-medium mb-4 xl:mb-5">
              El espacio seguro donde tus representantes te escuchan, te orientan y gestionan tus necesidades ante la sede.
            </p>
            <ul className="text-sm text-white/80 space-y-2 xl:space-y-3 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:building-2" className="w-3 h-3 xl:w-4 xl:h-4 text-indigo-300" />
                </div>
                Reporta situaciones académicas o de infraestructura.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:handshake" className="w-3 h-3 xl:w-4 xl:h-4 text-indigo-300" />
                </div>
                Solicita apoyo, beneficios y orientación.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:zap" className="w-3 h-3 xl:w-4 xl:h-4 text-indigo-300" />
                </div>
                Tu caso llega directo a los consejeros de forma privada y segura.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side: Login — always visible, centered */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-6 sm:p-8 lg:p-12 relative overflow-y-auto">


        <div className="w-full max-w-md">
          {/* ── Mobile-only: Platform info ── */}
          <div className="lg:hidden mb-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Sede Viña del Mar</span>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <span className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider">Conecta con tus</span>
              <Image 
                src="/logo.svg" 
                alt="Consejeros de Carrera" 
                width={180} 
                height={54} 
                className="h-auto" 
              />
            </div>
            <div className="flex flex-col gap-2.5 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-2">
                <Icon icon="lucide:building-2" className="w-3.5 h-3.5 text-brand-blue" />
                Reporta situaciones académicas o de infraestructura
              </span>
              <span className="flex items-center gap-2">
                <Icon icon="lucide:handshake" className="w-3.5 h-3.5 text-brand-blue" />
                Solicita apoyo, beneficios y orientación
              </span>
              <span className="flex items-center gap-2">
                <Icon icon="lucide:zap" className="w-3.5 h-3.5 text-brand-blue" />
                Contacto directo y seguro con Consejeros
              </span>
            </div>
          </div>

          {/* ── Desktop-only: Simple header ── */}
          <div className="hidden lg:block text-center mb-5 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-5">
              <Image src="/logo.svg" alt="Logo Duoc UC" width={140} height={45} className="h-auto" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 font-medium text-sm">Inicia sesión con tu cuenta institucional</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
            {errorMessage && (
              <div className="mb-5 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Mobile: brief instruction */}
            <p className="lg:hidden text-sm font-semibold text-slate-700 mb-3">
              Inicia sesión con tu correo institucional
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-5 rounded-xl sm:rounded-2xl border-2 border-slate-100 hover:border-indigo-500 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Image 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google Icon" 
                width={24}
                height={24}
                className="group-hover:scale-110 transition-transform" 
              />
              <span className="text-sm">Continuar con Google</span>
              {loading && (
                <Icon icon="lucide:loader-2" className="absolute right-5 w-5 h-5 animate-spin text-indigo-600" />
              )}
            </button>

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
          </div>

          <div className="mt-5 sm:mt-8 text-center">
             <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              © 2026 Sede Viña del Mar · HUB CONSEJEROS DE CARRERAS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
