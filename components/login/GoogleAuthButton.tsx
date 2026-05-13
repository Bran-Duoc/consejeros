"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface GoogleAuthButtonProps {
  loading: boolean;
  onClick: () => void;
}

export function GoogleAuthButton({ loading, onClick }: GoogleAuthButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="w-full group relative flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-5 rounded-xl sm:rounded-2xl border-2 border-slate-100 hover:border-indigo-500 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
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
        <Icon icon="lucide:loader-2" className="absolute right-5 w-5 h-5 animate-spin text-indigo-600" />
      )}
    </motion.button>
  );
}
