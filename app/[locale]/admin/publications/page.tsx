"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { BookOpen, Newspaper, Plus, Search, Filter, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

export default function PublicationsPage() {
  const [activeTab, setActiveTab] = useState("insights");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const mockInsights = [
    { id: 1, title: "The Future of Digital Governance", publisher: "Sarah Jenkins", date: "Oct 24, 2026", category: "Technology" },
    { id: 2, title: "Navigating AI Regulations in 2027", publisher: "Dr. Alan Turing", date: "Nov 02, 2026", category: "Policy" },
    { id: 3, title: "Sustainable Urban Development", publisher: "Emma Watson", date: "Nov 15, 2026", category: "Environment" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Premium Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold mb-3">
            <BookOpen size={16} />
            <span>Content Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Publications</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Create, edit, and organize your Latest Insights articles and Knowledge Center documents.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
          <Plus size={18} />
          Create New Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl w-fit backdrop-blur-md shadow-sm">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "insights"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Newspaper size={16} />
          Latest Insights
        </button>
        <button
          onClick={() => setActiveTab("knowledge")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "knowledge"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen size={16} />
          Knowledge Center
        </button>
      </div>

      {/* Content Area */}
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-xl blur-md opacity-0 group-focus-within:opacity-50 transition-opacity" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
              <div className="pl-4 text-slate-400"><Search size={18} /></div>
              <input 
                type="text" 
                placeholder={`Search ${activeTab === 'insights' ? 'articles' : 'documents'}...`} 
                className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Premium Table Design */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Article Details</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Publisher</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Date</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {mockInsights.map((post) => (
                      <tr key={post.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{post.title}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                                {post.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{post.publisher}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {post.date}
                        </td>
                        <td className="py-5 pl-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5"><Edit2 size={16} /></button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "knowledge" && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-20 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 mx-auto mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Knowledge Center Documents</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">Upload and manage guides, whitepapers, and reports for your users.</p>
              <button className="mt-8 px-6 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold rounded-xl transition-all">
                Upload Document
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
