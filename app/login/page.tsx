"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const { user } = useApp();
  const router = useRouter();
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

    if (user) {
      router.push("/perfil");
    }
  }, [user, router]);

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
    <main className="h-[100dvh] pt-0 sm:pt-[85px] flex flex-col lg:flex-row bg-transparent overflow-hidden">
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
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Sede Viña del Mar</span>
          </div>
          <h1 className="text-5xl font-black mb-4 leading-tight drop-shadow-lg">
            Tu voz construye <br />
            <span className="text-indigo-400">Nuestra Sede.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed drop-shadow-md">
            Accede al portal oficial de solicitudes y mejora la experiencia estudiantil en Duoc UC.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-8 sm:p-8 lg:p-16 bg-transparent relative pb-24 sm:pb-8">
        <div className="absolute top-6 left-5 sm:top-8 sm:left-8 lg:hidden">
          <Image src="/logo.svg" alt="Logo Duoc UC" width={96} height={32} className="h-auto" />
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white mb-4 sm:mb-6 shadow-xl shadow-indigo-200 rotate-3">
              <Icon icon="lucide:shield-check" className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 sm:mb-2 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Inicia sesión con tu cuenta institucional</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
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

          {/* Footer */}
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
