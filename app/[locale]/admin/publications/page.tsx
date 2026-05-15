"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { BookOpen, Newspaper, Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, X, Loader, Camera, Save, CheckCircle2, AlertCircle, User, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function PublicationsPage() {
  const [activeTab, setActiveTab] = useState("insights"); // insights, knowledge, categories
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    status: "PUBLISHED",
    type: "INSIGHT",
    category: "",
    author_name: "",
    author_image: ""
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
  const [editingCategory, setEditingCategory] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/posts?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) { }
  };

  const handleSaveCategory = async () => {
    if (!newCatName) return;
    try {
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory ? { id: editingCategory.id, name: newCatName } : { name: newCatName };

      const res = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNewCatName("");
        setEditingCategory(null);
        fetchCategories();
        setMessage({ type: "success", text: editingCategory ? "Category updated!" : "Category added!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 2000);
      }
    } catch (error) { }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete category?")) return;
    try {
      await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (error) { }
  };

  const handleOpenModal = (post: any = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        image_url: post.image_url || "",
        status: post.status,
        type: post.type || "INSIGHT",
        category: post.category || "",
        author_name: post.author_name || "",
        author_image: post.author_image || ""
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        image_url: "",
        status: "PUBLISHED",
        type: activeTab === "knowledge" ? "KNOWLEDGE" : "INSIGHT",
        category: "",
        author_name: "",
        author_image: ""
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const method = editingPost ? "PUT" : "POST";
      const body = editingPost ? { id: editingPost.id, ...formData } : formData;

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
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error saving post" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Deleted successfully!" });
        fetchPosts();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error deleting" });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAuthorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, author_image: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (activeTab === "insights") return p.type === "INSIGHT";
    if (activeTab === "knowledge") return p.type === "KNOWLEDGE";
    return false;
  });

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
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Sustainability, Governance..."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50"
                />
              </div>
              <button
                onClick={handleSaveCategory}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95"
              >
                {editingCategory ? "Update Category" : "Add Category"}
              </button>
              {editingCategory && (
                <button
                  onClick={() => { setEditingCategory(null); setNewCatName(""); }}
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
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">No categories found. Add one above!</td>
                  </tr>
                ) : (
                  categories.map(cat => (
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
                          <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
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
            <motion.div key={post.id} variants={itemVariants} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
              <div className="aspect-video w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {post.image_url ? <img src={post.image_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-400"><Camera size={24} /></div>}
                {post.category && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white">{post.category}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-6">{post.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.status}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(post)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-white/5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{editingPost ? "Edit Post" : "Create Post"}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
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
                  {formData.type === "KNOWLEDGE" && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Filter size={14} /> Knowledge Category
                      </label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none font-bold">
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Publisher Profile Section - Only for Insights */}
                {formData.type === "INSIGHT" && (
                  <div className="space-y-4 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User size={14} /> Publisher Profile
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative h-20 w-20 shrink-0 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden group">
                        <input type="file" accept="image/*" onChange={handleAuthorImageUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                        {formData.author_image ? <img src={formData.author_image} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-300"><Camera size={20} /></div>}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          placeholder="Publisher Name (e.g. Dr. Anisa Wijaya)"
                          type="text"
                          value={formData.author_name}
                          onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none font-bold"
                        />
                        <p className="text-[10px] text-slate-400">This will be displayed as the article author on the landing page.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500/50 font-bold text-lg" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Main Content</label>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 min-h-[300px]">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(val) => setFormData({ ...formData, content: val })}
                      modules={quillModules}
                      className="dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Featured Image</label>
                  <div className="relative h-60 w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                    {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-300"><Camera size={32} /><span className="text-xs font-bold mt-2">Upload Header Image</span></div>}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                    {saving && <Loader className="animate-spin" size={20} />}
                    {saving ? "Saving..." : "Save Publication"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
