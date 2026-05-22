"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Globe, LayoutTemplate, Loader, Type, Camera, Plus, Trash2, Award, Target, Cpu, Users, Library } from "lucide-react";

import { ABOUT_VALUE_ICON_OPTIONS, getDefaultAboutValueIconId } from "@/lib/about-value-icons";
import { METHODOLOGY_ICON_OPTIONS, getDefaultMethodologyIconId } from "@/lib/methodology-icons";
import {
  getMethodologyEditorPoints,
  type AboutValueItem,
  type ApproachItem,
  type ExpertiseItem,
  type MethodologyItem,
  parseAboutValueItems,
} from "@/lib/settings-utils";
import { ImageCropUpload } from "@/components/admin/ImageCropUpload";
import {
  hasPendingSettingsImagesForTab,
  pickSettingsForTab,
  prepareSettingsPayloadForSave,
  SETTINGS_TAB_LABELS,
  type SettingsAdminTab,
} from "@/lib/settings-images";
import type { SettingsSubfolder } from "@/lib/supabase-storage";
import { uploadSettingsImage } from "@/lib/upload-settings-image";
import {
  parseSocialLinksForm,
  SOCIAL_PLATFORM_OPTIONS,
  type SocialLinkForm,
} from "@/lib/social-links";

// IMPORT SaveAction YANG BARU DIBUAT
import { SaveAction } from "@/components/admin/SaveAction";
import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";
import {
  applySmartFallback,
  applySmartFallbackToArrayItems,
  SMART_FALLBACK_ABOUT_VALUE_ITEM_PAIRS,
  SMART_FALLBACK_APPROACH_ITEM_PAIRS,
  SMART_FALLBACK_CTA_FIELD_PAIRS,
  SMART_FALLBACK_EXPERTISE_ITEM_PAIRS,
  SMART_FALLBACK_METHODOLOGY_ITEM_PAIRS,
  SMART_FALLBACK_PUBLICATIONS_FIELD_PAIRS,
} from "@/lib/cms-smart-fallback";
import {
  SETTINGS_STRING_LOCALE_KEYS,
  type SettingsStringLocaleKey,
} from "@/lib/settings-locale-keys";

type HeroBannerForm = {
  src?: string;
  alt?: string;
  image?: string;
};

type LocaleIdFields = {
  [K in SettingsStringLocaleKey as `${K}_id`]: string;
};

type SettingsFormState = {
  company_name: string;
  company_logo: string;
  favicon: string;
  preloader_logo: string;
  email_address: string;
  phone_number: string;
  office_address: string;
  social_links: SocialLinkForm[];
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
  careers_hero_title: string;
  careers_hero_title_accent: string;
  careers_hero_subtitle: string;
  methodology_tag: string;
  methodology_header: string;
  methodology_description: string;
  methodology_items: MethodologyItem[];
  insights_header: string;
  insights_description: string;
  knowledge_center_title: string;
  knowledge_center_subtitle: string;
  latest_insights_title: string;
  about_hero_image: string;
  about_hero_subtitle: string;
  about_hero_title: string;
  about_hero_description: string;
  about_hero_cta_text: string;
  about_hero_cta_link: string;
  about_mission_eyebrow: string;
  about_mission_title: string;
  about_mission_description: string;
  about_team_eyebrow: string;
  about_team_title: string;
  about_team_subtitle: string;
  about_values_heading: string;
  about_value_items: AboutValueItem[];
} & LocaleIdFields;

const localeIdDefaults = Object.fromEntries(
  SETTINGS_STRING_LOCALE_KEYS.map((key) => [`${key}_id`, ""]),
) as LocaleIdFields;

const inputClass =
  "w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all";

const selectClass =
  "w-full appearance-none cursor-pointer bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all";

const brandPreviewAspect = 16 / 9;

const defaultSettings: SettingsFormState = {
  company_name: "Policy+",
  company_logo: "",
  favicon: "",
  preloader_logo: "",
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
  expertise_items: [],
  approach_line1: "WHAT MAKES",
  approach_line2: "OUR APPROACH DIFFERENT?",
  approach_description:
    "Our work connects research, stakeholders, and communication to move policy ideas from discussion to implementation.",
  approach_items: [],
  cta_subtitle: "",
  cta_title: "Ready to drive meaningful social impact?",
  cta_button_text: "Get In Touch",
  cta_button_link: "#contact",
  careers_hero_title: "Join Our",
  careers_hero_title_accent: "Mission",
  careers_hero_subtitle: "Help us shape the future of public policy across Southeast Asia.",
  ...localeIdDefaults,
  careers_hero_title_id: "Bergabung dengan",
  careers_hero_title_accent_id: "Misi Kami",
  careers_hero_subtitle_id:
    "Bantu kami membentuk masa depan kebijakan publik di Asia Tenggara.",
  methodology_tag: "Our Process",
  methodology_header: "Our Methodology",
  methodology_description: "A framework built for dynamic governance.",
  methodology_items: [],
  insights_header: "Latest Insights",
  insights_description: "Explore our latest research and policy updates.",
  knowledge_center_title: "KNOWLEDGE CENTER",
  knowledge_center_subtitle:
    "Explore our initiatives advancing knowledge, dialogue, and evidence-based policymaking.",
  latest_insights_title: "Latest Insights",
  knowledge_center_title_id: "PUSAT PENGETAHUAN",
  knowledge_center_subtitle_id:
    "Jelajahi inisiatif kami yang memajukan pengetahuan, dialog, dan kebijakan berbasis bukti.",
  latest_insights_title_id: "Wawasan Terbaru",
  about_hero_image: "",
  about_hero_subtitle: "WHO WE ARE",
  about_hero_title: "Fostering Evidence-Based Policy in Indonesia",
  about_hero_description:
    "Policy Plus is an independent knowledge hub dedicated to transforming complex data into actionable insights. We bridge the gap between rigorous research and practical governance to drive sustainable development.",
  about_hero_cta_text: "Read our story",
  about_hero_cta_link: "",
  about_mission_eyebrow: "OUR MISSION",
  about_mission_title: "A trusted advisory firm providing solutions for dynamic governance.",
  about_mission_description:
    "Policy Plus is an independent knowledge hub dedicated to transforming complex data into actionable insights. We bridge the gap between rigorous research and practical governance to drive sustainable development.",
  about_team_eyebrow: "OUR TEAM",
  about_team_title: "Meet The Team",
  about_team_subtitle:
    "Strategists, researchers, and operators translating evidence into accountable change — one engagement at a time.",
  about_values_heading: "What We Value",
  about_value_items: [],
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsAdminTab>("global");
  const [langTab, setLangTab] = useState<AdminLangTab>("id");
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
          const data = (await res.json()) as Record<string, unknown>;
          if (Object.keys(data).length > 0) {
            setSettings((prev) => ({
              ...prev,
              ...(data as Partial<SettingsFormState>),
              company_logo:
                typeof data.company_logo === "string" ? data.company_logo : prev.company_logo,
              favicon: typeof data.favicon === "string" ? data.favicon : prev.favicon,
              preloader_logo:
                typeof data.preloader_logo === "string" ? data.preloader_logo : prev.preloader_logo,
              social_links: parseSocialLinksForm(data.social_links ?? prev.social_links),
              about_value_items: parseAboutValueItems(
                data.about_value_items ?? prev.about_value_items,
              ),
            }));
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

  const switchTab = (tab: SettingsAdminTab) => {
    setActiveTab(tab);
    setMessage({ type: "", text: "" });
  };

  const showUploadError = (text: string) => {
    setMessage({ type: "error", text });
  };

  const handleSave = async () => {
    const tab = activeTab;
    const formData = settings as unknown as Record<string, unknown>;

    if (hasPendingSettingsImagesForTab(tab, formData)) {
      setMessage({
        type: "error",
        text: "An image is still uploading or was not saved to storage. Re-upload it, then save again.",
      });
      return;
    }

    let picked = pickSettingsForTab(tab, formData);
    picked = applySmartFallback({ ...picked });

    if (tab === "cta") {
      picked = applySmartFallback(picked, SMART_FALLBACK_CTA_FIELD_PAIRS);
    }
    if (tab === "expertise" && Array.isArray(picked.expertise_items)) {
      picked = {
        ...picked,
        expertise_items: applySmartFallbackToArrayItems(
          picked.expertise_items as Record<string, unknown>[],
          SMART_FALLBACK_EXPERTISE_ITEM_PAIRS,
        ),
      };
    }
    if (tab === "approach" && Array.isArray(picked.approach_items)) {
      picked = {
        ...picked,
        approach_items: applySmartFallbackToArrayItems(
          picked.approach_items as Record<string, unknown>[],
          SMART_FALLBACK_APPROACH_ITEM_PAIRS,
        ),
      };
    }
    if (tab === "methodology" && Array.isArray(picked.methodology_items)) {
      picked = {
        ...picked,
        methodology_items: applySmartFallbackToArrayItems(
          picked.methodology_items as Record<string, unknown>[],
          SMART_FALLBACK_METHODOLOGY_ITEM_PAIRS,
        ),
      };
    }
    if (tab === "about" && Array.isArray(picked.about_value_items)) {
      picked = {
        ...picked,
        about_value_items: applySmartFallbackToArrayItems(
          picked.about_value_items as Record<string, unknown>[],
          SMART_FALLBACK_ABOUT_VALUE_ITEM_PAIRS,
        ),
      };
    }
    if (tab === "publications") {
      picked = applySmartFallback(picked, SMART_FALLBACK_PUBLICATIONS_FIELD_PAIRS);
    }

    const payload = prepareSettingsPayloadForSave(picked);

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json().catch(() => ({}))) as { message?: string };

      if (res.ok) {
        setMessage({
          type: "success",
          text: `${SETTINGS_TAB_LABELS[tab]} saved successfully!`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: body.message || "Failed to save settings.",
        });
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

  const localeFieldKey = (base: SettingsStringLocaleKey): keyof SettingsFormState =>
    langTab === "id" ? (`${base}_id` as keyof SettingsFormState) : base;

  const getLocaleString = (base: SettingsStringLocaleKey): string =>
    String(settings[localeFieldKey(base)] ?? "");

  const setLocaleString = (base: SettingsStringLocaleKey, value: string) => {
    updateSetting(localeFieldKey(base), value);
  };

  const getMethodologyEditorPointsForLang = (item: MethodologyItem): string[] => {
    if (langTab === "id") {
      const idPoints = item.points_id;
      if (Array.isArray(idPoints) && idPoints.length > 0) {
        return idPoints.map((p) => String(p));
      }
      const enPoints = getMethodologyEditorPoints(item);
      return enPoints.length > 0 ? enPoints.map(() => "") : [""];
    }
    return getMethodologyEditorPoints(item);
  };

  const setMethodologyPointsForLang = (index: number, points: string[]) => {
    if (langTab === "id") {
      updateMethodologyItem(index, {
        points_id: points,
      });
      return;
    }
    setMethodologyPoints(index, points);
  };

  const addExpertiseItem = () => {
    updateSetting("expertise_items", [
      ...(settings.expertise_items || []),
      { id: Date.now(), tag: "", tag_id: "", title: "", title_id: "", desc: "", desc_id: "", image: "" },
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
        phase_id: "",
        title: "",
        title_id: "",
        desc: "",
        desc_id: "",
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
        title_id: "",
        icon: getDefaultMethodologyIconId(nextOrder),
        points: [""],
        points_id: [""],
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

  const addSocialLink = () => {
    updateSetting("social_links", [
      ...(settings.social_links || []),
      { id: Date.now(), platform: "linkedin", url: "" },
    ]);
  };

  const removeSocialLink = (index: number) => {
    const next = [...settings.social_links];
    next.splice(index, 1);
    updateSetting("social_links", next);
  };

  const updateSocialLink = (index: number, patch: Partial<SocialLinkForm>) => {
    const next = [...settings.social_links];
    next[index] = { ...next[index], ...patch };
    updateSetting("social_links", next);
  };

  const addAboutValueItem = () => {
    const nextIndex = settings.about_value_items?.length ?? 0;
    updateSetting("about_value_items", [
      ...(settings.about_value_items || []),
      {
        id: Date.now(),
        text: "",
        text_id: "",
        icon: getDefaultAboutValueIconId(nextIndex),
        image: "",
      },
    ]);
  };

  const removeAboutValueItem = (index: number) => {
    const newList = [...(settings.about_value_items || [])];
    newList.splice(index, 1);
    updateSetting("about_value_items", newList);
  };

  const updateAboutValueItem = (index: number, patch: Partial<AboutValueItem>) => {
    const newList = [...(settings.about_value_items || [])];
    newList[index] = { ...newList[index], ...patch };
    updateSetting("about_value_items", newList);
  };

  const uploadListItemImage = async (
    file: File,
    subfolder: SettingsSubfolder,
    applyPreview: (previewUrl: string) => void,
    applyUrl: (url: string) => void,
    restorePrevious: () => void,
  ) => {
    const previewUrl = URL.createObjectURL(file);
    applyPreview(previewUrl);
    try {
      const url = await uploadSettingsImage(file, subfolder, file.name);
      applyUrl(url);
    } catch (error) {
      console.error("Image upload failed:", error);
      restorePrevious();
      showUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed. Check your connection and try again.",
      );
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleAboutValueImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const previous = settings.about_value_items[index]?.image ?? "";
    void uploadListItemImage(
      file,
      "about",
      (previewUrl) => updateAboutValueItem(index, { image: previewUrl }),
      (url) => updateAboutValueItem(index, { image: url }),
      () => updateAboutValueItem(index, { image: previous }),
    );
  };

  const handleExpertiseImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const previous = settings.expertise_items[index]?.image ?? "";
    void uploadListItemImage(
      file,
      "expertise",
      (previewUrl) => {
        const newList = [...settings.expertise_items];
        newList[index] = { ...newList[index], image: previewUrl };
        updateSetting("expertise_items", newList);
      },
      (url) => {
        const newList = [...settings.expertise_items];
        newList[index] = { ...newList[index], image: url };
        updateSetting("expertise_items", newList);
      },
      () => {
        const newList = [...settings.expertise_items];
        newList[index] = { ...newList[index], image: previous };
        updateSetting("expertise_items", newList);
      },
    );
  };

  const handleApproachImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const previous = settings.approach_items[index]?.image ?? "";
    void uploadListItemImage(
      file,
      "approach",
      (previewUrl) => {
        const newList = [...settings.approach_items];
        newList[index] = { ...newList[index], image: previewUrl };
        updateSetting("approach_items", newList);
      },
      (url) => {
        const newList = [...settings.approach_items];
        newList[index] = { ...newList[index], image: url };
        updateSetting("approach_items", newList);
      },
      () => {
        const newList = [...settings.approach_items];
        newList[index] = { ...newList[index], image: previous };
        updateSetting("approach_items", newList);
      },
    );
  };

  const handleHeroBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const url = await uploadSettingsImage(file, "hero", file.name);
      updateSetting("hero_banners", [...(settings.hero_banners || []), { image: url }]);
    } catch (error) {
      console.error("Hero banner upload failed:", error);
      showUploadError(
        error instanceof Error
          ? error.message
          : "Hero banner upload failed. Check your connection and try again.",
      );
    }
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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-24">
      
      {/* Header Halaman */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Setting Compro</h1>
        <p className="mt-1.5 text-slate-500 dark:text-slate-400">Kelola konten company profile dan landing page.</p>
      </motion.div>

      {/* Menu Tabs */}
      <motion.div variants={itemVariants} className="w-full min-w-0 overflow-x-auto hide-scrollbar pb-2">
        <div className="inline-flex flex-nowrap gap-1.5 p-1.5 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl backdrop-blur-md shadow-sm">
          {(
            [
              { id: "global" as const, icon: Globe, label: "Global & Branding", shortLabel: "Global" },
              { id: "homepage" as const, icon: LayoutTemplate, label: "Hero & Intro", shortLabel: "Hero" },
              { id: "expertise" as const, icon: Award, label: "Expertise", shortLabel: "Expertise" },
              { id: "approach" as const, icon: Target, label: "Approach", shortLabel: "Approach" },
              { id: "methodology" as const, icon: Cpu, label: "Methodology", shortLabel: "Method" },
              { id: "about" as const, icon: Users, label: "About", shortLabel: "About" },
              { id: "cta" as const, icon: Type, label: "CTA & Footer", shortLabel: "CTA" },
              { id: "publications" as const, icon: Library, label: "Publications", shortLabel: "Pubs" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              type="button"
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm ${
                activeTab === tab.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <tab.icon size={16} aria-hidden />
              <span className="md:hidden">{tab.shortLabel}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Konten Utama */}
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm min-w-0">
        <motion.div className="mb-6 flex justify-end">
          <AdminLangTabs value={langTab} onChange={setLangTab} />
        </motion.div>

        {/* TAB 1: GLOBAL */}
        {activeTab === "global" && (
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Header & Branding</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Company identity, logos, and preloader assets.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={getLocaleString("company_name")}
                  onChange={(e) => setLocaleString("company_name", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ImageCropUpload
                  label="Company Logo"
                  hint="Used in header and navigation. Cropped to 16:9."
                  value={settings.company_logo}
                  onChange={(v) => updateSetting("company_logo", v)}
                  aspect={brandPreviewAspect}
                  previewAspect={brandPreviewAspect}
                  outputMaxWidth={640}
                  uploadSubfolder="branding"
                  onUploadError={showUploadError}
                />
                <ImageCropUpload
                  label="Favicon"
                  hint="Browser tab icon. Cropped to 1:1."
                  value={settings.favicon}
                  onChange={(v) => updateSetting("favicon", v)}
                  aspect={1}
                  previewAspect={brandPreviewAspect}
                  outputMaxWidth={128}
                  uploadSubfolder="branding"
                  onUploadError={showUploadError}
                />
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Preloader
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Preloader Text</label>
                  <input
                    type="text"
                    value={getLocaleString("preloader_text")}
                    onChange={(e) => setLocaleString("preloader_text", e.target.value)}
                    className={inputClass}
                    placeholder="Empowering Policies for the Future..."
                  />
                </div>
                <ImageCropUpload
                  label="Preloader Logo"
                  hint="Shown while the site loads. Cropped to 16:9."
                  value={settings.preloader_logo}
                  onChange={(v) => updateSetting("preloader_logo", v)}
                  uploadSubfolder="branding"
                  onUploadError={showUploadError}
                  aspect={16 / 9}
                  outputMaxWidth={480}
                  previewClassName="aspect-video h-28 w-full max-w-xl md:h-32"
                />
              </div>
            </section>

            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Global Footer</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Contact details and social profiles shown in the site footer.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={getLocaleString("email_address")}
                    onChange={(e) => setLocaleString("email_address", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={getLocaleString("phone_number")}
                    onChange={(e) => setLocaleString("phone_number", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Office Address</label>
                <textarea
                  rows={2}
                  value={getLocaleString("office_address")}
                  onChange={(e) => setLocaleString("office_address", e.target.value)}
                  className={inputClass + " resize-none"}
                />
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Social Media Links</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Add platforms and URLs for the footer &quot;Follow Us&quot; column.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-400 hover:bg-white/60 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/30 dark:hover:bg-white/5"
                  >
                    <Plus size={16} />
                    Add Link
                  </button>
                </div>

                {settings.social_links.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    No social links yet. Click &quot;Add Link&quot; to add one.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {settings.social_links.map((link, index) => (
                      <div
                        key={link.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-end"
                      >
                        <div className="min-w-0 flex-1 space-y-2 sm:max-w-[200px]">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Platform</label>
                          <select
                            value={link.platform}
                            onChange={(e) => updateSocialLink(index, { platform: e.target.value })}
                            className={selectClass}
                          >
                            {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="min-w-0 flex-[2] space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">URL</label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                            placeholder="https://"
                            className={inputClass}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-white/10 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          aria-label="Remove social link"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: HOMEPAGE HERO */}
        {activeTab === "homepage" && (
          <div className="space-y-6">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hero & Introduction</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Line 1 (White)</label>
                    <input type="text" value={getLocaleString("hero_line1_prefix")} onChange={(e) => setLocaleString("hero_line1_prefix", e.target.value)} className={`${inputClass} font-bold`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-600">Hero Line 1 (Yellow Accent)</label>
                    <input type="text" value={getLocaleString("hero_line1_accent")} onChange={(e) => setLocaleString("hero_line1_accent", e.target.value)} className={`${inputClass} font-bold text-yellow-600 dark:text-yellow-500`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Line 2 (White)</label>
                    <input type="text" value={getLocaleString("hero_line2_prefix")} onChange={(e) => setLocaleString("hero_line2_prefix", e.target.value)} className={`${inputClass} font-bold`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-600">Hero Line 2 (Yellow Accent)</label>
                    <input type="text" value={getLocaleString("hero_line2_accent")} onChange={(e) => setLocaleString("hero_line2_accent", e.target.value)} className={`${inputClass} font-bold text-yellow-600 dark:text-yellow-500`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Subheadline</label>
                  <textarea rows={2} value={getLocaleString("hero_description")} onChange={(e) => setLocaleString("hero_description", e.target.value)} className={`${inputClass} resize-none`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Button Text</label>
                    <input type="text" value={getLocaleString("hero_cta_text")} onChange={(e) => setLocaleString("hero_cta_text", e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Button Link</label>
                    <input type="text" value={settings.hero_cta_link} onChange={(e) => updateSetting("hero_cta_link", e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Secondary Button Text</label>
                    <input type="text" value={getLocaleString("hero_secondary_text")} onChange={(e) => setLocaleString("hero_secondary_text", e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Secondary Button Link</label>
                    <input type="text" value={settings.hero_secondary_link} onChange={(e) => updateSetting("hero_secondary_link", e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero Banners (Slideshow Images)</label>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {settings.hero_banners?.map((banner: HeroBannerForm, index: number) => (
                        <div key={index} className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-checkerboard group dark:border-white/10 shadow-sm">
                          <img src={banner.image ?? banner.src ?? ""} alt={banner.alt ?? ""} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => {
                              const newList = [...settings.hero_banners];
                              newList.splice(index, 1);
                              updateSetting("hero_banners", newList);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-slate-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/50">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleHeroBannerUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                        <Plus size={24} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Add Image</span>
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: EXPERTISE */}
        {activeTab === "expertise" && (
          <div className="space-y-6">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Expertise Section</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Header</label>
                  <input type="text" value={getLocaleString("expertise_header")} onChange={(e) => setLocaleString("expertise_header", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={1} value={getLocaleString("expertise_description")} onChange={(e) => setLocaleString("expertise_description", e.target.value)} className={`${inputClass} resize-none min-h-[48px]`} />
                </div>
              </div>

              <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <motion.div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Expertise Cards ({settings.expertise_items?.length ?? 0})
                  </h3>
                  <button
                    type="button"
                    onClick={addExpertiseItem}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Plus size={16} /> Add Card
                  </button>
                </motion.div>

                {/* DI SINI DIUBAH JADI GRID 2 KOLOM */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {settings.expertise_items?.map((item: ExpertiseItem, index: number) => (
                    <motion.div
                      key={item.id ?? index}
                      className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02] shadow-sm overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-white/5 px-5 py-3 border-b border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExpertiseItem(index)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                      
                      {/* Card Body */}
                      <div className="flex-1 p-5 flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">Tag (e.g. Research)</label>
                            <input type="text" value={langTab === "id" ? (item.tag_id ?? "") : item.tag} onChange={(e) => {
                              const newList = [...settings.expertise_items];
                              if (langTab === "id") newList[index] = { ...newList[index], tag_id: e.target.value };
                              else newList[index].tag = e.target.value;
                              updateSetting("expertise_items", newList);
                            }} className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">Title</label>
                            <input type="text" value={langTab === "id" ? (item.title_id ?? "") : item.title} onChange={(e) => {
                              const newList = [...settings.expertise_items];
                              if (langTab === "id") newList[index] = { ...newList[index], title_id: e.target.value };
                              else newList[index].title = e.target.value;
                              updateSetting("expertise_items", newList);
                            }} className={`${inputClass} font-bold`} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Description</label>
                          <textarea
                            rows={3}
                            value={langTab === "id" ? (item.desc_id ?? "") : (item.desc || "")}
                            onChange={(e) => {
                              const newList = [...settings.expertise_items];
                              if (langTab === "id") newList[index] = { ...newList[index], desc_id: e.target.value };
                              else newList[index].desc = e.target.value;
                              updateSetting("expertise_items", newList);
                            }}
                            className={`${inputClass} resize-none`}
                          />
                        </div>

                        <div className="space-y-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-auto">
                          <label className="text-xs font-bold text-slate-500">Cover Image (16:9)</label>
                          <div className="relative h-40 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-checkerboard hover:border-slate-400 transition-colors">
                            <input type="file" accept="image/*" onChange={(e) => handleExpertiseImageUpload(index, e)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                            {item.image ? (
                              <img src={item.image} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Camera size={24} className="mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(settings.expertise_items?.length ?? 0) === 0 && (
                  <p className="text-center text-sm text-slate-500 py-10 border border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
                    No cards yet. Click &quot;Add Card&quot; to create your first expertise item.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: APPROACH */}
        {activeTab === "approach" && (
          <div className="space-y-6">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Strategic Approach</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Header Line 1 (White)</label>
                  <input type="text" value={getLocaleString("approach_line1")} onChange={(e) => setLocaleString("approach_line1", e.target.value)} className={`${inputClass} font-bold`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-600">Header Line 2 (Yellow Accent)</label>
                  <input type="text" value={getLocaleString("approach_line2")} onChange={(e) => setLocaleString("approach_line2", e.target.value)} className={`${inputClass} font-bold text-yellow-600 dark:text-yellow-500`} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={2} value={getLocaleString("approach_description")} onChange={(e) => setLocaleString("approach_description", e.target.value)} className={`${inputClass} resize-none`} />
                </div>
              </div>

              <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <motion.div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Approach Cards ({settings.approach_items?.length ?? 0})
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">Landing page menampilkan 4 card terbaru.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addApproachItem}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Plus size={16} /> Add Card
                  </button>
                </motion.div>

                {/* DI SINI DIUBAH JADI GRID 2 KOLOM */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {settings.approach_items?.map((item: ApproachItem, index: number) => (
                    <motion.div
                      key={item.id ?? index}
                      className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02] shadow-sm overflow-hidden"
                    >
                       {/* Card Header */}
                       <div className="flex items-center justify-between bg-slate-100 dark:bg-white/5 px-5 py-3 border-b border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeApproachItem(index)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="flex-1 p-5 flex flex-col gap-5">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-yellow-600">Phase Label</label>
                              <input type="text" value={langTab === "id" ? (item.phase_id ?? "") : (item.phase || `PHASE_0${index + 1}`)} onChange={(e) => {
                                const newList = [...settings.approach_items];
                                if (langTab === "id") newList[index] = { ...newList[index], phase_id: e.target.value };
                                else newList[index].phase = e.target.value;
                                updateSetting("approach_items", newList);
                              }} className={`${inputClass} text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600 dark:text-yellow-400`} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500">Title</label>
                              <input type="text" value={langTab === "id" ? (item.title_id ?? "") : item.title} onChange={(e) => {
                                const newList = [...settings.approach_items];
                                if (langTab === "id") newList[index] = { ...newList[index], title_id: e.target.value };
                                else newList[index].title = e.target.value;
                                updateSetting("approach_items", newList);
                              }} className={`${inputClass} font-bold`} />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">Description</label>
                            <textarea rows={3} value={langTab === "id" ? (item.desc_id ?? "") : item.desc} onChange={(e) => {
                              const newList = [...settings.approach_items];
                              if (langTab === "id") newList[index] = { ...newList[index], desc_id: e.target.value };
                              else newList[index].desc = e.target.value;
                              updateSetting("approach_items", newList);
                            }} className={`${inputClass} resize-none`} />
                         </div>

                         <div className="space-y-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-auto">
                          <label className="text-xs font-bold text-slate-500">Background Image (Cover)</label>
                          <div className="relative h-40 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-checkerboard hover:border-slate-400 transition-colors">
                            <input type="file" accept="image/*" onChange={(e) => handleApproachImageUpload(index, e)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                            {item.image ? (
                              <img src={item.image} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Camera size={24} className="mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(settings.approach_items?.length ?? 0) === 0 && (
                  <p className="text-center text-sm text-slate-500 py-10 border border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
                    No cards yet. Click &quot;Add Card&quot; to create an approach item.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 5: METHODOLOGY */}
        {activeTab === "methodology" && (
          <div className="space-y-6">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Policy Methodology</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tag (Label above header)</label>
                  <input type="text" value={getLocaleString("methodology_tag")} onChange={(e) => setLocaleString("methodology_tag", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Header</label>
                  <input type="text" value={getLocaleString("methodology_header")} onChange={(e) => setLocaleString("methodology_header", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={2} value={getLocaleString("methodology_description")} onChange={(e) => setLocaleString("methodology_description", e.target.value)} className={`${inputClass} resize-none`} />
                </div>
              </div>

              <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Timeline Steps ({settings.methodology_items?.length ?? 0})
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">Semua step akan tampil horizontal di landing page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addMethodologyItem}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Plus size={16} /> Add Step
                  </button>
                </div>
                
                {/* DI SINI DIUBAH JADI GRID 2 KOLOM */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {settings.methodology_items?.map((item: MethodologyItem, index: number) => (
                    <motion.div
                      key={item.id ?? index}
                      className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02] shadow-sm overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-white/5 px-5 py-3 border-b border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step {String(index + 1).padStart(2, "0")}</span>
                        <button
                          type="button"
                          onClick={() => removeMethodologyItem(index)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="flex-1 p-5 space-y-5 flex flex-col">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                           <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500">Choose Icon</label>
                            <div className="grid grid-cols-4 gap-2">
                              {METHODOLOGY_ICON_OPTIONS.map((opt) => {
                                const Icon = opt.Icon;
                                const selected = (item.icon || getDefaultMethodologyIconId(index)) === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => updateMethodologyItem(index, { icon: opt.id })}
                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 transition-all ${
                                      selected
                                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900"
                                    }`}
                                    title={opt.label}
                                  >
                                    <Icon size={18} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">Step Title</label>
                            <input
                              type="text"
                              value={langTab === "id" ? (item.title_id ?? "") : item.title}
                              onChange={(e) =>
                                updateMethodologyItem(
                                  index,
                                  langTab === "id"
                                    ? { title_id: e.target.value }
                                    : { title: e.target.value },
                                )
                              }
                              className={`${inputClass} font-bold`}
                              placeholder="e.g. IDEATION"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 flex-1 border-t border-slate-200 dark:border-white/10 pt-4 mt-auto">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-500">Bullet Points</label>
                            <button
                              type="button"
                              onClick={() => {
                                const points = getMethodologyEditorPointsForLang(item);
                                setMethodologyPointsForLang(index, [...points, ""]);
                              }}
                              className="flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-500 bg-yellow-500/10 px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Plus size={12} /> Add Point
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {getMethodologyEditorPointsForLang(item).map((point: string, pointIndex: number) => (
                              <div key={pointIndex} className="flex items-center gap-2">
                                <span className="text-yellow-500 shrink-0">•</span>
                                <input
                                  type="text"
                                  value={point}
                                  onChange={(e) => {
                                    const next = [...getMethodologyEditorPointsForLang(item)];
                                    next[pointIndex] = e.target.value;
                                    setMethodologyPointsForLang(index, next);
                                  }}
                                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-900 outline-none focus:border-slate-400 transition-colors"
                                  placeholder="Type point description..."
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = getMethodologyEditorPointsForLang(item).filter((_, i) => i !== pointIndex);
                                    setMethodologyPointsForLang(index, next.length > 0 ? next : [""]);
                                  }}
                                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(settings.methodology_items?.length ?? 0) === 0 && (
                  <p className="text-center text-sm text-slate-500 py-10 border border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
                    No steps yet. Click &quot;Add Step&quot; to create a timeline item.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB: ABOUT */}
        {activeTab === "about" && (
          <motion.div className="space-y-10">
            <section className="space-y-6">
              <motion.div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">About Us — Hero</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Who we are section: subtitle, headline, description, image, and optional CTA.
                </p>
              </motion.div>

              <ImageCropUpload
                label="Hero Image"
                hint="Right column image on the About page. Cropped to 16:9."
                value={settings.about_hero_image}
                onChange={(v) => updateSetting("about_hero_image", v)}
                aspect={16 / 9}
                previewAspect={16 / 9}
                outputMaxWidth={1280}
                previewClassName="aspect-video h-28 w-full max-w-xl md:h-32"
                uploadSubfolder="about"
                onUploadError={showUploadError}
              />

              <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-600">Subtitle (yellow caps)</label>
                  <input
                    type="text"
                    value={getLocaleString("about_hero_subtitle")}
                    onChange={(e) => setLocaleString("about_hero_subtitle", e.target.value)}
                    className={`${inputClass} font-bold text-yellow-600`}
                    placeholder="WHO WE ARE"
                  />
                </motion.div>
                <motion.div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={getLocaleString("about_hero_title")}
                    onChange={(e) => setLocaleString("about_hero_title", e.target.value)}
                    className={`${inputClass} font-bold text-lg`}
                  />
                </motion.div>
                <motion.div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    rows={4}
                    value={getLocaleString("about_hero_description")}
                    onChange={(e) => setLocaleString("about_hero_description", e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </motion.div>
                <motion.div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Text (optional)</label>
                  <input
                    type="text"
                    value={getLocaleString("about_hero_cta_text")}
                    onChange={(e) => setLocaleString("about_hero_cta_text", e.target.value)}
                    className={inputClass}
                    placeholder="Read our story"
                  />
                </motion.div>
                <motion.div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Link (optional)</label>
                  <input
                    type="text"
                    value={settings.about_hero_cta_link}
                    onChange={(e) => updateSetting("about_hero_cta_link", e.target.value)}
                    className={inputClass}
                    placeholder="/about or #our-mission"
                  />
                </motion.div>
              </motion.div>
            </section>

            <section className="space-y-6">
              <motion.div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Mission</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Yellow eyebrow, large headline quote, and supporting description in the dark card.
                </p>
              </motion.div>

              <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-600">Mission Eyebrow</label>
                  <input
                    type="text"
                    value={getLocaleString("about_mission_eyebrow")}
                    onChange={(e) => setLocaleString("about_mission_eyebrow", e.target.value)}
                    className={`${inputClass} font-bold text-yellow-600`}
                    placeholder="OUR MISSION"
                  />
                </motion.div>
                <motion.div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mission Title</label>
                  <textarea
                    rows={2}
                    value={getLocaleString("about_mission_title")}
                    onChange={(e) => setLocaleString("about_mission_title", e.target.value)}
                    className={`${inputClass} resize-none font-bold text-lg`}
                  />
                </motion.div>
                <motion.div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mission Description</label>
                  <textarea
                    rows={4}
                    value={getLocaleString("about_mission_description")}
                    onChange={(e) => setLocaleString("about_mission_description", e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </motion.div>
              </motion.div>
            </section>

            <section className="space-y-6">
              <motion.div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meet The Team</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Section header above the team carousel (eyebrow, title, and description).
                </p>
              </motion.div>

              <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div className="space-y-2">
                  <label className="text-sm font-bold text-yellow-600">Team Eyebrow</label>
                  <input
                    type="text"
                    value={getLocaleString("about_team_eyebrow")}
                    onChange={(e) => setLocaleString("about_team_eyebrow", e.target.value)}
                    className={`${inputClass} font-bold text-yellow-600`}
                    placeholder="OUR TEAM"
                  />
                </motion.div>
                <motion.div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Team Title</label>
                  <input
                    type="text"
                    value={getLocaleString("about_team_title")}
                    onChange={(e) => setLocaleString("about_team_title", e.target.value)}
                    className={`${inputClass} font-bold text-lg`}
                    placeholder="Meet The Team"
                  />
                </motion.div>
                <motion.div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Team Description</label>
                  <textarea
                    rows={3}
                    value={getLocaleString("about_team_subtitle")}
                    onChange={(e) => setLocaleString("about_team_subtitle", e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Strategists, researchers, and operators…"
                  />
                </motion.div>
              </motion.div>
            </section>

            <section className="space-y-6">
              <motion.div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">What We Value</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Section heading and dynamic value cards shown in a grid on the About page.
                </p>
              </motion.div>

              <motion.div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Heading</label>
                <input
                  type="text"
                  value={getLocaleString("about_values_heading")}
                  onChange={(e) => setLocaleString("about_values_heading", e.target.value)}
                  className={`${inputClass} font-bold text-lg`}
                  placeholder="What We Value"
                />
              </motion.div>

              <motion.div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <motion.div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Value Cards ({settings.about_value_items?.length ?? 0})
                  </h3>
                  <button
                    type="button"
                    onClick={addAboutValueItem}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Plus size={16} /> Add Card
                  </button>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  {settings.about_value_items?.map((item: AboutValueItem, index: number) => (
                    <motion.div
                      key={item.id ?? index}
                      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 shadow-sm dark:border-white/10 dark:bg-white/[0.02]"
                    >
                      <motion.div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-5 py-3 dark:border-white/10 dark:bg-white/5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Card {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAboutValueItem(index)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-500 transition-colors hover:text-rose-600"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </motion.div>

                      <motion.div className="flex flex-1 flex-col gap-5 p-5">
                        <motion.div className="space-y-3">
                          <label className="text-xs font-bold text-slate-500">Icon</label>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {ABOUT_VALUE_ICON_OPTIONS.map((opt) => {
                              const Icon = opt.Icon;
                              const selected =
                                (item.icon || getDefaultAboutValueIconId(index)) === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => updateAboutValueItem(index, { icon: opt.id })}
                                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 transition-all ${
                                    selected
                                      ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900"
                                  }`}
                                  title={opt.label}
                                >
                                  <Icon size={18} />
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>

                        <motion.div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Custom Icon Image (optional)</label>
                          <motion.div className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-checkerboard transition-colors hover:border-slate-400 dark:border-slate-700">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleAboutValueImageUpload(index, e)}
                              className="absolute inset-0 z-10 cursor-pointer opacity-0"
                            />
                            {item.image ? (
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <motion.div className="flex h-full flex-col items-center justify-center text-slate-400">
                                <Camera size={16} className="mb-0.5" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>

                        <motion.div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Short Text</label>
                          <textarea
                            rows={3}
                            value={langTab === "id" ? (item.text_id ?? "") : item.text}
                            onChange={(e) =>
                              updateAboutValueItem(
                                index,
                                langTab === "id"
                                  ? { text_id: e.target.value }
                                  : { text: e.target.value },
                              )
                            }
                            className={`${inputClass} resize-none`}
                            placeholder="Value statement..."
                          />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
                {(settings.about_value_items?.length ?? 0) === 0 && (
                  <p className="rounded-3xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-800">
                    No value cards yet. Click &quot;Add Card&quot; to create your first item.
                  </p>
                )}
              </motion.div>
            </section>
          </motion.div>
        )}

        {/* TAB 6: CTA & FOOTER */}
        {activeTab === "cta" && (
          <div className="space-y-6">
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Call To Action (CTA)</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-600">CTA Subtitle (Small Label)</label>
                    <input
                      type="text"
                      value={getLocaleString("cta_subtitle")}
                      onChange={(e) => setLocaleString("cta_subtitle", e.target.value)}
                      className={`${inputClass} text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600 dark:text-yellow-400`}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Title</label>
                    <input type="text" value={getLocaleString("cta_title")} onChange={(e) => setLocaleString("cta_title", e.target.value)} className={`${inputClass} font-bold text-lg`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Text</label>
                    <input type="text" value={getLocaleString("cta_button_text")} onChange={(e) => setLocaleString("cta_button_text", e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Link</label>
                    <input type="text" value={settings.cta_button_link} onChange={(e) => updateSetting("cta_button_link", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <motion.div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Careers page hero</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Headline on the public careers page (<code className="text-xs">/career</code>).
                </p>
              </motion.div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Hero title (before accent)
                    </label>
                    <input
                      type="text"
                      value={getLocaleString("careers_hero_title")}
                      onChange={(e) => setLocaleString("careers_hero_title", e.target.value)}
                      className={`${inputClass} font-bold text-lg`}
                      placeholder={langTab === "en" ? "Join Our" : "Bergabung dengan"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                      Hero title accent (yellow)
                    </label>
                    <input
                      type="text"
                      value={getLocaleString("careers_hero_title_accent")}
                      onChange={(e) => setLocaleString("careers_hero_title_accent", e.target.value)}
                      className={`${inputClass} font-bold text-yellow-600 dark:text-yellow-500`}
                      placeholder={langTab === "en" ? "Mission" : "Misi Kami"}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hero subtitle</label>
                    <input
                      type="text"
                      value={getLocaleString("careers_hero_subtitle")}
                      onChange={(e) => setLocaleString("careers_hero_subtitle", e.target.value)}
                      className={inputClass}
                      placeholder={
                        langTab === "en"
                          ? "Help us shape the future of public policy across Southeast Asia."
                          : "Bantu kami membentuk masa depan kebijakan publik di Asia Tenggara."
                      }
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "publications" && (
          <motion.div className="space-y-10">
            <section className="space-y-6">
              <motion.div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Knowledge Center</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Section title and subtitle on the homepage Knowledge Center block.
                </p>
              </motion.div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section title</label>
                  <input
                    type="text"
                    value={getLocaleString("knowledge_center_title")}
                    onChange={(e) => setLocaleString("knowledge_center_title", e.target.value)}
                    className={`${inputClass} font-bold text-lg uppercase tracking-wide`}
                    placeholder={langTab === "en" ? "KNOWLEDGE CENTER" : "PUSAT PENGETAHUAN"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section subtitle</label>
                  <textarea
                    rows={3}
                    value={getLocaleString("knowledge_center_subtitle")}
                    onChange={(e) => setLocaleString("knowledge_center_subtitle", e.target.value)}
                    className={inputClass}
                    placeholder={
                      langTab === "en"
                        ? "Explore our initiatives advancing knowledge, dialogue, and evidence-based policymaking."
                        : "Jelajahi inisiatif kami yang memajukan pengetahuan, dialog, dan kebijakan berbasis bukti."
                    }
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <motion.div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Latest Insights</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Section title on the homepage Latest Insights block.
                </p>
              </motion.div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section title</label>
                <input
                  type="text"
                  value={getLocaleString("latest_insights_title")}
                  onChange={(e) => setLocaleString("latest_insights_title", e.target.value)}
                  className={`${inputClass} font-bold text-lg`}
                  placeholder={langTab === "en" ? "Latest Insights" : "Wawasan Terbaru"}
                />
              </div>
            </section>
          </motion.div>
        )}

      </motion.div>

      {/* PANGGIL KOMPONEN IMPORT UNTUK FLOATING BUTTON */}
      <SaveAction onSave={handleSave} saving={saving} message={message} sticky={true} />

    </motion.div>
  );
}