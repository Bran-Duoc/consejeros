"use client";

import React, { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";

// Dominios institucionales permitidos
const ALLOWED_DOMAINS = ["@duoc.cl", "@duocuc.cl"];

function isValidEmail(email: string): boolean {
  if (!email.includes("@")) return false;
  return ALLOWED_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
}

type Status = "idle" | "loading" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const emailValid = isValidEmail(email);
  const hasTyped = email.length > 0;
  const showDomainError = hasTyped && !emailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;

    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        // Redirigir al portal tras confirmar el Magic Link
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });

    if (error) {
      setStatus("error");
      // El trigger de la DB devolverá un mensaje si el dominio no está permitido
      setErrorMsg(
        error.message.includes("authorized")
          ? "Este correo no está autorizado. Solo se admiten cuentas @duoc.cl o @duocuc.cl."
          : "Ocurrió un error al enviar el enlace. Inténtalo nuevamente."
      );
    } else {
      setStatus("sent");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      {/* Background subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8 sm:p-10">

          {/* Logo + Branding */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo.svg"
              alt="Sede Viña del Mar"
              className="w-[121px] h-[40px] object-contain mb-5"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Portal Activo — Semestre 2026-1
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center">
              Ingresa a tu portal
            </h1>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-xs">
              Enviaremos un enlace seguro a tu correo institucional. Sin contraseñas.
            </p>
          </div>

          {/* Estado: Enviado correctamente */}
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Icon icon="lucide:mail-check" className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-slate-800 text-lg">
                  ¡Enlace enviado!
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Revisa tu bandeja de entrada en{" "}
                  <span className="font-medium text-indigo-600">{email}</span>.
                  El enlace expira en 10 minutos.
                </p>
              </div>
              <button
                onClick={() => { setStatus("idle"); setEmail(""); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition mt-2"
              >
                ← Usar otro correo
              </button>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Correo institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Icon
                      icon="lucide:mail"
                      className={`w-4 h-4 transition-colors ${
                        showDomainError
                          ? "text-rose-400"
                          : emailValid
                          ? "text-indigo-500"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@duoc.cl"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setStatus("idle");
                      setErrorMsg("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      showDomainError
                        ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                        : emailValid
                        ? "border-indigo-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Validación en tiempo real */}
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
                disabled={!emailValid || status === "loading"}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                           shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/35
                           hover:scale-[1.01] active:scale-[0.99] transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                           flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    Enviando enlace…
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:send" className="w-4 h-4" />
                    Enviar enlace seguro
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Sin contraseñas — acceso seguro vía Magic Link
              </p>
            </form>
          )}
        </div>

        {/* Footer institucional */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Sede Viña del Mar · Duoc UC ·{" "}
          <span className="text-indigo-500">Ley 21.719</span>
        </p>
      </div>
    </main>
  );
}
