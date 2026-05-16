"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

import {
  hasUnsavedPortrait,
  normalizeTeamMemberOrder,
  parseTeamMembers,
  prepareTeamMembersForSave,
  type TeamMemberRecord,
} from "@/lib/team-members";
import {
  applySmartFallbackToArrayItems,
  SMART_FALLBACK_TEAM_MEMBER_FIELD_PAIRS,
} from "@/lib/cms-smart-fallback";
import { uploadToSupabase } from "@/lib/upload";

import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";
import { SaveAction } from "@/components/admin/SaveAction";

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
    image: "",
    order: 0,
  };
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all";

export default function TeamsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [members, setMembers] = useState<TeamMemberRecord[]>([]);
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
        const res = await fetch("/api/settings");
        if (!res.ok) {
          if (!cancelled) {
            setFetchError("Could not load team members. You can still add and save below.");
            setMembers([emptyMember()]);
          }
          return;
        }
        const data = await res.json();
        const parsed = parseTeamMembers(data.team_members);
        if (!cancelled) {
          setMembers(parsed.length > 0 ? parsed : [emptyMember()]);
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
        body: JSON.stringify({ team_members: payload }),
      });

      if (res.ok) {
        setMembers(payload);
        setFetchError("");
        setMessage({ type: "success", text: "Team roster saved!" });
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-[60vh] items-center justify-center"
      >
        <Loader className="animate-spin text-slate-400" size={40} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-24"
    >
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Team Members
          </h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">
            Manage the About page roster — names, roles, bios, and portraits.
          </p>
        </div>
        <div className="hidden sm:block">
          <SaveAction onSave={handleSave} saving={saving} message={message} />
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle size={16} className="shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Konten Utama */}
      <div className="rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-white/[0.02] min-w-0">
        
        {/* Search & Add Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, or bio…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-slate-900 outline-none transition-all focus:ring-2 focus:ring-slate-500/50 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button
            type="button"
            onClick={addMember}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-400 hover:bg-white/60 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/30 dark:hover:bg-white/5"
          >
            <Plus size={18} /> Add member
          </button>
        </div>

        {/* Member Grid / Empty State */}
        {filteredMembers.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-white/10">
            <UsersRound className="mb-4 size-12 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {members.length === 0
                ? "No team members yet. Add your first teammate."
                : "No members match your search."}
            </p>
            {members.length === 0 && (
              <button
                type="button"
                onClick={addMember}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
              >
                <Plus size={16} /> Add member
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member, displayIndex) => {
                const index = members.findIndex((m) => m.id === member.id);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={member.id}
                    className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50/50 shadow-sm dark:border-white/10 dark:bg-white/[0.02] overflow-hidden"
                  >
                    {/* Header Card (Action Buttons) */}
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-white/5 px-5 py-3 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider tabular-nums">
                          Member {String(displayIndex + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveMember(member.id, -1)}
                          disabled={index <= 0}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white"
                          title="Move up"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMember(member.id, 1)}
                          disabled={index < 0 || index >= members.length - 1}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white"
                          title="Move down"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: member.id,
                              name:
                                member.name.trim() ||
                                member.name_id?.trim() ||
                                "this team member",
                            })
                          }
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Body Card */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row gap-6">
                      
                      {/* Avatar Upload */}
                      <div className="relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 transition-colors self-start sm:self-auto">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={uploadingPortraitId === member.id}
                          onChange={(e) => void handleImageUpload(member.id, e)}
                          className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-wait"
                          title="Upload avatar"
                        />
                        {member.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={member.image} alt="Avatar" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full flex-col items-center justify-center text-slate-400">
                            <Camera size={20} />
                          </div>
                        )}
                        {uploadingPortraitId === member.id ? (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                            <Loader className="size-6 animate-spin text-white" aria-hidden />
                          </div>
                        ) : null}
                      </div>

                      {/* Input Fields */}
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex justify-end">
                          <AdminLangTabs value={langTab} onChange={setLangTab} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-wide text-slate-500 uppercase">Name</label>
                            {langTab === "en" ? (
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => updateMember(member.id, { name: e.target.value })}
                                placeholder="Full name"
                                className={inputClass}
                              />
                            ) : (
                              <input
                                type="text"
                                value={member.name_id ?? ""}
                                onChange={(e) => updateMember(member.id, { name_id: e.target.value })}
                                placeholder="Nama lengkap"
                                className={inputClass}
                              />
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-wide text-slate-500 uppercase">Role</label>
                            {langTab === "en" ? (
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => updateMember(member.id, { role: e.target.value })}
                                placeholder="Job title"
                                className={inputClass}
                              />
                            ) : (
                              <input
                                type="text"
                                value={member.role_id ?? ""}
                                onChange={(e) => updateMember(member.id, { role_id: e.target.value })}
                                placeholder="Jabatan"
                                className={inputClass}
                              />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold tracking-wide text-slate-500 uppercase">Focus / Bio</label>
                          {langTab === "en" ? (
                            <textarea
                              rows={3}
                              value={member.focus}
                              onChange={(e) => updateMember(member.id, { focus: e.target.value })}
                              placeholder="Short spotlight bio..."
                              className={`${inputClass} resize-none`}
                            />
                          ) : (
                            <textarea
                              rows={3}
                              value={member.focus_id ?? ""}
                              onChange={(e) => updateMember(member.id, { focus_id: e.target.value })}
                              placeholder="Bio singkat..."
                              className={`${inputClass} resize-none`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Save Button di Kanan Bawah */}
      <SaveAction onSave={handleSave} saving={saving} message={message} sticky={true} />

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-slate-900 sm:p-8"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/20">
                <Trash2 size={32} />
              </div>
              <h2 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
                Remove team member?
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Are you sure you want to remove{" "}
                <strong className="text-slate-700 dark:text-slate-200">
                  &quot;{deleteTarget.name}&quot;
                </strong>
                ? Save the roster to persist this change.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl bg-slate-100 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveMember}
                  className="flex-1 rounded-xl bg-rose-500 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-rose-600"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}