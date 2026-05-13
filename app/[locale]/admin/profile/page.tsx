"use client";

import { useState } from "react";
<<<<<<< HEAD
import { motion, AnimatePresence, type Variants } from "framer-motion";
=======
import { motion, AnimatePresence } from "framer-motion";
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
import { Save, Briefcase, Map, Clock, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState("expertise");

<<<<<<< HEAD
  const containerVariants: Variants = {
=======
  const containerVariants = {
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

<<<<<<< HEAD
  const itemVariants: Variants = {
=======
  const itemVariants = {
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Mock data for display
  const mockExpertise = [
    { id: 1, category: "Regulatory Affairs", title: "Navigating Compliance", bgImage: "/images/exp-1.jpg" },
    { id: 2, category: "Public Policy", title: "Strategic Advocacy", bgImage: "/images/exp-2.jpg" },
  ];

  const mockApproach = [
    { id: 1, phase: "Phase 1", title: "Discovery & Analysis", desc: "We begin by deeply understanding your challenges..." },
    { id: 2, phase: "Phase 2", title: "Strategy Formulation", desc: "Developing a robust policy roadmap tailored to your goals..." },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold mb-3">
            <Briefcase size={16} />
            <span>Company Core</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Company Profile</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Manage your firm's core identity, including areas of expertise, strategic approach, and historical timeline.
          </p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab("expertise")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "expertise"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Briefcase size={16} />
          Our Expertise
        </button>
        <button
          onClick={() => setActiveTab("approach")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "approach"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Map size={16} />
          Our Approach
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "timeline"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Clock size={16} />
          Timeline Method
        </button>
      </div>

      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* OUR EXPERTISE TAB */}
          {activeTab === "expertise" && (
            <motion.div
              key="expertise"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              <section className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Section Text</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                    <input type="text" defaultValue="Our Core Expertise" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                    <textarea rows={3} defaultValue="We specialize in several key areas of public policy and corporate governance." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all resize-none" />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Cards (Expertise List)</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white text-sm font-bold rounded-lg transition-all">
                    <Plus size={16} />
                    Add New Expertise
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockExpertise.map((item) => (
                    <div key={item.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                        {/* Placeholder for Bg Image */}
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          <span className="text-xs uppercase tracking-widest font-bold">Image Area</span>
                        </div>
                      </div>
                      <div className="p-5 relative">
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded hover:text-slate-900 dark:hover:text-white transition-colors"><Edit2 size={14} /></button>
                          <button className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded hover:text-rose-600 transition-colors"><Trash2 size={14} /></button>
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.category}</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 pr-12">{item.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* OUR APPROACH TAB */}
          {activeTab === "approach" && (
            <motion.div
              key="approach"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              <section className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Section Text</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                    <input type="text" defaultValue="Our Proven Approach" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                    <textarea rows={3} defaultValue="A systematic, data-driven methodology to solve your most complex challenges." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all resize-none" />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Approach Phases</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white text-sm font-bold rounded-lg transition-all">
                    <Plus size={16} />
                    Add Phase
                  </button>
                </div>

                <div className="space-y-4">
                  {mockApproach.map((item) => (
                    <div key={item.id} className="group flex items-start gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-400 transition-colors relative">
                       <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-900 dark:text-white font-bold flex-shrink-0">
                         {item.id}
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.phase}</p>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                       </div>
                       <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Edit2 size={16} /></button>
                         <button className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* TIMELINE METHOD TAB */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-10 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Timeline Method Setup</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">Manage the timeline steps, icons, and bulletin lists for the Timeline section here.</p>
              <button className="mt-6 px-6 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold rounded-xl transition-all">
                Create Timeline Entry
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Save Button Container */}
      <motion.div variants={itemVariants} className="flex justify-end pt-4">
        <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
          <Save size={20} />
          Save All Changes
        </button>
      </motion.div>
    </motion.div>
  );
}
