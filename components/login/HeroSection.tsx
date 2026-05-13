"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/transitions";

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
      <div className="absolute bottom-8 left-8 right-8 xl:bottom-12 xl:left-12 xl:right-12 z-20 text-white">
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 xl:mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-widest">Sede Viña del Mar</span>
        </motion.div>

        <motion.div
          className="p-5 xl:p-6 -ml-5 xl:-ml-6 rounded-[2rem] xl:rounded-[2.5rem] bg-white/5 border border-white/10"
          style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="mb-3 xl:mb-6 drop-shadow-lg flex flex-col gap-2">
            <span className="text-white/90 text-xl xl:text-3xl font-bold uppercase tracking-tight">Conecta con tus</span>
            <Image
              src="/logo.svg"
              alt="Consejeros de Carrera"
              width={280}
              height={80}
              className="h-auto"
            />
          </div>
          <p className="text-base xl:text-lg text-white/90 max-w-md leading-relaxed drop-shadow-md font-medium mb-4 xl:mb-5">
            El espacio seguro donde tus representantes te escuchan, te orientan y gestionan tus necesidades ante la sede.
          </p>
          <motion.ul
            className="text-sm text-white/80 space-y-2 xl:space-y-3 font-medium"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {FEATURES.map((feat) => (
              <motion.li key={feat.icon} className="flex items-center gap-3" variants={staggerItem}>
                <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon icon={feat.icon} className="w-3 h-3 xl:w-4 xl:h-4 text-indigo-300" />
                </div>
                {feat.text}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </div>
  );
}
