"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer 
      className="bg-black text-white pt-5 pb-16 sm:pb-16 mt-auto relative"
      style={{ paddingBottom: 'revert-layer' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 sm:gap-6 text-sm text-white/70">
        {/* Top row: Logo + Credits */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo2.svg" alt="Logo" className="w-[100px] sm:w-[140px] h-[35px] sm:h-[45px] object-contain drop-shadow-sm" />
            <span className="font-bold border-l border-white/20 pl-3 text-xs sm:text-sm">Sede Viña del Mar</span>
          </div>
          <p className="flex items-center gap-1.5 text-xs sm:text-sm">© 2026 — Construido con <Icon icon="lucide:heart" className="w-4 h-4 text-rose-500 fill-rose-500" /> por el Consejo</p>
        </div>

        {/* Bottom row: Legal links */}
        <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-white/40">
          <Link href="/privacidad" className="hover:text-white/70 transition-colors">
            Política de Privacidad
          </Link>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <Link href="/servicio" className="hover:text-white/70 transition-colors">
            Condiciones del Servicio
          </Link>
        </div>
      </div>

      {/* Institutional Strip (Franja) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[30px] sm:h-[45px] w-full pointer-events-none"
        style={{
          backgroundImage: 'url("/franja.svg")',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom',
          backgroundSize: 'auto 100%'
        }}
      />
    </footer>
  );
}
