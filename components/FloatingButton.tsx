"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Menu, MessageCircle, Plus } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

export default function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleLanguage } = useLanguage();

  const subButtonClass =
    "flex h-12 w-12 cursor-pointer touch-manipulation items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-white shadow-md transition-colors hover:bg-gray-800 active:bg-gray-950";

  return (
    <div className="pointer-events-auto fixed bottom-8 right-6 z-[999] flex flex-col-reverse items-end gap-3 lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-yellow-500 text-black shadow-lg transition-transform active:scale-95"
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="inline-flex"
        >
          <Plus className="h-7 w-7" strokeWidth={2.2} aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ ...springTransition, delay: 0 }}
              className="flex justify-end"
            >
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us"
                className={subButtonClass}
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ ...springTransition, delay: 0.06 }}
              className="flex justify-end"
            >
              <button
                type="button"
                aria-label="Open navigation menu"
                className={subButtonClass}
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new Event("policy:toggle-nav-drawer"));
                }}
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ ...springTransition, delay: 0.12 }}
              className="flex justify-end"
            >
              <button
                type="button"
                aria-label="Switch language"
                className={subButtonClass}
                onClick={() => {
                  setIsOpen(false);
                  toggleLanguage();
                }}
              >
                <Globe className="h-5 w-5" aria-hidden />
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
