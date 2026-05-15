"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CalendarDays, MapPin, Plus, Edit2, Trash2, X, Loader, Camera, Globe, CheckCircle2, AlertCircle, Search } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "Conference",
    date: "",
    location: "",
    image: "",
    link: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event: any = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        category: event.category || "Conference",
        date: event.date,
        location: event.location,
        image: event.image,
        link: event.link || ""
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        category: "Conference",
        date: "",
        location: "",
        image: "",
        link: ""
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const method = editingEvent ? "PUT" : "POST";
      const body = editingEvent ? { id: editingEvent.id, ...formData } : formData;

      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Event ${editingEvent ? "updated" : "created"} successfully!` });
        setModalOpen(false);
        fetchEvents();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save event." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Event deleted successfully!" });
        fetchEvents();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete event." });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Events</h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">Manage upcoming conferences, webinars, and policy sessions.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                  message.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                }`}
              >
                {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Add Event
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search events by title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader className="animate-spin text-slate-300" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <motion.div 
              key={event.id}
              variants={itemVariants}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-video w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Camera size={32} opacity={0.3} /></div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md border border-white/20">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 min-h-[3.5rem] leading-tight">
                  {event.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <CalendarDays size={16} className="text-slate-400" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="text-slate-400" />
                    {event.location}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                  <button 
                    onClick={() => handleOpenModal(event)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400">
               <CalendarDays size={48} className="mb-4 opacity-20" />
               <p className="font-medium">No events found</p>
               <button onClick={() => handleOpenModal()} className="mt-4 text-sm font-bold text-slate-900 dark:text-white underline underline-offset-4">Create your first event</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Event Title</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" 
                      placeholder="e.g. Global Policy Summit 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option>Conference</option>
                      <option>Webinar</option>
                      <option>Roundtable</option>
                      <option>Workshop</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date & Time</label>
                    <input 
                      required
                      type="datetime-local" 
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" 
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" 
                        placeholder="e.g. Jakarta, Indonesia or Online (Zoom)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Registration / Detail Link</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" 
                        placeholder="e.g. https://event-link.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Event Banner</label>
                    <div className="relative h-48 w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer overflow-hidden group">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Camera size={32} className="text-slate-300 mb-2" />
                          <span className="text-sm font-bold text-slate-400">Upload Banner Image</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-[2] py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader className="animate-spin" size={20} /> : null}
                    {saving ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
