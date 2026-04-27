"use client";

import React from "react";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-5 pb-16 mt-auto relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-white/70">
        <div className="flex items-center gap-3">
          <img src="/logo2.svg" alt="Logo" className="w-[140px] h-[45px] object-contain drop-shadow-sm" />
          <span className="font-bold border-l border-white/20 pl-3">Sede Viña del Mar</span>
        </div>
        <p className="flex items-center gap-1.5">© 2026 — Construido con <Icon icon="lucide:heart" className="w-4 h-4 text-rose-500 fill-rose-500" /> por el Consejo</p>
      </div>

      {/* Institutional Strip (Franja) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[45px] w-full pointer-events-none"
        style={{
          backgroundImage: 'url("/franja.svg")',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom',
          backgroundSize: 'auto 45px'
        }}
      />
    </footer>
  );
}
