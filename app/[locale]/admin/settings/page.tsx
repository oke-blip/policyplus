"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Save, Globe, LayoutTemplate, Loader, Type, Camera, Plus, Trash2, CheckCircle2, AlertCircle, Award, Target, Cpu } from "lucide-react";
import { METHODOLOGY_ICON_OPTIONS, getDefaultMethodologyIconId } from "@/lib/methodology-icons";
import {
  getMethodologyEditorPoints,
  getMethodologyPoints,
  type ApproachItem,
  type ExpertiseItem,
  type MethodologyItem,
} from "@/lib/settings-utils";

/** Admin form may store `image`; public site reads `src` via parseHeroBanners. */
type HeroBannerForm = {
  src?: string;
  alt?: string;
  image?: string;
};

type SettingsFormState = {
  company_name: string;
  email_address: string;
  phone_number: string;
  office_address: string;
  social_links: unknown[];
  preloader_text: string;
  hero_line1_prefix: string;
  hero_line1_accent: string;
  hero_line2_prefix: string;
  hero_line2_accent: string;
  hero_description: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_secondary_text: string;
  hero_secondary_link: string;
  hero_banners: HeroBannerForm[];
  intro_subtitle: string;
  intro_title: string;
  intro_description: string;
  intro_image_url: string;
  expertise_header: string;
  expertise_description: string;
  expertise_items: ExpertiseItem[];
  approach_line1: string;
  approach_line2: string;
  approach_description: string;
  approach_items: ApproachItem[];
  cta_subtitle: string;
  cta_title: string;
  cta_button_text: string;
  cta_button_link: string;
  methodology_tag: string;
  methodology_header: string;
  methodology_description: string;
  methodology_items: MethodologyItem[];
  insights_header: string;
  insights_description: string;
};

const defaultSettings: SettingsFormState = {
  company_name: "PolicyPlus",
  email_address: "hello@policyplus.com",
  phone_number: "+62 812 3456 7890",
  office_address: "Jakarta, Indonesia",
  social_links: [],
  preloader_text: "Empowering Policies for the Future...",
  hero_line1_prefix: "DRIVING MEANINGFUL",
  hero_line1_accent: "IMPACT",
  hero_line2_prefix: "THROUGH RIGOROUS",
  hero_line2_accent: "POLICY SOLUTIONS",
  hero_description: "A trusted advisory firm providing solutions for dynamic governance.",
  hero_cta_text: "Our Expertise",
  hero_cta_link: "#expertise",
  hero_secondary_text: "Latest Insights",
  hero_secondary_link: "#insights",
  hero_banners: [],
  intro_subtitle: "",
  intro_title: "",
  intro_description: "",
  intro_image_url: "",
  expertise_header: "Our Expertise",
  expertise_description: "We bring a deep understanding of policy ecosystems...",
  expertise_items: [
    { id: 1, tag: "Research", title: "Evidence-Based Policy Research", desc: "Rigorous data collection and analysis...", image: "" },
    { id: 2, tag: "Engagement", title: "Stakeholder Management", desc: "Building bridges between government and society...", image: "" },
    { id: 3, tag: "Strategy", title: "Strategic Advisory", desc: "Navigating complex regulatory environments...", image: "" },
  ],
  approach_line1: "WHAT MAKES",
  approach_line2: "OUR APPROACH DIFFERENT?",
  approach_description:
    "Our work connects research, stakeholders, and communication to move policy ideas from discussion to implementation.",
  approach_items: [
    { id: 1, title: "Deep Analysis", desc: "We start by understanding the root cause..." },
    { id: 2, title: "Collaborative Design", desc: "We work closely with all partners..." },
    { id: 3, title: "Execution Excellence", desc: "Ensuring impact through measurable results..." },
    { id: 4, title: "Scale & Impact", desc: "Scaling solutions for wider governance." },
  ],
  cta_subtitle: "",
  cta_title: "Ready to drive meaningful social impact?",
  cta_button_text: "Get In Touch",
  cta_button_link: "#contact",
  methodology_tag: "Our Process",
  methodology_header: "Our Methodology",
  methodology_description: "A framework built for dynamic governance.",
  methodology_items: [
    {
      id: 1,
      title: "IDEATION",
      icon: "lightbulb",
      points: ["Scanning issue", "Framing policy challenges", "Early insight"],
      order: 0,
    },
    {
      id: 2,
      title: "RESEARCH",
      icon: "search",
      points: ["Policy research", "Benchmarking", "Data & evidence"],
      order: 1,
    },
    {
      id: 3,
      title: "DIALOGUE",
      icon: "users",
      points: ["Stakeholder engagement", "Convenings", "Policy discussions"],
      order: 2,
    },
  ],
  insights_header: "Latest Insights",
  insights_description: "Explore our latest research and policy updates.",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("global");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [settings, setSettings] = useState<SettingsFormState>(defaultSettings);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/settings");
        if (res.ok && !cancelled) {
          const data = (await res.json()) as Partial<SettingsFormState>;
          if (Object.keys(data).length > 0) {
            setSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "All settings saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save settings." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addExpertiseItem = () => {
    updateSetting("expertise_items", [
      ...(settings.expertise_items || []),
      { id: Date.now(), tag: "", title: "", desc: "", image: "" },
    ]);
  };

  const removeExpertiseItem = (index: number) => {
    const newList = [...(settings.expertise_items || [])];
    newList.splice(index, 1);
    updateSetting("expertise_items", newList);
  };

  const addApproachItem = () => {
    const now = Date.now();
    updateSetting("approach_items", [
      ...(settings.approach_items || []),
      {
        id: now,
        createdAt: now,
        phase: `PHASE_0${(settings.approach_items?.length ?? 0) + 1}`,
        title: "",
        desc: "",
        image: "",
      },
    ]);
  };

  const removeApproachItem = (index: number) => {
    const newList = [...(settings.approach_items || [])];
    newList.splice(index, 1);
    updateSetting("approach_items", newList);
  };

  const addMethodologyItem = () => {
    const nextOrder = settings.methodology_items?.length ?? 0;
    updateSetting("methodology_items", [
      ...(settings.methodology_items || []),
      {
        id: Date.now(),
        title: "",
        icon: getDefaultMethodologyIconId(nextOrder),
        points: [""],
        order: nextOrder,
      },
    ]);
  };

  const removeMethodologyItem = (index: number) => {
    const newList = [...(settings.methodology_items || [])];
    newList.splice(index, 1);
    updateSetting(
      "methodology_items",
      newList.map((item, i) => ({ ...item, order: i }))
    );
  };

  const updateMethodologyItem = (index: number, patch: Record<string, unknown>) => {
    const newList = [...(settings.methodology_items || [])];
    newList[index] = { ...newList[index], ...patch };
    updateSetting("methodology_items", newList);
  };

  const setMethodologyPoints = (index: number, points: string[]) => {
    updateMethodologyItem(index, {
      points,
      desc: points
        .map((p) => p.trim())
        .filter(Boolean)
        .join("\n"),
    });
  };

  const handleExpertiseImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newList = [...settings.expertise_items];
      newList[index] = { ...newList[index], image: String(reader.result ?? "") };
      updateSetting("expertise_items", newList);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const saveActions = (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 sm:gap-4">
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-4">
      <div className="sticky top-0 z-30 -mx-6 space-y-4 border-b border-slate-200/70 bg-[#F8F9FE]/95 px-6 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#030712]/95 md:-mx-10 md:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Setting Compro</h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">Kelola konten company profile dan landing page.</p>
        </div>
        
        {saveActions}
        {/* duplicate save removed */}
        <div className="hidden">
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
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all disabled:opacity-70"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-200/50 p-1 backdrop-blur-md dark:bg-white/5">
        {[
          { id: "global", icon: Globe, label: "Global & Branding" },
          { id: "homepage", icon: LayoutTemplate, label: "Hero & Intro" },
          { id: "expertise", icon: Award, label: "Expertise" },
          { id: "approach", icon: Target, label: "Approach" },
          { id: "methodology", icon: Cpu, label: "Methodology" },
          { id: "cta", icon: Type, label: "CTA & Footer" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      </div>
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">

        {activeTab === "global" && (
          <div className="space-y-10">
            {/* Branding */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Branding & Contact</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                   <input type="text" value={settings.company_name} onChange={(e) => updateSetting("company_name", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                   <input type="email" value={settings.email_address} onChange={(e) => updateSetting("email_address", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Office Address</label>
                   <textarea rows={2} value={settings.office_address} onChange={(e) => updateSetting("office_address", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all resize-none" />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "homepage" && (
          <div className="space-y-10">
            {/* Hero */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hero & Introduction</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Line 1 (White)</label>
                    <input type="text" value={settings.hero_line1_prefix} onChange={(e) => updateSetting("hero_line1_prefix", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-600">Hero Line 1 (Yellow Accent)</label>
                    <input type="text" value={settings.hero_line1_accent} onChange={(e) => updateSetting("hero_line1_accent", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-yellow-600 dark:text-yellow-500 outline-none focus:ring-2 focus:ring-slate-500/50 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Line 2 (White)</label>
                    <input type="text" value={settings.hero_line2_prefix} onChange={(e) => updateSetting("hero_line2_prefix", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-600">Hero Line 2 (Yellow Accent)</label>
                    <input type="text" value={settings.hero_line2_accent} onChange={(e) => updateSetting("hero_line2_accent", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-yellow-600 dark:text-yellow-500 outline-none focus:ring-2 focus:ring-slate-500/50 transition-all font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Subheadline</label>
                  <textarea rows={2} value={settings.hero_description} onChange={(e) => updateSetting("hero_description", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Primary Button Text</label>
                    <input type="text" value={settings.hero_cta_text} onChange={(e) => updateSetting("hero_cta_text", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Primary Button Link</label>
                    <input type="text" value={settings.hero_cta_link} onChange={(e) => updateSetting("hero_cta_link", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Secondary Button Text</label>
                    <input type="text" value={settings.hero_secondary_text} onChange={(e) => updateSetting("hero_secondary_text", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Secondary Button Link</label>
                    <input type="text" value={settings.hero_secondary_link} onChange={(e) => updateSetting("hero_secondary_link", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Banners (Slideshow Images)</label>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {settings.hero_banners?.map((banner: HeroBannerForm, index: number) => (
                        <div key={index} className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 group dark:border-white/10">
                          <img src={banner.image ?? banner.src ?? ""} alt={banner.alt ?? ""} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => {
                              const newList = [...settings.hero_banners];
                              newList.splice(index, 1);
                              updateSetting("hero_banners", newList);
                            }}
                            className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-slate-400 transition-all cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateSetting("hero_banners", [
                                  ...(settings.hero_banners || []),
                                  { image: String(reader.result ?? "") },
                                ]);
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }} 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                        <Plus size={24} />
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "expertise" && (
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Expertise Cards</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Header</label>
                  <input type="text" value={settings.expertise_header} onChange={(e) => updateSetting("expertise_header", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={2} value={settings.expertise_description} onChange={(e) => updateSetting("expertise_description", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all resize-none" />
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <motion.div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Expertise Cards ({settings.expertise_items?.length ?? 0})
                  </h3>
                  <button
                    type="button"
                    onClick={addExpertiseItem}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Plus size={16} />
                    Add Card
                  </button>
                </motion.div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {settings.expertise_items?.map((item: ExpertiseItem, index: number) => (
                    <motion.div
                      key={item.id ?? index}
                      className="relative space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-white/5"
                    >
                      <button
                        type="button"
                        onClick={() => removeExpertiseItem(index)}
                        className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                        aria-label="Remove card"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="text-xs font-bold text-slate-400">Card {index + 1}</p>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Tag</label>
                        <input type="text" value={item.tag} onChange={(e) => {
                          const newList = [...settings.expertise_items];
                          newList[index].tag = e.target.value;
                          updateSetting("expertise_items", newList);
                        }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Title</label>
                        <input type="text" value={item.title} onChange={(e) => {
                          const newList = [...settings.expertise_items];
                          newList[index].title = e.target.value;
                          updateSetting("expertise_items", newList);
                        }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Description (optional)</label>
                        <textarea
                          rows={2}
                          value={item.desc || ""}
                          onChange={(e) => {
                            const newList = [...settings.expertise_items];
                            newList[index].desc = e.target.value;
                            updateSetting("expertise_items", newList);
                          }}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-900"
                          placeholder="Short description"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Image</label>
                        <div className="relative h-28 w-full cursor-pointer overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                           <input type="file" accept="image/*" onChange={(e) => handleExpertiseImageUpload(index, e)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                           {item.image ? (
                             <img src={item.image} className="w-full h-full object-cover" />
                           ) : (
                             <div className="flex items-center justify-center h-full text-slate-400"><Camera size={20} /></div>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(settings.expertise_items?.length ?? 0) === 0 && (
                  <p className="text-center text-sm text-slate-500">
                    No cards yet. Click &quot;Add Card&quot; to create your first expertise item.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "approach" && (
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Strategic Approach</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Header Line 1 (White)</label>
                  <input type="text" value={settings.approach_line1} onChange={(e) => updateSetting("approach_line1", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-600">Header Line 2 (Yellow Accent)</label>
                  <input type="text" value={settings.approach_line2} onChange={(e) => updateSetting("approach_line2", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-yellow-600 dark:text-yellow-500 outline-none focus:ring-2 focus:ring-slate-500/50 transition-all font-bold" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={2} value={settings.approach_description} onChange={(e) => updateSetting("approach_description", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all resize-none" />
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <motion.div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <motion.div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Approach Cards ({settings.approach_items?.length ?? 0})
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Landing page menampilkan 4 card terbaru saja.
                    </p>
                  </motion.div>
                  <button
                    type="button"
                    onClick={addApproachItem}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Plus size={16} />
                    Add Card
                  </button>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settings.approach_items?.map((item: ApproachItem, index: number) => (
                    <div
                      key={item.id ?? index}
                      className="relative space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-white/5"
                    >
                      <button
                        type="button"
                        onClick={() => removeApproachItem(index)}
                        className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                        aria-label="Remove card"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="text-xs font-bold text-slate-400">Card {index + 1}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Phase Label</label>
                          <input type="text" value={item.phase || `PHASE_0${index + 1}`} onChange={(e) => {
                            const newList = [...settings.approach_items];
                            newList[index].phase = e.target.value;
                            updateSetting("approach_items", newList);
                          }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-yellow-600" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Title</label>
                          <input type="text" value={item.title} onChange={(e) => {
                            const newList = [...settings.approach_items];
                            newList[index].title = e.target.value;
                            updateSetting("approach_items", newList);
                          }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-bold" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Description</label>
                        <textarea rows={2} value={item.desc} onChange={(e) => {
                          const newList = [...settings.approach_items];
                          newList[index].desc = e.target.value;
                          updateSetting("approach_items", newList);
                        }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Card Background Image</label>
                        <div className="relative h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden group cursor-pointer">
                           <input type="file" accept="image/*" onChange={(e) => {
                             if (e.target.files?.[0]) {
                               const reader = new FileReader();
                               reader.onloadend = () => {
                                 const newList = [...settings.approach_items];
                                 newList[index].image = String(reader.result ?? "");
                                 updateSetting("approach_items", newList);
                               };
                               reader.readAsDataURL(e.target.files[0]);
                             }
                           }} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                           {item.image ? (
                             <img src={item.image} className="w-full h-full object-cover" />
                           ) : (
                             <div className="flex items-center justify-center h-full text-slate-400"><Camera size={24} /></div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {(settings.approach_items?.length ?? 0) === 0 && (
                  <p className="text-center text-sm text-slate-500">
                    No cards yet. Click &quot;Add Card&quot; to create an approach item.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "methodology" && (
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Policy Methodology</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tag (small label above header)</label>
                  <input type="text" value={settings.methodology_tag} onChange={(e) => updateSetting("methodology_tag", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Header</label>
                  <input type="text" value={settings.methodology_header} onChange={(e) => updateSetting("methodology_header", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={2} value={settings.methodology_description} onChange={(e) => updateSetting("methodology_description", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all resize-none" />
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Timeline Steps ({settings.methodology_items?.length ?? 0})
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Semua step tampil di landing. Tambah bullet per poin, pilih icon per step.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMethodologyItem}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Plus size={16} />
                    Add Step
                  </button>
                </div>
                <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {settings.methodology_items?.map((item: MethodologyItem, index: number) => (
                    <motion.div
                      key={item.id ?? index}
                      className="relative space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-white/5"
                    >
                      <button
                        type="button"
                        onClick={() => removeMethodologyItem(index)}
                        className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                        aria-label="Remove step"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="text-xs font-bold text-slate-400">
                        Step {String(index + 1).padStart(2, "0")}
                      </p>

                      <motion.div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Icon</label>
                        <div className="grid grid-cols-4 gap-2">
                          {METHODOLOGY_ICON_OPTIONS.map((opt) => {
                            const Icon = opt.Icon;
                            const selected =
                              (item.icon || getDefaultMethodologyIconId(index)) === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => updateMethodologyItem(index, { icon: opt.id })}
                                className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
                                  selected
                                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900"
                                }`}
                                title={opt.label}
                              >
                                <Icon size={18} />
                                <span className="text-[9px] font-semibold leading-tight">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateMethodologyItem(index, { title: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-900"
                        placeholder="e.g. IDEATION"
                      />

                      <motion.div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500">Bullet points</label>
                          <button
                            type="button"
                            onClick={() => {
                              const points = getMethodologyEditorPoints(item);
                              setMethodologyPoints(index, [...points, ""]);
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-500"
                          >
                            <Plus size={12} /> Add bullet
                          </button>
                        </div>
                        <div className="space-y-2">
                          {getMethodologyEditorPoints(item).map((point: string, pointIndex: number) => (
                            <div key={pointIndex} className="flex items-center gap-2">
                              <span className="text-yellow-500">•</span>
                              <input
                                type="text"
                                value={point}
                                onChange={(e) => {
                                  const next = [...getMethodologyEditorPoints(item)];
                                  next[pointIndex] = e.target.value;
                                  setMethodologyPoints(index, next);
                                }}
                                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-900"
                                placeholder="Bullet text"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = getMethodologyEditorPoints(item).filter(
                                    (_, i) => i !== pointIndex
                                  );
                                  setMethodologyPoints(index, next.length > 0 ? next : [""]);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                aria-label="Remove bullet"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <ul className="list-disc space-y-1 rounded-xl border border-dashed border-slate-200 bg-slate-100/80 px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
                          {getMethodologyPoints(item)
                            .filter(Boolean)
                            .map((point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ))}
                          {getMethodologyPoints(item).filter(Boolean).length === 0 && (
                            <li className="list-none text-slate-400">Preview bullet akan muncul di sini</li>
                          )}
                        </ul>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
                {(settings.methodology_items?.length ?? 0) === 0 && (
                  <p className="text-center text-sm text-slate-500">
                    No steps yet. Click &quot;Add Step&quot; to create a timeline item.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "cta" && (
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Call To Action & Footer</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Subtitle (small label)</label>
                  <input type="text" value={settings.cta_subtitle} onChange={(e) => updateSetting("cta_subtitle", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Title</label>
                  <input type="text" value={settings.cta_title} onChange={(e) => updateSetting("cta_title", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Text</label>
                  <input type="text" value={settings.cta_button_text} onChange={(e) => updateSetting("cta_button_text", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Link</label>
                  <input type="text" value={settings.cta_button_link} onChange={(e) => updateSetting("cta_button_link", e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all" />
                </div>
              </div>
            </section>
          </div>
        )}

      </motion.div>

      {/* Sticky bottom save bar — no need to scroll back to top */}
      <motion.div
        variants={itemVariants}
        className="sticky bottom-0 z-30 -mx-6 mt-6 border-t border-slate-200/70 bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE] to-[#F8F9FE]/80 px-6 py-4 backdrop-blur-xl dark:border-white/10 dark:from-[#030712] dark:via-[#030712] dark:to-[#030712]/80 md:-mx-10 md:px-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Simpan perubahan setelah selesai mengedit tab ini.
          </p>
          {saveActions}
        </div>
      </motion.div>
    </motion.div>
  );
}
