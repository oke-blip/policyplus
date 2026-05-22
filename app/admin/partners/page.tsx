"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  Loader,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  X,
  Search,
  Layout,
  Type,
  AlignLeft,
} from "lucide-react";

import {
  loadLogoItemsFromSettings,
  mergeLogoItems,
  parseMediaCoverageDescription,
  parseMediaCoverageDescriptionId,
  parseMediaCoverageHeader,
  parseMediaCoverageHeaderId,
  parsePartnersHeader,
  parsePartnersHeaderId,
  parsePartnersDescription,
  parsePartnersDescriptionId,
  prepareMediaCoverageForSave,
  preparePartnersForSave,
  prepareUnifiedLogoItemsForSave,
  splitLogoItemsByType,
  type MediaCoverageRecord,
  type PartnerRecord,
} from "@/lib/partners-testimonials";
import {
  applyMediaCoverageSmartFallback,
  applySmartFallback,
  SMART_FALLBACK_PARTNERS_HEADER_PAIRS,
} from "@/lib/cms-smart-fallback";
import { uploadToSupabase } from "@/lib/upload";
import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<"partners" | "media_coverage">("partners");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);

  // State untuk Search
  const [searchQuery, setSearchQuery] = useState("");

  const [langTab, setLangTab] = useState<AdminLangTab>("id");
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [partnersHeader, setPartnersHeader] = useState("OUR PARTNERS");
  const [partnersHeaderId, setPartnersHeaderId] = useState("");
  const [partnersDescription, setPartnersDescription] = useState("");
  const [partnersDescriptionId, setPartnersDescriptionId] = useState("");
  const [mediaCoverage, setMediaCoverage] = useState<MediaCoverageRecord[]>([]);
  const [mediaCoverageHeader, setMediaCoverageHeader] = useState("MEDIA COVERAGE");
  const [mediaCoverageHeaderId, setMediaCoverageHeaderId] = useState("");
  const [mediaCoverageDescription, setMediaCoverageDescription] = useState("");
  const [mediaCoverageDescriptionId, setMediaCoverageDescriptionId] = useState("");

  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: "partner" | "media_coverage";
    name: string;
  } | null>(null);

  const applySettingsResponse = (data: Record<string, unknown>) => {
    const { partners: partnerRows, mediaCoverage: mediaRows } = splitLogoItemsByType(
      loadLogoItemsFromSettings(data),
    );
    setPartners(partnerRows);
    setPartnersHeader(parsePartnersHeader(data.partners_header));
    setPartnersHeaderId(parsePartnersHeaderId(data.partners_header_id));
    setPartnersDescription(parsePartnersDescription(data.partners_description));
    setPartnersDescriptionId(parsePartnersDescriptionId(data.partners_description_id));
    setMediaCoverage(mediaRows);
    setMediaCoverageHeader(parseMediaCoverageHeader(data));
    setMediaCoverageHeaderId(parseMediaCoverageHeaderId(data));
    setMediaCoverageDescription(parseMediaCoverageDescription(data.media_coverage_description));
    setMediaCoverageDescriptionId(
      parseMediaCoverageDescriptionId(data.media_coverage_description_id),
    );
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

  // Reset search saat pindah tab
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const handleSave = async () => {
    if (uploadingImageId !== null) return;
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const mediaWithFallback = applyMediaCoverageSmartFallback(mediaCoverage);
      const preparedMedia = prepareMediaCoverageForSave(mediaWithFallback);
      const preparedPartners = preparePartnersForSave(partners);
      const partnersItems = prepareUnifiedLogoItemsForSave(
        mergeLogoItems(preparedPartners, preparedMedia),
      );

      const headerPayload = applySmartFallback(
        {
          partners_header: partnersHeader.trim() || "OUR PARTNERS",
          partners_header_id: partnersHeaderId.trim(),
          partners_description: partnersDescription.trim(),
          partners_description_id: partnersDescriptionId.trim(),
          media_coverage_header: mediaCoverageHeader.trim() || "MEDIA COVERAGE",
          media_coverage_header_id: mediaCoverageHeaderId.trim(),
          media_coverage_description: mediaCoverageDescription.trim(),
          media_coverage_description_id: mediaCoverageDescriptionId.trim(),
        },
        SMART_FALLBACK_PARTNERS_HEADER_PAIRS,
      );

      const payload = {
        partners_items: partnersItems,
        partners: preparedPartners,
        testimonials: [],
        ...headerPayload,
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

  // Menggunakan itemId alih-alih index untuk mencegah bug saat filter search aktif
  const handleImageUpload = async (
    itemId: number,
    e: React.ChangeEvent<HTMLInputElement>,
    listType: "partner" | "media_coverage",
  ) => {
    const file = e.target.files?.[0];
    if (!file || file.size > MAX_IMAGE_BYTES) return;

    const originalList = listType === "partner" ? partners : mediaCoverage;
    const originalIndex = originalList.findIndex(item => item.id === itemId);
    if (originalIndex === -1) return;

    const item = originalList[originalIndex];
    const previousImage = item.image ?? "";
    const previewUrl = URL.createObjectURL(file);

    const updateImage = (url: string) => {
      if (listType === "partner") {
        setPartners((prev) => {
          const next = [...prev];
          next[originalIndex] = { ...next[originalIndex], image: url };
          return next;
        });
      } else {
        setMediaCoverage((prev) => {
          const next = [...prev];
          next[originalIndex] = { ...next[originalIndex], image: url };
          return next;
        });
      }
    };

    updateImage(previewUrl);
    try {
      setUploadingImageId(item.id);
      const url = await uploadToSupabase(
        file,
        "public-assets",
        listType === "partner" ? "partners" : "testimonials",
      );
      updateImage(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      updateImage(previousImage);
      setMessage({ type: "error", text: "Upload failed." });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingImageId(null);
      e.target.value = "";
    }
  };

  // Logika Filter Pencarian
  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;
    return partners.filter((p) => 
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [partners, searchQuery]);

  const filteredMediaCoverage = useMemo(() => {
    if (!searchQuery) return mediaCoverage;
    const q = searchQuery.toLowerCase();
    return mediaCoverage.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(q) ||
        (item.name_id || "").toLowerCase().includes(q),
    );
  }, [mediaCoverage, searchQuery]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader className="animate-spin text-gray-400 dark:text-white/20" size={32} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Social Proof</h1>
          <p className="mt-1 text-gray-500 dark:text-slate-400">Manage partner logos and media coverage logos.</p>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {message.text && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 border border-gray-200 dark:bg-white/5 dark:border-white/10 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("partners")} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "partners" ? "bg-white text-gray-900 dark:bg-white/10 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
        >
          Partners
        </button>
        <button 
          onClick={() => setActiveTab("media_coverage")} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "media_coverage" ? "bg-white text-gray-900 dark:bg-white/10 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
        >
          Media Coverage
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="space-y-8">
        
        {/* NEW SECTION HEADER CONFIGURATION CARD */}
        <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
          {/* Card Header */}
          <div className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                <Layout className="text-gray-500 dark:text-gray-400" size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Header Configuration</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customize the title and description for this section</p>
              </div>
            </div>
            <AdminLangTabs value={langTab} onChange={setLangTab} />
          </div>

          {/* Card Body */}
          <div className="p-8">
            <div className="max-w-3xl space-y-6">
              
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Section Title
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Type size={18} />
                  </div>
                  <input
                    type="text"
                    value={activeTab === "partners" ? (langTab === "id" ? partnersHeaderId : partnersHeader) : (langTab === "id" ? mediaCoverageHeaderId : mediaCoverageHeader)}
                    onChange={(e) => {
                      if (activeTab === "partners") {
                        langTab === "id" ? setPartnersHeaderId(e.target.value) : setPartnersHeader(e.target.value);
                      } else {
                        langTab === "id" ? setMediaCoverageHeaderId(e.target.value) : setMediaCoverageHeader(e.target.value);
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 text-lg text-gray-900 dark:text-white font-bold outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 dark:focus:border-yellow-500/50 dark:focus:ring-yellow-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder={langTab === "en" ? "e.g. Our Partners" : "mis. Mitra Kami"}
                  />
                </div>
              </div>

              {/* Description Input (Only for Partners) */}
              {activeTab === "partners" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Section Description
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-5 text-gray-400">
                      <AlignLeft size={18} />
                    </div>
                    <textarea
                      rows={3}
                      value={langTab === "id" ? partnersDescriptionId : partnersDescription}
                      onChange={(e) => {
                        langTab === "id"
                          ? setPartnersDescriptionId(e.target.value)
                          : setPartnersDescription(e.target.value);
                      }}
                      className="w-full resize-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm leading-relaxed text-gray-700 dark:text-slate-300 outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 dark:focus:border-yellow-500/50 dark:focus:ring-yellow-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      placeholder={langTab === "en" ? "Short description shown under the section title..." : "Deskripsi singkat yang tampil di bawah judul bagian..."}
                    />
                  </div>
                </div>
              ) : null}
              
            </div>
          </div>
        </div>

        {/* SEARCH BAR AREA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {activeTab === "partners" ? "Manage Logos" : "Manage Media Logos"}
          </h2>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-yellow-500 dark:focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all shadow-sm dark:shadow-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-white transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {activeTab === "partners" ? (
          /* PARTNERS GRID */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPartners.map((partner) => (
                <motion.div layout key={partner.id} variants={itemVariants} initial="hidden" animate="show" exit="hidden" className="group relative bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center transition-all hover:border-yellow-500/50 dark:hover:border-white/20 shadow-sm hover:shadow-md dark:shadow-none">
                  <button 
                    onClick={() => setItemToDelete({ id: partner.id, type: "partner", name: partner.name || "this logo" })} 
                    className="absolute top-4 right-4 p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 rounded-xl transition-all hover:bg-rose-500 hover:text-white z-20"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <div className="relative w-full aspect-square mb-4 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(partner.id, e, "partner")} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {uploadingImageId === partner.id ? (
                      <Loader className="animate-spin text-gray-400 dark:text-white/20" />
                    ) : partner.image ? (
                      <img
                        src={partner.image}
                        alt={partner.name || "Partner logo"}
                        className="max-h-[70%] max-w-[70%] object-contain dark:filter dark:brightness-0 dark:invert dark:opacity-60 dark:group-hover:opacity-100 transition-all duration-500"
                      />
                    ) : (
                      <ImageIcon className="text-gray-300 dark:text-white/10 group-hover:text-yellow-500/50 transition-colors" size={32} />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={partner.name}
                    onChange={(e) => { 
                      const originalIndex = partners.findIndex(p => p.id === partner.id);
                      if (originalIndex === -1) return;
                      const n = [...partners]; 
                      n[originalIndex].name = e.target.value; 
                      setPartners(n); 
                    }}
                    className="w-full bg-transparent text-center text-xs font-bold text-gray-500 dark:text-slate-400 outline-none focus:text-gray-900 dark:focus:text-white transition-colors"
                    placeholder="Brand Name"
                  />
                </motion.div>
              ))}

              {filteredPartners.length === 0 && searchQuery && (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-12 text-center text-gray-500 dark:text-slate-500 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem]">
                  No partners found matching "{searchQuery}"
                </motion.div>
              )}

              {/* Sembunyikan tombol add jika sedang dalam mode search */}
              {!searchQuery && (
                <motion.button 
                  layout
                  onClick={() => setPartners([...partners, { id: Date.now(), name: "", image: "" }])} 
                  className="aspect-square border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 hover:border-yellow-500 hover:text-yellow-600 dark:hover:border-white/30 dark:hover:text-white transition-all bg-gray-50 dark:bg-white/[0.02]"
                >
                  <Plus size={32} className="mb-2 opacity-30 dark:opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">Add Logo</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMediaCoverage.map((item) => (
                <motion.div layout key={item.id} variants={itemVariants} initial="hidden" animate="show" exit="hidden" className="group relative bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center transition-all hover:border-yellow-500/50 dark:hover:border-white/20 shadow-sm hover:shadow-md dark:shadow-none">
                  <button
                    onClick={() =>
                      setItemToDelete({
                        id: item.id,
                        type: "media_coverage",
                        name: item.name || "this logo",
                      })
                    }
                    className="absolute top-4 right-4 p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 rounded-xl transition-all hover:bg-rose-500 hover:text-white z-20"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="relative w-full aspect-square mb-4 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(item.id, e, "media_coverage")} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {uploadingImageId === item.id ? (
                      <Loader className="animate-spin text-gray-400 dark:text-white/20" />
                    ) : item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || "Media logo"}
                        className="max-h-[70%] max-w-[70%] object-contain dark:filter dark:brightness-0 dark:invert dark:opacity-60 dark:group-hover:opacity-100 transition-all duration-500"
                      />
                    ) : (
                      <ImageIcon className="text-gray-300 dark:text-white/10 group-hover:text-yellow-500/50 transition-colors" size={32} />
                    )}
                  </div>

                  <input
                    type="text"
                    value={langTab === "id" ? (item.name_id ?? "") : item.name}
                    onChange={(e) => {
                      const originalIndex = mediaCoverage.findIndex((m) => m.id === item.id);
                      if (originalIndex === -1) return;
                      const next = [...mediaCoverage];
                      if (langTab === "id") {
                        next[originalIndex].name_id = e.target.value;
                      } else {
                        next[originalIndex].name = e.target.value;
                      }
                      setMediaCoverage(next);
                    }}
                    className="w-full bg-transparent text-center text-xs font-bold text-gray-500 dark:text-slate-400 outline-none focus:text-gray-900 dark:focus:text-white transition-colors"
                    placeholder="Outlet name (optional)"
                  />
                </motion.div>
              ))}

              {filteredMediaCoverage.length === 0 && searchQuery && (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-12 text-center text-gray-500 dark:text-slate-500 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem]">
                  No media logos found matching "{searchQuery}"
                </motion.div>
              )}

              {!searchQuery && (
                <motion.button
                  layout
                  onClick={() =>
                    setMediaCoverage([...mediaCoverage, { id: Date.now(), name: "", image: "" }])
                  }
                  className="aspect-square border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 hover:border-yellow-500 hover:text-yellow-600 dark:hover:border-white/30 dark:hover:text-white transition-all bg-gray-50 dark:bg-white/[0.02]"
                >
                  <Plus size={32} className="mb-2 opacity-30 dark:opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">Add Logo</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setItemToDelete(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0c] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Item?</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{itemToDelete.name}"</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-all">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (itemToDelete.type === "partner") {
                      setPartners(partners.filter(p => p.id !== itemToDelete.id));
                    } else {
                      setMediaCoverage(mediaCoverage.filter(m => m.id !== itemToDelete.id));
                    }
                    setItemToDelete(null);
                  }} 
                  className="flex-[1.5] py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}