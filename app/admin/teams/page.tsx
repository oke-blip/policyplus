"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  UsersRound,
  Plus,
  Trash2,
  Loader,
  Camera,
  Search,
  ChevronUp,
  ChevronDown,
  GripVertical,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react";

import {
  hasUnsavedPortrait,
  normalizeTeamMemberOrder,
  parseTeamMembers,
  prepareTeamMembersForSave,
  type TeamMemberCategory,
  type TeamMemberRecord,
} from "@/lib/team-members";
import {
  EMPTY_TEAM_SECTION_COPY,
  parseTeamSectionCopy,
  prepareTeamSectionCopyForSave,
  type TeamSectionCopy,
  type TeamSectionCopyKey,
} from "@/lib/team-section-copy";
import {
  applySmartFallbackToArrayItems,
  SMART_FALLBACK_TEAM_MEMBER_FIELD_PAIRS,
} from "@/lib/cms-smart-fallback";
import { uploadToSupabase } from "@/lib/upload";

import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";

const MAX_PORTRAIT_BYTES = 5 * 1024 * 1024;

let draftMemberSeq = 0;

function emptyMember(): TeamMemberRecord {
  draftMemberSeq += 1;
  return {
    id: Date.now() * 1000 + draftMemberSeq,
    name: "",
    name_id: "",
    role: "",
    role_id: "",
    focus: "",
    focus_id: "",
    bio: "",
    bio_id: "",
    image: "",
    category: "internal",
    order: 0,
  };
}

const inputClass =
  "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-yellow-500/10 focus:border-yellow-500 dark:focus:ring-yellow-500/20 dark:focus:border-yellow-500/50 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600";

export default function TeamsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [members, setMembers] = useState<TeamMemberRecord[]>([]);
  const [sectionCopy, setSectionCopy] = useState<TeamSectionCopy>(EMPTY_TEAM_SECTION_COPY);
  const [search, setSearch] = useState("");
  const [uploadingPortraitId, setUploadingPortraitId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [langTab, setLangTab] = useState<AdminLangTab>("id");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setFetchError("");
        const res = await fetch("/api/settings?t=" + Date.now());
        if (!res.ok) {
          if (!cancelled) {
            setFetchError("Could not load team members. You can still add and save below.");
            setMembers([emptyMember()]);
          }
          return;
        }
        const data = (await res.json()) as Record<string, unknown>;
        const parsed = parseTeamMembers(data.team_members);
        if (!cancelled) {
          setMembers(parsed.length > 0 ? parsed : [emptyMember()]);
          setSectionCopy(parseTeamSectionCopy(data));
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
        if (!cancelled) {
          setFetchError("Could not load team members. You can still add and save below.");
          setMembers([emptyMember()]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const haystack = [
        m.name,
        m.name_id ?? "",
        m.role,
        m.role_id ?? "",
        m.focus,
        m.focus_id ?? "",
        m.bio ?? "",
        m.bio_id ?? "",
        m.category ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [members, search]);

  const handleSave = async () => {
    if (uploadingPortraitId !== null) {
      setMessage({
        type: "error",
        text: "Wait for the portrait upload to finish before saving.",
      });
      return;
    }

    if (hasUnsavedPortrait(members)) {
      setMessage({
        type: "error",
        text: "A portrait is still uploading or was not saved to storage. Re-upload the image, then save again.",
      });
      return;
    }

    const withFallback = applySmartFallbackToArrayItems(
      members as Record<string, unknown>[],
      SMART_FALLBACK_TEAM_MEMBER_FIELD_PAIRS,
    ) as TeamMemberRecord[];
    const payload = prepareTeamMembersForSave(withFallback);
    const headerPayload = prepareTeamSectionCopyForSave(sectionCopy);

    if (payload.length === 0) {
      setMessage({
        type: "error",
        text: "Enter a name (EN or ID) for at least one team member before saving.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_members: payload, ...headerPayload }),
      });

      if (res.ok) {
        setMembers(payload);
        setSectionCopy(headerPayload);
        setFetchError("");
        setMessage({ type: "success", text: "Team section saved!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const body = await res.json().catch(() => ({}));
        setMessage({
          type: "error",
          text: (body as { message?: string }).message || `Failed to save (${res.status}).`,
        });
      }
    } catch (error) {
      console.error("Error saving team members:", error);
      setMessage({
        type: "error",
        text: "Failed to save. Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const addMember = () => {
    setSearch(""); // Reset search so new member is visible
    setMembers((prev) => normalizeTeamMemberOrder([...prev, emptyMember()]));
  };

  const removeMember = (id: number) => {
    setMembers((prev) => normalizeTeamMemberOrder(prev.filter((m) => m.id !== id)));
  };

  const confirmRemoveMember = () => {
    if (!deleteTarget) return;
    removeMember(deleteTarget.id);
    setDeleteTarget(null);
  };

  const updateMember = (id: number, patch: Partial<TeamMemberRecord>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const updateSectionCopy = (key: TeamSectionCopyKey, value: string) => {
    setSectionCopy((prev) => ({
      ...prev,
      [langTab === "en" ? key : (`${key}_id` as const)]: value,
    }));
  };

  const sectionFieldValue = (key: TeamSectionCopyKey): string =>
    langTab === "en" ? sectionCopy[key] : sectionCopy[`${key}_id`];

  const moveMember = (id: number, dir: -1 | 1) => {
    setMembers((prev) => {
      const index = prev.findIndex((m) => m.id === id);
      if (index < 0) return prev;
      const nextIndex = index + dir;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item!);
      return normalizeTeamMemberOrder(next);
    });
  };

  const handleImageUpload = async (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PORTRAIT_BYTES) {
      setMessage({
        type: "error",
        text: "Portrait must be 5 MB or smaller.",
      });
      e.target.value = "";
      return;
    }

    const member = members.find((m) => m.id === id);
    const previousImage = member?.image ?? "";
    const previewUrl = URL.createObjectURL(file);
    updateMember(id, { image: previewUrl });

    try {
      setUploadingPortraitId(id);
      setMessage({ type: "", text: "" });
      const url = await uploadToSupabase(file, "public-assets", "teams");
      updateMember(id, { image: url });
    } catch (error) {
      console.error("Portrait upload failed:", error);
      updateMember(id, { image: previousImage });
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Portrait upload failed. Check your connection and try again.",
      });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingPortraitId(null);
      e.target.value = "";
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader className="animate-spin text-gray-400 dark:text-white/20" size={32} />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Meet The Team</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Section header copy and roster for the About page team block.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {message.text && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'}`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200/50 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertCircle size={18} className="shrink-0" />
          {fetchError}
        </div>
      )}

      {/* SECTION HEADER */}
      <motion.div
        variants={itemVariants}
        className="rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] p-6 sm:p-8 shadow-sm dark:shadow-none"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-100 dark:border-white/5 pb-6 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Section header</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Gold eyebrow, main title, and description shown above the team grids.
            </p>
          </div>
          <AdminLangTabs value={langTab} onChange={setLangTab} />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
              Eyebrow
            </label>
            <input
              type="text"
              value={sectionFieldValue("about_team_eyebrow")}
              onChange={(e) => updateSectionCopy("about_team_eyebrow", e.target.value)}
              placeholder={langTab === "en" ? "OUR TEAM" : "TIM KAMI"}
              className={`${inputClass} font-bold text-yellow-600 dark:text-yellow-500`}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">
              Title
            </label>
            <input
              type="text"
              value={sectionFieldValue("about_team_title")}
              onChange={(e) => updateSectionCopy("about_team_title", e.target.value)}
              placeholder={langTab === "en" ? "Meet The Team" : "Kenali Tim Kami"}
              className={`${inputClass} text-lg font-bold`}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">
              Description
            </label>
            <textarea
              rows={3}
              value={sectionFieldValue("about_team_subtitle")}
              onChange={(e) => updateSectionCopy("about_team_subtitle", e.target.value)}
              placeholder={
                langTab === "en"
                  ? "Strategists, researchers, and operators…"
                  : "Strategis, peneliti, dan operator…"
              }
              className={`${inputClass} resize-none text-sm`}
            />
          </div>
        </div>
      </motion.div>

      {/* SEARCH BAR AREA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or bio…"
            className="w-full bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-yellow-500 dark:focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm dark:shadow-none"
          />
        </div>
        <button
          type="button"
          onClick={addMember}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-5 py-3 text-sm font-bold text-gray-700 dark:text-white transition-all hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 w-full sm:w-auto"
        >
          <Plus size={18} /> Add member
        </button>
      </div>

      {/* MEMBER GRID */}
      {filteredMembers.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 p-10 text-center">
          <UsersRound className="mb-4 size-12 text-gray-300 dark:text-white/20" />
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            {members.length === 0
              ? "No team members yet. Add your first teammate."
              : "No members match your search."}
          </p>
          {members.length === 0 && (
            <button type="button" onClick={addMember} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-slate-900 transition-transform hover:scale-105">
              <Plus size={16} /> Add member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member) => {
              const displayIndex = members.findIndex((m) => m.id === member.id);
              
              return (
                <motion.div
                  layout
                  key={member.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] shadow-sm dark:shadow-none overflow-hidden transition-colors hover:border-yellow-500/50 dark:hover:border-yellow-500/30 group"
                >
                  {/* Card Header (Actions) */}
                  <div className="flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <GripVertical size={16} className="text-gray-400 dark:text-slate-600" />
                      <span className="text-xs font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest tabular-nums">
                        Member {String(displayIndex + 1).padStart(2, "0")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveMember(member.id, -1)}
                        disabled={displayIndex <= 0 || !!search} // Disable move if searching
                        className="rounded-lg p-2 text-gray-400 dark:text-slate-400 transition hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMember(member.id, 1)}
                        disabled={displayIndex < 0 || displayIndex >= members.length - 1 || !!search}
                        className="rounded-lg p-2 text-gray-400 dark:text-slate-400 transition hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-2"></div>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: member.id,
                            name: member.name.trim() || member.name_id?.trim() || "this team member",
                          })
                        }
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 p-6 flex flex-col sm:flex-row gap-8">
                    
                    {/* Avatar Upload */}
                    <div className="relative size-28 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-yellow-500/50 transition-colors self-start">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        disabled={uploadingPortraitId === member.id}
                        onChange={(e) => void handleImageUpload(member.id, e)}
                        className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-wait"
                        title="Upload avatar"
                      />
                      {member.image ? (
                        <img src={member.image} alt="Avatar" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center text-gray-300 dark:text-white/20 group-hover:text-yellow-500/50 transition-colors">
                          <Camera size={24} />
                        </div>
                      )}
                      {uploadingPortraitId === member.id && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <Loader className="size-6 animate-spin text-yellow-500" />
                        </div>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="min-w-0 flex-1 space-y-6">
                      
                      {/* Top Row: Section & Tabs */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">
                              Section Type
                            </label>
                            <select
                              value={member.category ?? "internal"}
                              onChange={(e) => updateMember(member.id, { category: e.target.value as TeamMemberCategory })}
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white font-bold outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 dark:focus:ring-yellow-500/20 transition-all appearance-none cursor-pointer"
                            >
                              <option value="internal" className="bg-white dark:bg-slate-900">Internal Team</option>
                              <option value="advisor" className="bg-white dark:bg-slate-900">Advisor</option>
                            </select>
                          </div>
                          
                          <label className="flex cursor-pointer items-center gap-2 pt-4 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={member.isLeadership === true}
                              onChange={(e) => updateMember(member.id, {
                                isLeadership: e.target.checked,
                                ...(!e.target.checked ? { bio: "", bio_id: "" } : {}),
                              })}
                              className="size-4 rounded border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                            />
                            Show bio (Leadership)
                          </label>
                        </div>
                        
                        <AdminLangTabs value={langTab} onChange={setLangTab} />
                      </div>

                      {/* Name & Role */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">Name</label>
                          <input
                            type="text"
                            value={langTab === "en" ? member.name : (member.name_id ?? "")}
                            onChange={(e) => updateMember(member.id, langTab === "en" ? { name: e.target.value } : { name_id: e.target.value })}
                            placeholder={langTab === "en" ? "Full name" : "Nama lengkap"}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">Role</label>
                          <input
                            type="text"
                            value={langTab === "en" ? member.role : (member.role_id ?? "")}
                            onChange={(e) => updateMember(member.id, langTab === "en" ? { role: e.target.value } : { role_id: e.target.value })}
                            placeholder={langTab === "en" ? "Job title" : "Jabatan"}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {/* Focus Field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">
                          Focus Area
                        </label>
                        <textarea
                          rows={2}
                          value={langTab === "en" ? member.focus : (member.focus_id ?? "")}
                          onChange={(e) => updateMember(member.id, langTab === "en" ? { focus: e.target.value } : { focus_id: e.target.value })}
                          placeholder={langTab === "en" ? "Short summary of expertise..." : "Ringkasan keahlian..."}
                          className={`${inputClass} resize-none text-sm`}
                        />
                      </div>

                      {/* Bio Field (Conditional) */}
                      {member.isLeadership && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
                            Extended Leadership Bio
                          </label>
                          <textarea
                            rows={3}
                            value={langTab === "en" ? (member.bio ?? "") : (member.bio_id ?? "")}
                            onChange={(e) => updateMember(member.id, langTab === "en" ? { bio: e.target.value } : { bio_id: e.target.value })}
                            placeholder={langTab === "en" ? "Detailed background..." : "Latar belakang detail..."}
                            className={`${inputClass} resize-none text-sm border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20`}
                          />
                        </motion.div>
                      )}

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0c] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Remove Member?</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to remove <strong className="text-gray-900 dark:text-white">"{deleteTarget.name}"</strong>? You must save the roster to persist this change.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={confirmRemoveMember} className="flex-[1.5] py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all">
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}