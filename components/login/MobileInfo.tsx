"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/transitions";

const FEATURES = [
  { icon: "lucide:building-2", text: "Reporta situaciones académicas o de infraestructura" },
  { icon: "lucide:handshake", text: "Solicita apoyo, beneficios y orientación" },
  { icon: "lucide:zap", text: "Contacto directo y seguro con Consejeros" },
];

export function MobileInfo() {
  return (
    <div className="lg:hidden mb-5">
      <motion.div
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Sede Viña del Mar</span>
      </motion.div>

      <motion.div
        className="mb-4 flex flex-col gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Conecta con tus</span>
        <Image
          src="/logo.svg"
          alt="Consejeros de Carrera"
          width={160}
          height={48}
          className="h-auto"
        />
      </motion.div>

      <motion.div
        className="flex flex-col gap-2.5 text-[11px] text-slate-500 font-medium"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {FEATURES.map((feat) => (
          <motion.span key={feat.icon} className="flex items-center gap-2" variants={staggerItem}>
            <Icon icon={feat.icon} className="w-3.5 h-3.5 text-brand-blue" />
            {feat.text}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
