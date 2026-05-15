"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HeartHandshake, MessageSquareQuote, Plus, Edit2, Trash2, Save, Loader, Camera, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState("partners");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [partners, setPartners] = useState<any[]>([]);
  const [partnersHeader, setPartnersHeader] = useState("OUR PARTNERS");
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialsHeader, setTestimonialsHeader] = useState("WHAT OUR CLIENTS SAY");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
        setPartnersHeader(data.partners_header || "OUR PARTNERS");
        setTestimonials(data.testimonials || []);
        setTestimonialsHeader(data.testimonials_header || "WHAT OUR CLIENTS SAY");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partners, partners_header: partnersHeader, testimonials, testimonials_header: testimonialsHeader }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const addPartner = () => {
    setPartners([...partners, { id: Date.now(), name: "New Partner", image: "" }]);
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { id: Date.now(), quote: "", author: "", role: "", image: "" }]);
  };

  const removePartner = (id: any) => {
    setPartners(partners.filter(p => p.id !== id));
  };

  const removeTestimonial = (id: any) => {
    setTestimonials(testimonials.filter(t => t.id !== id));
  };

  const handleImageUpload = (list: any[], setList: Function, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newList = [...list];
        newList[index].image = reader.result;
        setList(newList);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader className="animate-spin text-slate-400" size={40} /></div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Partners & Testimonials</h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">Manage social proof and client feedback.</p>
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
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl w-fit backdrop-blur-md shadow-sm">
        <button onClick={() => setActiveTab("partners")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "partners" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
          <HeartHandshake size={16} /> Partner Logos
        </button>
        <button onClick={() => setActiveTab("testimonials")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "testimonials" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
          <MessageSquareQuote size={16} /> Testimonials
        </button>
      </div>

      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
        {activeTab === "partners" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Header</label>
              <input type="text" value={partnersHeader} onChange={(e) => setPartnersHeader(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {partners.map((partner, index) => (
                <div key={partner.id} className="group relative aspect-square bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl transition-all">
                  <button onClick={() => removePartner(partner.id)} className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                  <div className="relative w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden group/img cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(partners, setPartners, index, e)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                    {partner.image ? <img src={partner.image} className="w-full h-full object-contain p-2" /> : <div className="flex items-center justify-center h-full text-slate-400"><Camera size={24} /></div>}
                  </div>
                  <input type="text" value={partner.name} onChange={(e) => {
                    const newList = [...partners];
                    newList[index].name = e.target.value;
                    setPartners(newList);
                  }} className="w-full bg-transparent text-center text-sm font-bold outline-none focus:text-slate-900 dark:focus:text-white" placeholder="Partner Name" />
                </div>
              ))}
              <button onClick={addPartner} className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 transition-all">
                <Plus size={32} className="mb-2" />
                <span className="text-sm font-bold uppercase tracking-wider">Add Logo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Header</label>
              <input type="text" value={testimonialsHeader} onChange={(e) => setTestimonialsHeader(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {testimonials.map((t, index) => (
                  <div key={t.id} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                    <button onClick={() => removeTestimonial(t.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={18} /></button>
                    <textarea rows={3} value={t.quote} onChange={(e) => {
                      const newList = [...testimonials];
                      newList[index].quote = e.target.value;
                      setTestimonials(newList);
                    }} className="w-full bg-transparent text-lg font-medium text-slate-700 dark:text-slate-200 outline-none resize-none mb-6 italic" placeholder="Client Quote..." />
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer group">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(testimonials, setTestimonials, index, e)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                        {t.image ? <img src={t.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-400"><Camera size={18} /></div>}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input type="text" value={t.author} onChange={(e) => {
                          const newList = [...testimonials];
                          newList[index].author = e.target.value;
                          setTestimonials(newList);
                        }} className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none" placeholder="Author Name" />
                        <input type="text" value={t.role} onChange={(e) => {
                          const newList = [...testimonials];
                          newList[index].role = e.target.value;
                          setTestimonials(newList);
                        }} className="w-full bg-transparent text-xs text-slate-500 outline-none" placeholder="Role / Company" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addTestimonial} className="min-h-[200px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 transition-all">
                  <Plus size={32} className="mb-2" />
                  <span className="text-sm font-bold uppercase tracking-wider">Add Testimonial</span>
                </button>
             </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
