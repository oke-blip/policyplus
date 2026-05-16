"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { BriefcaseBusiness, Plus, Search, Edit2, Trash2, MapPin, Calendar, Building, AlertCircle, Save, Users, X, Download, FileText, Loader2, Phone, ExternalLink } from "lucide-react";
import { IndonesianRupiah } from "@/components/icons/indonesian-rupiah";
import { jobApplicationStatusToLabel, jobStatusToFormValue, jobStatusToLabel, jobTypeToLabel } from "@/lib/jobs";
import { formatRupiahInput, parseRupiahToPlain } from "@/lib/rupiah-format";
import { AdminLangTabs, type AdminLangTab } from "@/components/admin/AdminLangTabs";
import {
  applySmartFallback,
  SMART_FALLBACK_JOB_FIELD_PAIRS,
} from "@/lib/cms-smart-fallback";
import type { JobApplicationStatus } from "@/app/generated/prisma";

type JobRecord = {
  id: string;
  title: string;
  title_id?: string | null;
  department: string | null;
  department_id?: string | null;
  location: string | null;
  location_id?: string | null;
  type: string;
  salaryRange: string | null;
  salaryRange_id?: string | null;
  description: string;
  description_id?: string | null;
  requirements: string | null;
  requirements_id?: string | null;
  status: string;
  applicationDeadline: string | null;
  applicants: number;
  createdAt: string;
  _raw?: JobRecord;
};

type ApplicantRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  cvFileUrl: string;
  status: JobApplicationStatus;
  createdAt: string;
};

const emptyForm = {
  title: "",
  title_id: "",
  department: "",
  department_id: "",
  employmentType: "Full-Time",
  location: "",
  location_id: "",
  salaryRange: "",
  salaryRange_id: "",
  description: "",
  description_id: "",
  requirements: "",
  requirements_id: "",
  status: "draft",
  applicationDeadline: "",
};

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all";

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("listings");
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRecord | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [langTab, setLangTab] = useState<AdminLangTab>("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [message, setMessage] = useState({ type: "", text: "" });

  // State untuk fitur View Applicants
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState<JobRecord | null>(null);
  const [applicantsList, setApplicantsList] = useState<ApplicantRecord[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantsError, setApplicantsError] = useState("");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs?t=" + Date.now());
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openApplicantsModal = async (job: JobRecord) => {
    setViewingApplicantsJob(job);
    setLoadingApplicants(true);
    setApplicantsList([]);
    setApplicantsError("");
    try {
      const res = await fetch(
        `/api/job-applications?jobPostingId=${encodeURIComponent(job.id)}&t=${Date.now()}`
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        setApplicantsError(err.message || "Failed to load applicants.");
        return;
      }
      const data = (await res.json()) as ApplicantRecord[];
      setApplicantsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setApplicantsError("Failed to load applicants. Please try again.");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const closeApplicantsModal = () => {
    setViewingApplicantsJob(null);
    setApplicantsList([]);
    setApplicantsError("");
  };

  const applicantStatusClass = (status: JobApplicationStatus) => {
    switch (status) {
      case "REVIEWED":
        return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
      case "HIRED":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "REJECTED":
        return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
      default:
        return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const statusLabel = jobStatusToLabel(job.status as "DRAFT" | "ACTIVE" | "CLOSED");
      const matchesStatus =
        statusFilter === "All Status" || statusLabel === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        (job.department ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, searchQuery, statusFilter]);

  const formatDeadline = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const openCreate = () => {
    setEditingJob(null);
    setLangTab("id");
    setFormData(emptyForm);
    setActiveTab("create");
  };

  const openEdit = (job: JobRecord) => {
    setEditingJob(job);
    setLangTab("id");
    setFormData({
      title: job.title,
      title_id: job.title_id ?? "",
      department: job.department ?? "",
      department_id: job.department_id ?? "",
      employmentType: jobTypeToLabel(job.type as "FULL_TIME"),
      location: job.location ?? "",
      location_id: job.location_id ?? "",
      salaryRange: job.salaryRange ? formatRupiahInput(job.salaryRange) : "",
      salaryRange_id: job.salaryRange_id ? formatRupiahInput(job.salaryRange_id) : "",
      description: job.description,
      description_id: job.description_id ?? "",
      requirements: job.requirements ?? "",
      requirements_id: job.requirements_id ?? "",
      status: jobStatusToFormValue(job.status as "DRAFT" | "ACTIVE" | "CLOSED"),
      applicationDeadline: job.applicationDeadline
        ? job.applicationDeadline.slice(0, 10)
        : "",
    });
    setActiveTab("create");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editingJob ? "PUT" : "POST";
      const payload = applySmartFallback(
        {
          ...formData,
          salaryRange: parseRupiahToPlain(formData.salaryRange) || "",
          salaryRange_id: parseRupiahToPlain(formData.salaryRange_id) || "",
          type: formData.employmentType,
        },
        SMART_FALLBACK_JOB_FIELD_PAIRS,
      );
      if (!String(payload.title ?? "").trim()) {
        setMessage({ type: "error", text: "Job title is required." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return;
      }
      const body = editingJob ? { id: editingJob.id, ...payload } : payload;

      const res = await fetch("/api/jobs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Job ${editingJob ? "updated" : "created"} successfully!`,
        });
        setEditingJob(null);
        setFormData(emptyForm);
        setActiveTab("listings");
        fetchJobs();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save job posting." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const res = await fetch(`/api/jobs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Job deleted successfully!" });
        fetchJobs();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to delete job." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete job." });
    }
  };

  const displayJobs = filteredJobs.map((job) => ({
    id: job.id,
    title: job.title,
    department: job.department ?? "—",
    type: jobTypeToLabel(job.type as "FULL_TIME"),
    location: job.location ?? "—",
    status: jobStatusToLabel(job.status as "DRAFT" | "ACTIVE" | "CLOSED"),
    applicants: job.applicants,
    deadline: formatDeadline(job.applicationDeadline),
    _raw: job,
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold mb-3">
            <BriefcaseBusiness size={16} />
            <span>Careers Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Job Postings</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Manage your company's career opportunities, review applicants, and publish new vacancies.
          </p>
        </div>
        {activeTab === "listings" && (
          <button 
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Create Job Posting
          </button>
        )}
      </div>

      {message.text && activeTab === "listings" && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-bold shadow-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl w-fit backdrop-blur-md shadow-sm">
        <button
          onClick={() => setActiveTab("listings")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "listings"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <BriefcaseBusiness size={16} />
          Active Listings
        </button>
        <button
          onClick={openCreate}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "create"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Plus size={16} />
          {editingJob ? "Edit Job" : "Create New Job"}
        </button>
      </div>

      {/* Content Area */}
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* TAB: JOB LISTINGS */}
          {activeTab === "listings" && (
            <motion.div
              key="listings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Toolbar */}
              <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full xl:w-96 group">
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-xl blur-md opacity-0 group-focus-within:opacity-50 transition-opacity" />
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                    <div className="pl-4 text-slate-400"><Search size={18} /></div>
                    <input 
                      type="text" 
                      placeholder="Search jobs by title or department..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full xl:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl focus:ring-2 focus:ring-slate-500/20 px-4 py-3 outline-none cursor-pointer shadow-sm w-full sm:w-auto appearance-none"
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Closed</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto hide-scrollbar">
                {loading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-12 text-center">Loading job postings...</p>
                ) : displayJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                    <BriefcaseBusiness size={40} className="text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No job postings found.</p>
                  </div>
                ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Job Title & Info</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Department</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Status</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Applicants</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {displayJobs.map((job) => (
                      <tr key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <BriefcaseBusiness size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors cursor-pointer" onClick={() => openEdit(job._raw)}>
                                {job.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                  {job.type}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <MapPin size={12} /> {job.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{job.department}</span>
                        </td>
                        <td className="py-5 px-4">
                          {job.status === 'Active' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>}
                          {job.status === 'Closed' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Closed</span>}
                          {job.status === 'Draft' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Draft</span>}
                        </td>
                        <td className="py-5 px-4">
                          <button 
                            onClick={() => openApplicantsModal(job._raw)}
                            className="flex items-center gap-2 group/btn cursor-pointer"
                            title="View Applicants"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-xs group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-colors shadow-sm">
                              {job.applicants}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white transition-colors underline decoration-dashed decoration-slate-300 dark:decoration-slate-700 underline-offset-4">
                              view
                            </span>
                          </button>
                        </td>
                        <td className="py-5 pl-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openApplicantsModal(job._raw)} className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5" title="View Applicants"><Users size={16} /></button>
                            <button onClick={() => openEdit(job._raw)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5" title="Edit Job"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(job.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5" title="Delete Job"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: CREATE NEW JOB */}
          {activeTab === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  
                  <section className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Job Information</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Core details about the position being offered.</p>
                      </div>
                      <AdminLangTabs value={langTab} onChange={setLangTab} />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Title <span className="text-rose-500">*</span></label>
                        {langTab === "en" ? (
                          <input
                            type="text"
                            placeholder="e.g. Senior Policy Analyst"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`${inputClass} font-bold text-lg`}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="mis. Analis Kebijakan Senior"
                            value={formData.title_id}
                            onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                            className={`${inputClass} font-bold text-lg`}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Department</label>
                          <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              type="text"
                              placeholder={langTab === "en" ? "e.g. Research & Development" : "mis. Riset & Pengembangan"}
                              value={langTab === "en" ? formData.department : formData.department_id}
                              onChange={(e) =>
                                setFormData(
                                  langTab === "en"
                                    ? { ...formData, department: e.target.value }
                                    : { ...formData, department_id: e.target.value }
                                )
                              }
                              className={`${inputClass} pl-11`}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Employment Type</label>
                          <select
                            value={formData.employmentType}
                            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                            className={`${inputClass} appearance-none cursor-pointer`}
                          >
                            <option>Full-Time</option>
                            <option>Part-Time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              type="text"
                              placeholder={langTab === "en" ? "e.g. Jakarta, Remote, Hybrid" : "mis. Jakarta, Remote, Hybrid"}
                              value={langTab === "en" ? formData.location : formData.location_id}
                              onChange={(e) =>
                                setFormData(
                                  langTab === "en"
                                    ? { ...formData, location: e.target.value }
                                    : { ...formData, location_id: e.target.value }
                                )
                              }
                              className={`${inputClass} pl-11`}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Salary Range (Optional)</label>
                          <div className="relative">
                            <IndonesianRupiah className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder={
                                langTab === "en"
                                  ? "e.g. Rp 10.000.000 - 15.000.000 or Negotiable"
                                  : "mis. Rp 10.000.000 - 15.000.000 atau Negosiasi"
                              }
                              value={langTab === "en" ? formData.salaryRange : formData.salaryRange_id}
                              onChange={(e) => {
                                const formatted = formatRupiahInput(e.target.value);
                                setFormData(
                                  langTab === "en"
                                    ? { ...formData, salaryRange: formatted }
                                    : { ...formData, salaryRange_id: formatted }
                                );
                              }}
                              className={`${inputClass} pl-11`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Job Description & Requirements</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed text for the candidate.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Description</label>
                        <textarea
                          rows={6}
                          placeholder={
                            langTab === "en"
                              ? "Describe the day-to-day responsibilities, team structure, and overall goal of this position..."
                              : "Jelaskan tanggung jawab harian, struktur tim, dan tujuan posisi ini..."
                          }
                          value={langTab === "en" ? formData.description : formData.description_id}
                          onChange={(e) =>
                            setFormData(
                              langTab === "en"
                                ? { ...formData, description: e.target.value }
                                : { ...formData, description_id: e.target.value }
                            )
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Requirements & Qualifications</label>
                        <textarea
                          rows={6}
                          placeholder={
                            langTab === "en"
                              ? "List required skills, education, years of experience, etc..."
                              : "Daftar keahlian, pendidikan, pengalaman, dll..."
                          }
                          value={langTab === "en" ? formData.requirements : formData.requirements_id}
                          onChange={(e) =>
                            setFormData(
                              langTab === "en"
                                ? { ...formData, requirements: e.target.value }
                                : { ...formData, requirements_id: e.target.value }
                            )
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column - Meta Settings */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><BriefcaseBusiness size={18}/> Publishing Settings</h3>
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className={`${inputClass} appearance-none cursor-pointer bg-slate-50 dark:bg-black font-bold`}
                        >
                          <option value="draft">Draft (Hidden)</option>
                          <option value="active">Active (Published)</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Application Deadline</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="date"
                            value={formData.applicationDeadline}
                            onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                            className={`${inputClass} pl-11 bg-slate-50 dark:bg-black`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-3xl p-6 flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                      Publishing a job will immediately make it visible on your main website's Career page. Candidates will be able to submit their applications which you can review later.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* STICKY BOTTOM SAVE BAR (Only on Create Tab) */}
      <AnimatePresence>
        {activeTab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex pointer-events-none justify-end md:bottom-8 md:right-8 lg:right-10"
          >
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/90 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0c]/90">
               {message.text && (
                <div className={`px-4 py-2 rounded-xl text-sm font-bold hidden sm:block ${message.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}>
                  {message.text}
                </div>
               )}
               <button onClick={() => { setActiveTab("listings"); setEditingJob(null); setFormData(emptyForm); setMessage({type: "", text:""}); }} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold rounded-xl transition-all">
                Cancel
               </button>
               <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 sm:px-8 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60">
                <Save size={18} />
                <span className="hidden sm:inline">{saving ? "Saving..." : editingJob ? "Update Job" : "Save Job"}</span>
                <span className="sm:hidden">{saving ? "..." : "Save"}</span>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APPLICANTS MODAL DRAWER */}
      <AnimatePresence>
        {viewingApplicantsJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeApplicantsModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="text-yellow-600" size={24} /> Applicants
                  </h2>
                  <p className="text-sm font-bold text-slate-500 mt-1">
                    Job: <span className="text-slate-700 dark:text-slate-300">{viewingApplicantsJob.title}</span>
                    {!loadingApplicants && !applicantsError && (
                      <span className="text-slate-400 font-medium"> · {applicantsList.length} pelamar</span>
                    )}
                  </p>
                </div>
                <button onClick={closeApplicantsModal} className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all hover:scale-105"><X size={20} /></button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#0a0a0c]">
                {loadingApplicants ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-slate-300 dark:text-slate-600 mb-4" size={40} />
                    <p className="text-sm font-bold text-slate-500">Loading applicants...</p>
                  </div>
                ) : applicantsError ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle size={40} className="text-rose-500 mb-4" />
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{applicantsError}</p>
                    <button
                      type="button"
                      onClick={() => openApplicantsModal(viewingApplicantsJob)}
                      className="mt-4 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                ) : applicantsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                    <FileText size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Belum ada pelamar</p>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm">When candidates apply for this position, their resumes and contact details will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {applicantsList.map((app, idx) => (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white">{app.fullName}</p>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${applicantStatusClass(app.status)}`}>
                                {jobApplicationStatusToLabel(app.status)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{app.email}</p>
                            {app.phone && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                <Phone size={14} className="shrink-0" />
                                {app.phone}
                              </p>
                            )}
                            {app.linkedinUrl && (
                              <a
                                href={app.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 hover:underline"
                              >
                                <ExternalLink size={14} />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:ml-auto">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-400 uppercase">Applied</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDeadline(app.createdAt)}</p>
                          </div>
                          <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                          <a href={app.cvFileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm w-full sm:w-auto justify-center">
                            <Download size={16} /> CV / Resume
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}