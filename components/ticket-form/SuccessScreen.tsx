"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { scaleIn, transitions } from "@/lib/transitions";

interface SuccessScreenProps {
  ticketId: string;
  onNewTicket: () => void;
}

export function SuccessScreen({ ticketId, onNewTicket }: SuccessScreenProps) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <motion.div
        className="max-w-sm w-full text-center bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        transition={transitions.spring}
      >
        <motion.div
          className="w-14 h-14 mx-auto rounded-full bg-brand-green-light flex items-center justify-center text-2xl mb-4 text-brand-green-dark"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...transitions.springBouncy, delay: 0.2 }}
        >
          <Icon icon="lucide:check-circle-2" />
        </motion.div>
        <motion.h1
          className="text-xl font-bold mb-1 text-slate-900"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ¡Solicitud Enviada!
        </motion.h1>
        <motion.p
          className="text-slate-500 text-sm mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Tu solicitud fue registrada y asignada.
        </motion.p>
        <motion.p
          className="text-xs text-slate-400 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Folio: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-mono font-bold text-slate-800">{ticketId?.slice(0, 8)}</code>
        </motion.p>
        <motion.button
          type="button"
          onClick={onNewTicket}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold shadow-md shadow-brand-blue/20 hover:bg-brand-blue-dark transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Nueva Solicitud
        </motion.button>
      </motion.div>
    </div>
  );
}
