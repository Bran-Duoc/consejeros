"use client";
import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-6 text-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl"
      >
        {/* Illustration */}
        <div className="relative mb-8 inline-block">
          <motion.div 
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-[2rem] shadow-xl shadow-slate-200/80 border border-slate-100 flex items-center justify-center"
          >
            <div className="absolute inset-3 rounded-[1.5rem] border-2 border-dashed border-slate-100 flex items-center justify-center">
              <Icon icon="lucide:map-pin-off" className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-200" />
            </div>
            
            {/* 404 Tag */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="absolute -top-3 -right-3 bg-rose-500 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-lg shadow-rose-500/30 rotate-12"
            >
              404
            </motion.div>
          </motion.div>

          {/* Floating small icons */}
          <motion.div 
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -left-6 top-1/4 w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-indigo-400 border border-slate-50"
          >
            <Icon icon="lucide:search" className="w-4 h-4" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute -right-4 bottom-1/4 w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-amber-400 border border-slate-50"
          >
            <Icon icon="lucide:compass" className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Content */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
          ¿Te perdiste en el <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">campus digital?</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-8 leading-relaxed font-medium">
          La página que buscas no existe o fue movida. No te preocupes, el <span className="text-slate-900 font-bold">Consejo de Sede</span> te ayuda a volver al camino correcto.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            href="/"
            className="group w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/10 hover:bg-indigo-600 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            <Icon icon="lucide:home" className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            Volver al Inicio
          </Link>
          <Link 
            href="/perfil"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Icon icon="lucide:clipboard-list" className="w-4 h-4" />
            Mis Solicitudes
          </Link>
        </div>
      </motion.div>

      {/* Footer link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
      >
        © 2026 Sede Viña del Mar · HUB CONSEJEROS
      </motion.div>
    </main>
  );
}
