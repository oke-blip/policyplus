"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  HeartHandshake, MessageSquareQuote, Plus, Trash2, Save, 
  Loader, Camera, CheckCircle2, AlertCircle, Image as ImageIcon, 
  X, Briefcase
} from "lucide-react";

import {
  extractTestimonialIdRows,
  parsePartners,
  parsePartnersHeader,
  parsePartnersHeaderId,
  parseTestimonials,
  parseTestimonialsHeader,
  parseTestimonialsHeaderId,
  preparePartnersForSave,
  prepareTestimonialsForSave,
  type PartnerRecord,
  type TestimonialRecord,
} from "@/lib/partners-testimonials";
import { applyPartnersTestimonialsSmartFallback } from "@/lib/cms-smart-fallback";
import { uploadToSupabase } from "@/lib/upload";
import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<"partners" | "testimonials">("partners");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);

  const [langTab, setLangTab] = useState<AdminLangTab>("id");
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [partnersHeader, setPartnersHeader] = useState("OUR PARTNERS");
  const [partnersHeaderId, setPartnersHeaderId] = useState("");
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [testimonialsHeader, setTestimonialsHeader] = useState("WHAT OUR CLIENTS SAY");
  const [testimonialsHeaderId, setTestimonialsHeaderId] = useState("");

  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: "partner" | "testimonial"; name: string } | null>(null);

  const applySettingsResponse = (data: Record<string, unknown>) => {
    setPartners(parsePartners(data.partners));
    setPartnersHeader(parsePartnersHeader(data.partners_header));
    setPartnersHeaderId(parsePartnersHeaderId(data.partners_header_id));
    setTestimonials(parseTestimonials(data.testimonials));
    setTestimonialsHeader(parseTestimonialsHeader(data.testimonials_header));
    setTestimonialsHeaderId(parseTestimonialsHeaderId(data.testimonials_header_id));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings?t=" + Date.now());
        if (res.ok) applySettingsResponse(await res.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (uploadingImageId !== null) return;
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const testimonialsWithFallback = applyPartnersTestimonialsSmartFallback(testimonials);

      const payload = {
        partners: preparePartnersForSave(partners),
        partners_header: partnersHeader.trim() || "OUR PARTNERS",
        partners_header_id: partnersHeaderId.trim(),
        testimonials: prepareTestimonialsForSave(testimonialsWithFallback),
        testimonials_header: testimonialsHeader.trim() || "WHAT OUR CLIENTS SAY",
        testimonials_header_id: testimonialsHeaderId.trim(),
        testimonials_id: extractTestimonialIdRows(testimonials),
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save data." });
    } finally { setSaving(false); }
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>, isPartner: boolean) => {
    const file = e.target.files?.[0];
    if (!file || file.size > MAX_IMAGE_BYTES) return;
    const list = isPartner ? partners : testimonials;
    const item = list[index];
    const previewUrl = URL.createObjectURL(file);
    
    const updateImage = (url: string) => {
      if (isPartner) {
        setPartners(prev => { const n = [...prev]; n[index].image = url; return n; });
      } else {
        setTestimonials(prev => { const n = [...prev]; n[index].image = url; return n; });
      }
    };

    updateImage(previewUrl);
    try {
      setUploadingImageId(item.id);
      const url = await uploadToSupabase(file, "public-assets", isPartner ? "partners" : "testimonials");
      updateImage(url);
    } catch (err) { setMessage({ type: "error", text: "Upload failed." }); } 
    finally { setUploadingImageId(null); URL.revokeObjectURL(previewUrl); }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader className="animate-spin text-white/20" size={32} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 pb-20">
      
      {/* HEADER - MATCHING EVENTS/TEAMS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Social Proof</h1>
          <p className="mt-1 text-slate-400">Manage your partner logos and client testimonials.</p>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {message.text && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-950 hover:bg-slate-200 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* TABS - MATCHING EVENTS */}
      <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("partners")} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "partners" ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
        >
          Partners
        </button>
        <button 
          onClick={() => setActiveTab("testimonials")} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "testimonials" ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
        >
          Testimonials
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="space-y-8">
        
        {/* SECTION HEADER CARD */}
        <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Section Header Title</label>
              <AdminLangTabs value={langTab} onChange={setLangTab} />
            </div>
            <input
              type="text"
              value={activeTab === "partners" ? (langTab === "id" ? partnersHeaderId : partnersHeader) : (langTab === "id" ? testimonialsHeaderId : testimonialsHeader)}
              onChange={(e) => {
                if (activeTab === "partners") {
                  langTab === "id" ? setPartnersHeaderId(e.target.value) : setPartnersHeader(e.target.value);
                } else {
                  langTab === "id" ? setTestimonialsHeaderId(e.target.value) : setTestimonialsHeader(e.target.value);
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white font-bold outline-none focus:border-white/30 transition-all"
              placeholder="Enter section title..."
            />
          </div>
        </div>

        {activeTab === "partners" ? (
          /* PARTNERS GRID - MATCHING TEAMS STYLE */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {partners.map((partner, index) => (
              <motion.div key={partner.id} variants={itemVariants} className="group relative bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center transition-all hover:border-white/20">
                <button 
                  onClick={() => setPartners(partners.filter(p => p.id !== partner.id))} 
                  className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 rounded-xl transition-all hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
                
                <div className="relative w-full aspect-square mb-4 flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {uploadingImageId === partner.id ? (
                    <Loader className="animate-spin text-white/20" />
                  ) : partner.image ? (
                    <img src={partner.image} className="max-h-[70%] max-w-[70%] object-contain filter brightness-0 invert opacity-60 group-hover:opacity-100 transition-all" />
                  ) : (
                    <ImageIcon className="text-white/10" size={32} />
                  )}
                </div>
                
                <input
                  type="text"
                  value={partner.name}
                  onChange={(e) => { const n = [...partners]; n[index].name = e.target.value; setPartners(n); }}
                  className="w-full bg-transparent text-center text-xs font-bold text-slate-400 outline-none focus:text-white transition-colors"
                  placeholder="Brand Name"
                />
              </motion.div>
            ))}
            <button 
              onClick={() => setPartners([...partners, { id: Date.now(), name: "", image: "" }])} 
              className="aspect-square border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 hover:border-white/30 hover:text-white transition-all bg-white/[0.02]"
            >
              <Plus size={32} className="mb-2 opacity-20" />
              <span className="text-xs font-bold uppercase tracking-widest">Add Logo</span>
            </button>
          </div>
        ) : (
          /* TESTIMONIALS - MATCHING TEAMS STYLE */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {testimonials.map((t, index) => (
              <motion.div key={t.id} variants={itemVariants} className="relative bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 transition-all hover:border-white/20 group">
                <button 
                  onClick={() => setTestimonials(testimonials.filter(item => item.id !== t.id))} 
                  className="absolute top-6 right-6 p-2 text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>

                <MessageSquareQuote size={40} className="text-white/5 mb-6" />
                
                <textarea
                  rows={4}
                  value={langTab === "id" ? (t.quote_id ?? "") : t.quote}
                  onChange={(e) => {
                    const newList = [...testimonials];
                    langTab === "id" ? (newList[index].quote_id = e.target.value) : (newList[index].quote = e.target.value);
                    setTestimonials(newList);
                  }}
                  className="w-full bg-transparent text-lg font-medium text-slate-200 outline-none resize-none italic placeholder:text-slate-700"
                  placeholder={langTab === "id" ? "Tulis kutipan klien di sini..." : "Type client quote here..."}
                />

                <div className="flex items-center gap-5 mt-8 pt-8 border-t border-white/5">
                  <div className="relative w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e, false)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {uploadingImageId === t.id ? (
                      <Loader className="animate-spin text-white/20" size={16} />
                    ) : t.image ? (
                      <img src={t.image} className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={20} className="text-white/10" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <AdminLangTabs value={langTab} onChange={setLangTab} />
                    </div>
                    <input
                      type="text"
                      value={langTab === "id" ? (t.author_id ?? "") : t.author}
                      onChange={(e) => {
                        const newList = [...testimonials];
                        langTab === "id" ? (newList[index].author_id = e.target.value) : (newList[index].author = e.target.value);
                        setTestimonials(newList);
                      }}
                      className="w-full bg-transparent text-base font-bold text-white outline-none"
                      placeholder="Author Name"
                    />
                    <input
                      type="text"
                      value={langTab === "id" ? (t.role_id ?? "") : t.role}
                      onChange={(e) => {
                        const newList = [...testimonials];
                        langTab === "id" ? (newList[index].role_id = e.target.value) : (newList[index].role = e.target.value);
                        setTestimonials(newList);
                      }}
                      className="w-full bg-transparent text-sm text-slate-500 outline-none"
                      placeholder="Role / Company"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            <button 
              onClick={() => setTestimonials([...testimonials, { id: Date.now(), quote: "", author: "", role: "", image: "" }])} 
              className="min-h-[300px] border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-500 hover:border-white/30 hover:text-white transition-all bg-white/[0.02]"
            >
              <Plus size={40} className="mb-2 opacity-20" />
              <span className="text-sm font-bold uppercase tracking-widest">Add Testimonial</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}