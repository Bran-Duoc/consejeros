"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/transitions";

const FEATURES = [
  { icon: "lucide:building-2", text: "Reporta situaciones académicas o de infraestructura." },
  { icon: "lucide:handshake", text: "Solicita apoyo, beneficios y orientación." },
  { icon: "lucide:zap", text: "Tu caso llega directo a los consejeros de forma privada y segura." },
];

export function HeroSection() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-900/20 z-10" />
      <Image
        src="/login-welcome.png"
        alt="Vista del Campus Duoc UC"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 xl:p-12 text-white">
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 w-fit"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Sede Viña del Mar</span>
        </motion.div>

        <motion.div
          className="p-8 xl:p-10 rounded-[2.5rem] bg-white/5 border border-white/10 max-w-lg w-full flex flex-col items-center text-center"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="mb-6 drop-shadow-lg flex flex-col items-center gap-3">
            <span className="text-white/90 text-xl xl:text-3xl font-bold uppercase tracking-tight">Conecta con tus</span>
            <Image
              src="/logo.svg"
              alt="Consejeros de Carrera"
              width={320}
              height={100}
              className="h-auto w-full max-w-[280px] xl:max-w-[320px]"
            />
          </div>
          
          <p className="text-base xl:text-lg text-white/90 leading-relaxed drop-shadow-md font-medium mb-6">
            El espacio seguro donde tus representantes te escuchan, te orientan y gestionan tus necesidades ante la sede.
          </p>

          <motion.ul
            className="text-sm text-white/80 space-y-3 font-medium w-full max-w-sm"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {FEATURES.map((feat) => (
              <motion.li key={feat.icon} className="flex items-center gap-3 text-left" variants={staggerItem}>
                <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 border border-white/10">
                  <Icon icon={feat.icon} className="w-3.5 h-3.5 text-indigo-200" />
                </div>
                <span className="leading-snug">{feat.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </div>
  );
}
