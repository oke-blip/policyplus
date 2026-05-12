"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, Plus, Edit2, Trash2 } from "lucide-react";

export default function EventsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const mockEvents = [
    { id: 1, title: "Global Tech Policy Summit 2027", category: "Conference", date: "March 15-17, 2027", location: "Geneva, Switzerland" },
    { id: 2, title: "AI Ethics Roundtable", category: "Webinar", date: "April 05, 2027", location: "Online (Zoom)" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Premium Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold mb-3">
            <CalendarDays size={16} />
            <span>Event Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Upcoming Events</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Schedule and manage webinars, conferences, and meetups.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
          <Plus size={18} />
          Create Event
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-xl blur-md opacity-0 group-focus-within:opacity-50 transition-opacity" />
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="pl-4 text-slate-400"><CalendarDays size={18} /></div>
            <input 
              type="text" 
              placeholder="Search events..." 
              className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl focus:ring-2 focus:ring-slate-500/20 px-4 py-3 outline-none cursor-pointer shadow-sm">
            <option>All Categories</option>
            <option>Conference</option>
            <option>Webinar</option>
          </select>
          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl focus:ring-2 focus:ring-slate-500/20 px-4 py-3 outline-none cursor-pointer shadow-sm">
            <option>Upcoming</option>
            <option>Past Events</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockEvents.map((event) => (
            <div key={event.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"><Edit2 size={16} /></button>
                <button className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
              
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 mb-4">
                {event.category}
              </span>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pr-16">{event.title}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><CalendarDays size={16} /></div>
                  {event.date}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><MapPin size={16} /></div>
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
