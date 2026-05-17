"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CalendarDays, MapPin, Plus, Edit2, Trash2, X, Loader, Camera, Globe, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";
import {
  applySmartFallback,
  SMART_FALLBACK_CATEGORY_NAME_PAIRS,
  SMART_FALLBACK_EVENT_FIELD_PAIRS,
} from "@/lib/cms-smart-fallback";

function slugifyCategoryName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseApiMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message: unknown }).message);
  }
  return "";
}

function findCategoryConflict(
  categories: { id: string; name?: string; slug?: string }[],
  name: string,
  excludeId?: string,
) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugifyCategoryName(trimmed);
  return categories.find((cat) => {
    if (excludeId && cat.id === excludeId) return false;
    return (
      (cat.name || "").toLowerCase() === trimmed.toLowerCase() ||
      (cat.slug || "").toLowerCase() === slug.toLowerCase()
    );
  });
}

function validateCategoryName(
  categories: { id: string; name?: string; slug?: string }[],
  name: string,
  excludeId?: string,
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Category name is required.";
  const slug = slugifyCategoryName(trimmed);
  if (!slug) return "Category slug could not be generated from the name.";
  const conflict = findCategoryConflict(categories, trimmed, excludeId);
  if (conflict) {
    return `A category with this name or slug already exists ("${conflict.name}").`;
  }
  return null;
}

type EventRecord = {
  id: string;
  title: string;
  title_id?: string | null;
  date: string;
  location: string;
  location_id?: string | null;
  image: string;
  category?: string | null;
  category_id?: string | null;
  link?: string | null;
};

type EventCategoryRecord = {
  id: string;
  name: string;
  name_id?: string | null;
  slug: string;
};

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"events" | "categories">("events");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [categories, setCategories] = useState<EventCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryNameFilter, setCategoryNameFilter] = useState("");
  const [langTab, setLangTab] = useState<AdminLangTab>("id");
  const [catLangTab, setCatLangTab] = useState<AdminLangTab>("id");
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameId, setNewCatNameId] = useState("");
  const [editingCategory, setEditingCategory] = useState<EventCategoryRecord | null>(null);

  // State untuk Custom Delete Modal
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "event" | "category"; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    title_id: "",
    category: "",
    category_id: "",
    date: "",
    location: "",
    location_id: "",
    image: "",
    link: ""
  });

  // Tambahkan ?t=Date.now() agar terhindar dari Next.js fetch caching saat refresh
  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?t=${Date.now()}`);
      if (res.ok) {
        setEvents((await res.json()) as EventRecord[]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/event-categories?t=${Date.now()}`);
      if (res.ok) {
        setCategories((await res.json()) as EventCategoryRecord[]);
      }
    } catch (err) {
      console.error("Error fetching event categories:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [eventsRes, categoriesRes] = await Promise.all([
          fetch(`/api/events?t=${Date.now()}`),
          fetch(`/api/event-categories?t=${Date.now()}`),
        ]);
        if (cancelled) return;
        if (eventsRes.ok) {
          setEvents((await eventsRes.json()) as EventRecord[]);
        }
        if (categoriesRes.ok) {
          setCategories((await categoriesRes.json()) as EventCategoryRecord[]);
        }
      } catch (err) {
        console.error("Error loading events data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveCategory = async () => {
    const categoryDraft = applySmartFallback(
      {
        name: newCatName.trim(),
        name_id: newCatNameId.trim() || null,
      },
      SMART_FALLBACK_CATEGORY_NAME_PAIRS,
    );
    const validationError = validateCategoryName(
      categories,
      String(categoryDraft.name ?? ""),
      editingCategory?.id,
    );
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    try {
      setSavingCategory(true);
      const method = editingCategory ? "PUT" : "POST";
      const bodyWithFallback = applySmartFallback(
        editingCategory
          ? { id: editingCategory.id, ...categoryDraft }
          : { ...categoryDraft },
        SMART_FALLBACK_CATEGORY_NAME_PAIRS,
      );
      const trimmedName = String(bodyWithFallback.name ?? "").trim();
      const slug = slugifyCategoryName(trimmedName);
      const body = { ...bodyWithFallback, slug };

      const res = await fetch("/api/event-categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setNewCatName("");
        setNewCatNameId("");
        setEditingCategory(null);
        setCatLangTab("id");
        await fetchCategories();
        await fetchEvents();
        setMessage({
          type: "success",
          text: editingCategory ? "Category updated!" : "Category added!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 2000);
      } else {
        setMessage({
          type: "error",
          text: parseApiMessage(data) || "Failed to save category.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save category." });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = (cat: EventCategoryRecord) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setNewCatNameId(cat.name_id || "");
    setCatLangTab("id");
  };

  const handleOpenModal = (event: EventRecord | null = null) => {
    setLangTab("id");
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        title_id: event.title_id || "",
        category: event.category || "",
        category_id: event.category_id || "",
        date: event.date,
        location: event.location,
        location_id: event.location_id || "",
        image: event.image,
        link: event.link || ""
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        title_id: "",
        category: "",
        category_id: "",
        date: "",
        location: "",
        location_id: "",
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
      const body = applySmartFallback(
        editingEvent ? { id: editingEvent.id, ...formData } : { ...formData },
        SMART_FALLBACK_EVENT_FIELD_PAIRS,
      );

      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Event ${editingEvent ? "updated" : "created"} successfully!` });
        setModalOpen(false);
        await fetchEvents();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save event." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi Konfirmasi Delete Master (Untuk Category maupun Event)
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    
    try {
      const endpoint = itemToDelete.type === "event" 
        ? `/api/events?id=${itemToDelete.id}` 
        : `/api/event-categories?id=${itemToDelete.id}`;
        
      const res = await fetch(endpoint, { method: "DELETE" });
      
      if (res.ok) {
        setMessage({ type: "success", text: `${itemToDelete.type === "event" ? "Event" : "Category"} deleted successfully!` });
        
        // Panggil refresh sesuai tipe yang dihapus
        if (itemToDelete.type === "event") {
          await fetchEvents();
        } else {
          await fetchCategories();
          await fetchEvents();
        }
        
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to delete item." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete item." });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousImage = formData.image;
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: previewUrl }));
    setUploadingImage(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/events/upload-image", { method: "POST", body });
      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.message || "Upload failed");
      }
      setFormData((prev) => ({ ...prev, image: data.url! }));
    } catch {
      setFormData((prev) => ({ ...prev, image: previousImage }));
      setMessage({ type: "error", text: "Failed to upload image." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingImage(false);
      e.target.value = "";
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
    } catch {
      return dateStr;
    }
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) =>
        !categoryNameFilter ||
        (cat.name || "").toLowerCase().includes(categoryNameFilter.toLowerCase())
    );
  }, [categories, categoryNameFilter]);

  const categoryNameValid =
    catLangTab === "id" ? newCatNameId.trim() : newCatName.trim();

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
      <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Events</h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">Manage upcoming conferences, webinars, and policy sessions.</p>
        </div>

        <motion.div className="flex items-center gap-4">
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
          {activeTab === "events" && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add Event
            </button>
          )}
        </motion.div>
      </motion.div>

      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "events" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "categories" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
        >
          Categories
        </button>
      </div>

      {loading ? (
        <motion.div variants={itemVariants} className="h-[40vh] flex items-center justify-center">
          <Loader className="animate-spin text-slate-300" size={40} />
        </motion.div>
      ) : activeTab === "categories" ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category Name</label>
                  <AdminLangTabs value={catLangTab} onChange={setCatLangTab} />
                </div>
                {catLangTab === "en" ? (
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Conference, Webinar, Workshop..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50"
                  />
                ) : (
                  <input
                    type="text"
                    value={newCatNameId}
                    onChange={(e) => setNewCatNameId(e.target.value)}
                    placeholder="e.g. Konferensi, Webinar, Lokakarya..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50"
                  />
                )}
              </div>
              <button
                onClick={handleSaveCategory}
                disabled={savingCategory || !categoryNameValid}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {editingCategory ? "Update Category" : "Add Category"}
              </button>
              {editingCategory && (
                <button
                  onClick={() => { setEditingCategory(null); setNewCatName(""); setNewCatNameId(""); setCatLangTab("id"); }}
                  className="px-6 py-3 bg-slate-100 dark:bg-white/5 font-bold rounded-xl"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search categories by name..."
              value={categoryNameFilter}
              onChange={(e) => setCategoryNameFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Slug</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Events</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      {categories.length === 0 ? "No categories found. Add one above!" : "No categories match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {events.filter((e) => e.category === cat.name).length} events
                      </td>
                      <td className="px-6 py-4 text-right">
                        <motion.div variants={itemVariants} className="flex justify-end gap-2">
                          <button onClick={() => handleEditCategory(cat)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setItemToDelete({ id: cat.id, type: "category", name: cat.name })} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <motion.div variants={itemVariants} className="aspect-video w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Camera size={32} opacity={0.3} /></div>
                  )}
                  {event.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md border border-white/20">
                        {event.category}
                      </span>
                    </div>
                  )}
                </motion.div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 min-h-[3.5rem] leading-tight">
                    {event.title}
                  </h3>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CalendarDays size={16} className="text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin size={16} className="text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
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
                      onClick={() => setItemToDelete({ id: event.id, type: "event", name: event.title })}
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
        </>
      )}

      {/* MODAL EDITOR EVENT */}
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
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Event Title</label>
                      <AdminLangTabs value={langTab} onChange={setLangTab} />
                    </div>
                    {langTab === "en" ? (
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all"
                        placeholder="e.g. Global Policy Summit 2024"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.title_id}
                        onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all"
                        placeholder="mis. KTT Kebijakan Global 2024"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {langTab === "en" ? "Category Label" : "Label Kategori"}
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => {
                        const selected = categories.find((c) => c.name === e.target.value);
                        setFormData({
                          ...formData,
                          category: e.target.value,
                          category_id: selected
                            ? (selected.name_id?.trim() || selected.name || "")
                            : formData.category_id,
                        });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all appearance-none cursor-pointer"
                      disabled={categories.length === 0}
                    >
                      {categories.length === 0 ? (
                        <option value="">
                          {langTab === "en"
                            ? "Add categories in the Categories tab first"
                            : "Tambahkan kategori di tab Kategori terlebih dahulu"}
                        </option>
                      ) : (
                        <>
                          <option value="">
                            {langTab === "en" ? "Select Category" : "Pilih Kategori"}
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {langTab === "en"
                                ? cat.name
                                : (cat.name_id?.trim() || cat.name)}
                            </option>
                          ))}
                          {formData.category &&
                            !categories.some((c) => c.name === formData.category) && (
                              <option value={formData.category}>
                                {langTab === "en"
                                  ? formData.category
                                  : (formData.category_id?.trim() || formData.category)}{" "}
                                (legacy)
                              </option>
                            )}
                        </>
                      )}
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
                      {langTab === "en" ? (
                        <input
                          required
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all"
                          placeholder="e.g. Jakarta, Indonesia or Online (Zoom)"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData.location_id}
                          onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all"
                          placeholder="mis. Jakarta, Indonesia atau Daring (Zoom)"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Registration / Detail Link</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="url"
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
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      />
                      {uploadingImage ? (
                        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
                          <Loader className="animate-spin text-slate-400" size={28} />
                          <span className="text-sm font-bold text-slate-400">Uploading...</span>
                        </motion.div>
                      ) : formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          <motion.div variants={itemVariants} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                          </motion.div>
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
                    disabled={saving || uploadingImage || categories.length === 0}
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

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setItemToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 p-6 sm:p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Delete {itemToDelete.type === "event" ? "Event" : "Category"}?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">"{itemToDelete.name}"</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? <Loader className="animate-spin" size={18} /> : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}