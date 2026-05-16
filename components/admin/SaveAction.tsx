"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader, CheckCircle2, AlertCircle } from "lucide-react";

type SaveActionProps = {
  onSave: () => void;
  saving: boolean;
  message: { type: string; text: string };
  sticky?: boolean;
};

export function SaveAction({ onSave, saving, message, sticky = false }: SaveActionProps) {
  const content = (
    <div className="flex shrink-0 items-center justify-end gap-3">
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-rose-50 text-rose-600 border border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
        {/* Teks disingkat di layar HP biar gak kepanjangan */}
        <span className="hidden sm:inline">{saving ? "Saving..." : "Save Changes"}</span>
        <span className="sm:hidden">{saving ? "..." : "Save"}</span>
      </button>
    </div>
  );

  if (sticky) {
    return (
      // FIXED DI POJOK KANAN BAWAH (bottom-8 right-8)
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50 flex pointer-events-none justify-end md:bottom-8 md:right-8 lg:right-10"
      >
        <div className="pointer-events-auto flex items-center rounded-2xl border border-slate-200/60 bg-white/90 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0c]/90">
          {content}
        </div>
      </motion.div>
    );
  }

  // Render normal untuk ditaruh di header atas
  return content;
}