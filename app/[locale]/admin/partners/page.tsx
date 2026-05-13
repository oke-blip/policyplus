"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HeartHandshake, MessageSquareQuote, Plus, Edit2, Trash2 } from "lucide-react";

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState("partners");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const mockPartners = [
    { id: 1, name: "TechCorp Global" },
    { id: 2, name: "EcoSolutions Inc." },
    { id: 3, name: "Urban Development Org" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Premium Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold mb-3">
            <HeartHandshake size={16} />
            <span>Social Proof</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Partners & Reviews</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Manage your network of partners and client testimonials.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
          <Plus size={18} />
          Add Entry
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-xl blur-md opacity-0 group-focus-within:opacity-50 transition-opacity" />
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="pl-4 text-slate-400"><HeartHandshake size={18} /></div>
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'partners' ? 'partners' : 'testimonials'}...`} 
              className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
        {activeTab === 'testimonials' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl focus:ring-2 focus:ring-slate-500/20 px-4 py-3 outline-none cursor-pointer shadow-sm">
              <option>All Ratings</option>
              <option>5 Stars</option>
              <option>4 Stars & Up</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl w-fit backdrop-blur-md shadow-sm">
        <button
          onClick={() => setActiveTab("partners")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "partners"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <HeartHandshake size={16} />
          Partner Logos
        </button>
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "testimonials"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <MessageSquareQuote size={16} />
          Testimonials
        </button>
      </div>

      {/* Content Area */}
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {activeTab === "partners" && (
            <motion.div
              key="partners"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockPartners.map((partner) => (
                  <div key={partner.id} className="group relative aspect-square bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{partner.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "testimonials" && (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-10 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 mx-auto mb-6">
                <MessageSquareQuote size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Client Testimonials</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">Add quotes and feedback from your satisfied clients.</p>
              <button className="mt-8 px-6 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold rounded-xl transition-all">
                Add Testimonial
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
