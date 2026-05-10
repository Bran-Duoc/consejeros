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
    <main className="min-h-[100dvh] flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Left Side: Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/20 z-10" />
        <Image 
          src="/login-welcome.png" 
          alt="Vista del Campus Duoc UC" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest">Sede Viña del Mar</span>
          </div>
          
          <div 
            className="p-6 -ml-6 rounded-[2.5rem] bg-white/5 border border-white/10"
            style={{ backdropFilter: "blur(60px)", WebkitBackdropFilter: "blur(60px)" }}
          >
            <h1 className="text-5xl font-black mb-4 leading-tight drop-shadow-lg">
              Portal Único de <br />
              <span className="text-indigo-400">Solicitudes.</span>
            </h1>
            <p className="text-lg text-white/90 max-w-md leading-relaxed drop-shadow-md font-medium mb-5">
              El canal oficial del Consejo de Sede para canalizar y resolver tus requerimientos de forma centralizada.
            </p>
            <ul className="text-sm sm:text-base text-white/80 space-y-3 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:check" className="w-4 h-4 text-indigo-300" />
                </div>
                Reporta problemas académicos o de infraestructura.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:check" className="w-4 h-4 text-indigo-300" />
                </div>
                Solicita beneficios y apoyo estudiantil.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:check" className="w-4 h-4 text-indigo-300" />
                </div>
                Tu solicitud llega directo a tu Consejero de Carrera.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-8 sm:p-8 lg:p-16 relative">
        <div className="absolute top-6 left-5 sm:top-8 sm:left-8 lg:hidden">
          <Image src="/logo.svg" alt="Logo Duoc UC" width={96} height={32} className="h-auto" />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white mb-4 sm:mb-6 shadow-xl shadow-indigo-200 rotate-3">
              <Icon icon="lucide:shield-check" className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 sm:mb-2 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Inicia sesión con tu cuenta institucional</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-3 sm:gap-4 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-slate-100 hover:border-indigo-500 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
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
                <Icon icon="lucide:loader-2" className="absolute right-5 sm:right-6 w-5 h-5 animate-spin text-indigo-600" />
              )}
            </button>

            <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-slate-100 flex flex-col gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:lock" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal">
                  Acceso seguro mediante <strong>Microsoft SSO / Google Workspace</strong> institucional.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Icon icon="lucide:info" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal">
                  Tus datos personales están protegidos bajo la <strong>Ley 21.719</strong> y políticas de privacidad Duoc UC.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-10 text-center">
             <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              © 2026 Sede Viña del Mar · Hub Estudiantil
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
