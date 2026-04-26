"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";

// Dominios institucionales permitidos
const ALLOWED_DOMAINS = ["@duoc.cl", "@duocuc.cl"];

function isValidEmail(email: string): boolean {
  if (!email.includes("@")) return false;
  return ALLOWED_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
}

type Status = "idle" | "loading" | "sent" | "error" | "oauth_loading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const emailValid = isValidEmail(email);
  const hasTyped = email.length > 0;
  const showDomainError = hasTyped && !emailValid;
  const isBusy = status === "loading" || status === "oauth_loading";

  // ---- Magic Link ----
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || isBusy) return;
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message.includes("not authorized") || error.message.includes("not found")
          ? "No encontramos esta cuenta Duoc UC. Contacta al Consejo de Sede."
          : "Error al enviar el enlace. Inténtalo nuevamente."
      );
    } else {
      setStatus("sent");
    }
  };

  // ---- Google OAuth con filtro de dominio ----
  const handleGoogleLogin = async () => {
    if (isBusy) return;
    setStatus("oauth_loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
          // Filtra la ventana de Google para mostrar solo cuentas @duocuc.cl
          hd: "duocuc.cl",
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg("Error al conectar con Google. Inténtalo nuevamente.");
    }
    // Si no hay error, Google redirige al usuario — no hacemos nada más
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8 sm:p-10">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.svg" alt="Sede Viña del Mar" className="w-[121px] h-[40px] object-contain mb-5" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Portal Activo — Semestre 2026-1
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center">Ingresa a tu portal</h1>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-xs">
              Accede con tu cuenta institucional Duoc UC. Sin contraseñas.
            </p>
          </div>

          {/* Estado: Magic Link enviado */}
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Icon icon="lucide:mail-check" className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-slate-800 text-lg">¡Enlace enviado!</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Revisa tu bandeja en{" "}
                  <span className="font-medium text-indigo-600">{email}</span>.
                  El enlace expira en 10 minutos.
                </p>
              </div>
              <button
                onClick={() => { setStatus("idle"); setEmail(""); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition mt-2"
              >
                ← Usar otro método
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* ---- BOTÓN GOOGLE ---- */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isBusy}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm
                           hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.01] active:scale-[0.99]
                           transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed
                           flex items-center justify-center gap-3"
              >
                {status === "oauth_loading" ? (
                  <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin text-indigo-600" /> Redirigiendo a Google…</>
                ) : (
                  <>
                    {/* Google logo SVG */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Ingresar con Google Workspace Duoc UC
                  </>
                )}
              </button>

              {/* Separador */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">o con correo</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* ---- MAGIC LINK ---- */}
              <form onSubmit={handleMagicLink} noValidate className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Correo institucional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Icon
                        icon="lucide:mail"
                        className={`w-4 h-4 transition-colors ${
                          showDomainError ? "text-rose-400" : emailValid ? "text-indigo-500" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@duoc.cl"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        showDomainError
                          ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                          : emailValid
                          ? "border-indigo-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
                      }`}
                    />
                  </div>

                  {showDomainError && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-fade-in">
                      <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 shrink-0" />
                      Solo se admiten correos @duoc.cl o @duocuc.cl
                    </p>
                  )}
                  {emailValid && (
                    <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1 animate-fade-in">
                      <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5 shrink-0" />
                      Correo institucional válido
                    </p>
                  )}
                </div>

                {/* Error del servidor */}
                {status === "error" && errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
                    <Icon icon="lucide:shield-x" className="w-4 h-4 shrink-0 mt-0.5" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!emailValid || isBusy}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                             shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 hover:scale-[1.01]
                             active:scale-[0.99] transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                             flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> Enviando enlace…</>
                  ) : (
                    <><Icon icon="lucide:send" className="w-4 h-4" /> Enviar Magic Link</>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Sede Viña del Mar · Duoc UC ·{" "}
          <span className="text-indigo-500">Ley 21.719</span>
        </p>
      </div>
    </main>
  );
}
