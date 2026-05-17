"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { BookOpen, Newspaper, Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, X, Loader, Camera, CheckCircle2, AlertCircle, User, FileText, Hash } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";
import {
  applySmartFallback,
  SMART_FALLBACK_CATEGORY_NAME_PAIRS,
  SMART_FALLBACK_POST_FIELD_PAIRS,
} from "@/lib/cms-smart-fallback";
import { stripHtml } from "@/lib/strip-html";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const DEFAULT_PUBLISHER_EN = "Team Policy +";
const DEFAULT_PUBLISHER_ID = "Tim Policy +";

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

type PostFormData = {
  title: string;
  title_id: string;
  content: string;
  content_id: string;
  image_url: string;
  status: string;
  type: string;
  category: string;
  category_id: string;
  author_name: string;
  author_name_id: string;
  author_role: string;
  author_role_id: string;
  author_bio: string;
  author_bio_id: string;
  author_image: string;
  tags: string;
  tags_id: string;
};

// 1. VALIDASI DIPERBARUI: Author dan kawan-kawannya tidak lagi wajib (mandatory)
function validatePostForm(formData: PostFormData): string | null {
  if (!formData.title.trim()) return "Title is required.";
  if (!stripHtml(formData.content)) return "Article content is required.";
  if (!formData.category.trim()) return "Category is required.";
  if (!formData.image_url.trim()) return "Featured image is required.";
  if (
    formData.image_url.startsWith("blob:") ||
    formData.author_image.startsWith("blob:")
  ) {
    return "Please wait for image upload to finish.";
  }

  // Blok validasi author dihilangkan agar opsional
  return null;
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

export default function PublicationsPage() {
  const [activeTab, setActiveTab] = useState("insights");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // 2. STATE BARU: Khusus untuk menampilkan error di dalam Modal
  const [modalError, setModalError] = useState("");

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "post" | "category"; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [langTab, setLangTab] = useState<AdminLangTab>("id");
  const [catLangTab, setCatLangTab] = useState<AdminLangTab>("id");

  const [formData, setFormData] = useState({
    title: "",
    title_id: "",
    content: "",
    content_id: "",
    image_url: "",
    status: "PUBLISHED",
    type: "INSIGHT",
    category: "",
    category_id: "",
    author_name: DEFAULT_PUBLISHER_EN,
    author_name_id: DEFAULT_PUBLISHER_ID,
    author_role: "",
    author_role_id: "",
    author_bio: "",
    author_bio_id: "",
    author_image: "",
    tags: "",
    tags_id: "",
  });

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "color"],
      ["clean"],
    ],
  }), []);

  const [newCatName, setNewCatName] = useState("");
  const [newCatNameId, setNewCatNameId] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [insightTitleFilter, setInsightTitleFilter] = useState("");
  const [insightPublisherFilter, setInsightPublisherFilter] = useState("");
  const [knowledgeTitleFilter, setKnowledgeTitleFilter] = useState("");
  const [categoryNameFilter, setCategoryNameFilter] = useState("");

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/posts?admin=true&t=" + Date.now(), {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setPosts(Array.isArray(data) ? data : []);
      } else {
        const apiMessage =
          data && typeof data === "object" && "message" in data
            ? String((data as { message: unknown }).message)
            : "";
        setMessage({
          type: "error",
          text: apiMessage || `Failed to load publications (${res.status}).`,
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setMessage({ type: "error", text: "Failed to load publications." });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setCategories(Array.isArray(data) ? data : []);
      } else {
        const apiMessage =
          data && typeof data === "object" && "message" in data
            ? String((data as { message: unknown }).message)
            : "";
        setMessage({
          type: "error",
          text: apiMessage || `Failed to load categories (${res.status}).`,
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
      const body = editingCategory
        ? { ...bodyWithFallback, slug }
        : { ...bodyWithFallback, slug };

      const res = await fetch("/api/categories", {
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
        fetchCategories();
        fetchPosts();
        setMessage({ type: "success", text: editingCategory ? "Category updated!" : "Category added!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 2000);
      } else {
        const apiMessage = parseApiMessage(data);
        setMessage({
          type: "error",
          text: apiMessage || "Failed to save category.",
        });
        if (res.status === 409) {
          fetchCategories();
        }
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save category." });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setNewCatNameId(cat.name_id || "");
    setCatLangTab("id");
  };

  const handleOpenModal = (post: any = null) => {
    setModalError(""); // Reset error saat modal dibuka
    setLangTab("id");
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        title_id: post.title_id || "",
        content: post.content,
        content_id: post.content_id || "",
        image_url: post.image_url || "",
        status: post.status,
        type: post.type || "INSIGHT",
        category: post.category || "",
        category_id: post.category_id || "",
        author_name: post.author_name || "",
        author_name_id: post.author_name_id || "",
        author_role: post.author_role || "",
        author_role_id: post.author_role_id || "",
        author_bio: post.author_bio || "",
        author_bio_id: post.author_bio_id || "",
        author_image: post.author_image || "",
        tags: post.tags || "",
        tags_id: post.tags_id || "",
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        title_id: "",
        content: "",
        content_id: "",
        image_url: "",
        status: "PUBLISHED",
        type: activeTab === "knowledge" ? "KNOWLEDGE" : "INSIGHT",
        category: "",
        category_id: "",
        author_name: activeTab === "insights" ? DEFAULT_PUBLISHER_EN : "",
        author_name_id: activeTab === "insights" ? DEFAULT_PUBLISHER_ID : "",
        author_role: "",
        author_role_id: "",
        author_bio: "",
        author_bio_id: "",
        author_image: "",
        tags: "",
        tags_id: "",
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(""); // Reset error setiap kali tekan Save

    try {
      setSaving(true);
      const method = editingPost ? "PUT" : "POST";
      const body = applySmartFallback(
        editingPost ? { id: editingPost.id, ...formData } : { ...formData },
        SMART_FALLBACK_POST_FIELD_PAIRS,
      );
      const validationError = validatePostForm(body as PostFormData);
      if (validationError) {
        setModalError(validationError);
        return;
      }

      const res = await fetch("/api/posts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Saved successfully!" });
        setModalOpen(false);
        fetchPosts();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setModalError((err as { message?: string }).message || "Failed to save publication."); // API error ke dalam Modal
      }
    } catch {
      setModalError("Error saving post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const endpoint =
        itemToDelete.type === "post"
          ? `/api/posts?id=${itemToDelete.id}`
          : `/api/categories?id=${itemToDelete.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });

      if (res.ok) {
        if (itemToDelete.type === "post") {
          setMessage({ type: "success", text: "Deleted successfully!" });
          fetchPosts();
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } else {
          fetchCategories();
          fetchPosts();
          setMessage({ type: "success", text: "Category deleted." });
          setTimeout(() => setMessage({ type: "", text: "" }), 2000);
        }
      } else {
        setMessage({
          type: "error",
          text:
            itemToDelete.type === "post"
              ? "Failed to delete publication."
              : "Failed to delete category.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: itemToDelete.type === "post" ? "Error deleting" : "Failed to delete category.",
      });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const uploadPublicationImage = async (
    file: File,
    field: "image_url" | "author_image",
    folder: "insights" | "knowledge",
  ) => {
    const previous = formData[field];
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, [field]: previewUrl }));

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/posts/upload-image?folder=${folder}`, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.message || "Upload failed");
      }
      setFormData((prev) => ({ ...prev, [field]: data.url! }));
    } catch (error) {
      setFormData((prev) => ({ ...prev, [field]: previous }));
      setModalError(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const folder =
      formData.type === "KNOWLEDGE" ? "knowledge" : "insights";
    await uploadPublicationImage(file, "image_url", folder);
    e.target.value = "";
  };

  const handleAuthorImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadPublicationImage(file, "author_image", "insights");
    e.target.value = "";
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) =>
        !categoryNameFilter ||
        (cat.name || "").toLowerCase().includes(categoryNameFilter.toLowerCase())
    );
  }, [categories, categoryNameFilter]);

  const categoryNameValid =
    catLangTab === "id" ? newCatNameId.trim() : newCatName.trim();

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeTab === "insights") {
        if (p.type !== "INSIGHT") return false;
        const titleMatch =
          !insightTitleFilter ||
          (p.title || "").toLowerCase().includes(insightTitleFilter.toLowerCase());
        const publisherMatch =
          !insightPublisherFilter ||
          (p.author_name || "").toLowerCase().includes(insightPublisherFilter.toLowerCase());
        return titleMatch && publisherMatch;
      }
      if (activeTab === "knowledge") {
        if (p.type !== "KNOWLEDGE") return false;
        return (
          !knowledgeTitleFilter ||
          (p.title || "").toLowerCase().includes(knowledgeTitleFilter.toLowerCase())
        );
      }
      return false;
    });
  }, [posts, activeTab, insightTitleFilter, insightPublisherFilter, knowledgeTitleFilter]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Publications</h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">Manage Insights and Knowledge Center articles.</p>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {message.text && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}>
                {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
          {activeTab !== "categories" && (
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all">
              <Plus size={20} />
              Create Post
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit">
        <button onClick={() => setActiveTab("insights")} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "insights" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}>Latest Insights</button>
        <button onClick={() => setActiveTab("knowledge")} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "knowledge" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}>Knowledge Center</button>
        <button onClick={() => setActiveTab("categories")} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "categories" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}>Categories</button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center"><Loader className="animate-spin text-slate-300" size={40} /></div>
      ) : activeTab === "categories" ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
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
                    placeholder="e.g. Sustainability, Governance..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50"
                  />
                ) : (
                  <input
                    type="text"
                    value={newCatNameId}
                    onChange={(e) => setNewCatNameId(e.target.value)}
                    placeholder="e.g. Keberlanjutan, Tata Kelola..."
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
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Slug</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Posts</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">No categories found. Add one above!</td>
                  </tr>
                ) : (
                  filteredCategories.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {posts.filter(p => p.category === cat.name).length} articles
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditCategory(cat)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setItemToDelete({ id: cat.id, type: "category", name: cat.name })} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <motion.div key={post.id} variants={itemVariants} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
              <div className="aspect-video w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                {post.image_url ? <img src={post.image_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-400"><Camera size={24} /></div>}
                {post.category && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white">{post.category}</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                  {stripHtml(post.content || "")}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.status}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(post)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => setItemToDelete({ id: post.id, type: "post", name: post.title })} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-white/5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Editor */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 my-8 flex flex-col max-h-[90vh]">
              
              {/* Header Modal */}
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{editingPost ? "Edit Post" : "Create Post"}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
              </div>
              
              {/* Tempat Menampilkan Error Khusus di Dalam Modal */}
              <AnimatePresence>
                {modalError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-8 pt-6">
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                      <AlertCircle size={18} className="shrink-0" />
                      {modalError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                {/* Type & Category Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <FileText size={14} /> Publication Type
                    </label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none font-bold">
                      <option value="INSIGHT">Latest Insight (Article Style)</option>
                      <option value="KNOWLEDGE">Knowledge Center (Report Style)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Filter size={14} /> {langTab === "en" ? "Category Label" : "Label Kategori"}
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
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none font-bold appearance-none cursor-pointer"
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title</label>
                    <AdminLangTabs value={langTab} onChange={setLangTab} />
                  </div>
                  {langTab === "en" ? (
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50 font-bold text-lg" placeholder="Enter article title..." />
                  ) : (
                    <input type="text" value={formData.title_id} onChange={(e) => setFormData({ ...formData, title_id: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50 font-bold text-lg" placeholder="Masukkan judul artikel..." />
                  )}
                </div>

                {/* PUBLISHER PROFILE - SEKARANG OPSIONAL */}
                {formData.type === "INSIGHT" && (
                  <div className="space-y-4 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User size={14} /> Publisher Profile (Optional)
                    </label>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative h-24 w-24 shrink-0 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden group">
                        <input type="file" accept="image/*" onChange={handleAuthorImageUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                        {formData.author_image ? <img src={formData.author_image} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-300"><Camera size={20} /></div>}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {langTab === "en" ? (
                            <input
                              placeholder={DEFAULT_PUBLISHER_EN}
                              type="text"
                              value={formData.author_name}
                              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none font-bold text-sm"
                            />
                          ) : (
                            <input
                              placeholder={DEFAULT_PUBLISHER_ID}
                              type="text"
                              value={formData.author_name_id}
                              onChange={(e) => setFormData({ ...formData, author_name_id: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none font-bold text-sm"
                            />
                          )}
                          {langTab === "en" ? (
                            <input
                              placeholder="Role (e.g. Senior Advisor)"
                              type="text"
                              value={formData.author_role}
                              onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none text-sm"
                            />
                          ) : (
                            <input
                              placeholder="Peran (mis. Penasihat Senior)"
                              type="text"
                              value={formData.author_role_id}
                              onChange={(e) => setFormData({ ...formData, author_role_id: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none text-sm"
                            />
                          )}
                        </div>
                        {langTab === "en" ? (
                          <textarea
                            placeholder="Short author bio for the bottom of the article..."
                            value={formData.author_bio}
                            onChange={(e) => setFormData({ ...formData, author_bio: e.target.value })}
                            rows={2}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none text-sm resize-none"
                          />
                        ) : (
                          <textarea
                            placeholder="Bio penulis singkat di bagian bawah artikel..."
                            value={formData.author_bio_id}
                            onChange={(e) => setFormData({ ...formData, author_bio_id: e.target.value })}
                            rows={2}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none text-sm resize-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Featured Image</label>
                  <div className="relative h-60 w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                    {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-300"><Camera size={32} /><span className="text-xs font-bold mt-2">Upload Cover Image (16:9)</span></div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Article Content</label>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <ReactQuill
                      theme="snow"
                      value={langTab === "en" ? formData.content : formData.content_id}
                      onChange={(val) =>
                        setFormData(
                          langTab === "en"
                            ? { ...formData, content: val }
                            : { ...formData, content_id: val }
                        )
                      }
                      modules={quillModules}
                      className="dark:text-white h-[350px] mb-10"
                    />
                  </div>
                </div>

                {/* TAGS (Optional) */}
                {formData.type === "INSIGHT" && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Hash size={14} /> Tags (Optional)
                    </label>
                    <input
                      type="text"
                      value={langTab === "en" ? formData.tags : formData.tags_id}
                      onChange={(e) =>
                        setFormData(
                          langTab === "en"
                            ? { ...formData, tags: e.target.value }
                            : { ...formData, tags_id: e.target.value }
                        )
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50 text-sm"
                      placeholder={langTab === "en" ? "e.g. Policy, Urban Governance, Tax (Separate with commas)" : "mis. Kebijakan, Tata Kelola Urban (pisahkan dengan koma)"}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 shrink-0 bg-white dark:bg-slate-900">
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving && <Loader className="animate-spin" size={20} />}
                    {saving ? "Saving..." : "Save Publication"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                Delete {itemToDelete.type === "post" ? "Publication" : "Category"}?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">&quot;{itemToDelete.name}&quot;</strong>? This action cannot be undone.
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