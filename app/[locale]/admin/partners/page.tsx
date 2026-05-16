"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  HeartHandshake, MessageSquareQuote, Plus, Trash2, Save, 
  Loader, Camera, CheckCircle2, AlertCircle, Image as ImageIcon, 
  ChevronRight, Layout
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
type LangTab = "en" | "id";

function LangTabSwitcher({ value, onChange }: { value: LangTab; onChange: (tab: LangTab) => void }) {
  return (
    <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-xl">
      {(["en", "id"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            value === tab ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "text-gray-500 hover:text-white"
          }`}
        >
          {tab === "en" ? "English" : "Indonesia"}
        </button>
      ))}
    </div>
  );
}

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState("partners");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);

  const [langTab, setLangTab] = useState<LangTab>("id");
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [partnersHeader, setPartnersHeader] = useState("OUR PARTNERS");
  const [partnersHeaderId, setPartnersHeaderId] = useState("");
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [testimonialsHeader, setTestimonialsHeader] = useState("WHAT OUR CLIENTS SAY");
  const [testimonialsHeaderId, setTestimonialsHeaderId] = useState("");

  const applySettingsResponse = (data: Record<string, unknown>) => {
    setPartners(parsePartners(data.partners));
    setPartnersHeader(parsePartnersHeader(data.partners_header));
    setPartnersHeaderId(parsePartnersHeaderId(data.partners_header_id));
    setTestimonials(parseTestimonials(data.testimonials));
    setTestimonialsHeader(parseTestimonialsHeader(data.testimonials_header));
    setTestimonialsHeaderId(parseTestimonialsHeaderId(data.testimonials_header_id));
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings");
        if (!res.ok || cancelled) return;
        applySettingsResponse(await res.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
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

      const body = (await res.json().catch(() => ({}))) as { message?: string };

      if (res.ok) {
        const refreshRes = await fetch("/api/settings");
        if (refreshRes.ok) {
          applySettingsResponse(await refreshRes.json());
        }
        setMessage({ type: "success", text: "Changes saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: body.message || "Failed to save data.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save data." });
    } finally {
      setSaving(false);
    }
  };

  const updateTestimonial = (index: number, patch: Partial<TestimonialRecord>) => {
    setTestimonials((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
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

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader className="animate-spin text-yellow-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <HeartHandshake size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Social Proof Management</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Trust & Partners</h1>
        </div>

        <div className="flex items-center gap-4">
           <AnimatePresence>
            {message.text && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`px-4 py-2 rounded-xl text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {message.text}
              </motion.div>
            )}
           </AnimatePresence>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-50">
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex p-1.5 bg-[#0a0a0c] border border-white/5 rounded-2xl w-fit">
        <button onClick={() => setActiveTab("partners")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "partners" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>
          Partners
        </button>
        <button onClick={() => setActiveTab("testimonials")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "testimonials" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>
          Testimonials
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-yellow-500/[0.02] blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-12">
          {/* Section Title Input */}
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Section Header</label>
              <LangTabSwitcher value={langTab} onChange={setLangTab} />
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white font-bold outline-none focus:border-yellow-500/50 transition-all"
              placeholder="Enter section title..."
            />
          </div>

          {activeTab === "partners" ? (
            /* Partners Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {partners.map((partner, index) => (
                <div key={partner.id} className="group relative aspect-square bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center transition-all hover:border-yellow-500/30">
                  <button onClick={() => setPartners(partners.filter(p => p.id !== partner.id))} className="absolute top-3 right-3 p-2 bg-black/50 text-rose-500 opacity-0 group-hover:opacity-100 rounded-xl transition-all hover:bg-rose-500 hover:text-white">
                    <Trash2 size={14} />
                  </button>
                  
                  <div className="relative w-full h-2/3 mb-4 flex items-center justify-center">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {uploadingImageId === partner.id ? <Loader className="animate-spin text-yellow-500" /> : partner.image ? (
                      <img src={partner.image} className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <ImageIcon className="text-gray-700 group-hover:text-yellow-500/50" size={32} />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={partner.name}
                    onChange={(e) => { const n = [...partners]; n[index].name = e.target.value; setPartners(n); }}
                    className="w-full bg-transparent text-center text-[10px] font-black uppercase tracking-tighter text-gray-500 outline-none focus:text-white transition-colors"
                    placeholder="Brand Name"
                  />
                </div>
              ))}
              <button onClick={() => setPartners([...partners, { id: Date.now(), name: "", image: "" }])} className="aspect-square border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-600 hover:border-yellow-500/50 hover:text-yellow-500 transition-all">
                <Plus size={24} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add Logo</span>
              </button>
            </div>
          ) : (
            /* Testimonials Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {testimonials.map((t, index) => (
                <div key={t.id} className="relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 transition-all hover:border-yellow-500/20 group">
                  <button onClick={() => setTestimonials(testimonials.filter(item => item.id !== t.id))} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>

                  <MessageSquareQuote size={32} className="text-yellow-500/20 mb-6" />
                  
                  <textarea
                    rows={3}
                    value={langTab === "id" ? (t.quote_id ?? "") : t.quote}
                    onChange={(e) => {
                      updateTestimonial(
                        index,
                        langTab === "id" ? { quote_id: e.target.value } : { quote: e.target.value },
                      );
                    }}
                    className="w-full bg-transparent text-lg font-medium text-gray-200 outline-none resize-none italic placeholder:text-gray-700"
                    placeholder={langTab === "id" ? "Kutipan klien..." : "Client quote..."}
                  />

                  <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/5">
                    <div className="relative w-14 h-14 rounded-full bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e, false)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {uploadingImageId === t.id ? <Loader className="animate-spin text-yellow-500" size={16} /> : t.image ? (
                        <img src={t.image} className="w-full h-full object-cover" />
                      ) : <Camera size={16} className="text-gray-600" />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={langTab === "id" ? (t.author_id ?? "") : t.author}
                        onChange={(e) => {
                          updateTestimonial(
                            index,
                            langTab === "id" ? { author_id: e.target.value } : { author: e.target.value },
                          );
                        }}
                        className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-gray-700"
                        placeholder="Client Name"
                      />
                      <input
                        type="text"
                        value={langTab === "id" ? (t.role_id ?? "") : t.role}
                        onChange={(e) => {
                          updateTestimonial(
                            index,
                            langTab === "id" ? { role_id: e.target.value } : { role: e.target.value },
                          );
                        }}
                        className="w-full bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none focus:text-yellow-500"
                        placeholder="Role / Company"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setTestimonials([...testimonials, { id: Date.now(), quote: "", author: "", role: "", image: "" }])} className="min-h-[200px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-600 hover:border-yellow-500/50 hover:text-yellow-500 transition-all">
                <Plus size={32} className="mb-2" />
                <span className="text-xs font-black uppercase tracking-widest">Add Testimonial</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}