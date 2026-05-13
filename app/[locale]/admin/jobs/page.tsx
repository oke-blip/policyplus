"use client";

import { useState } from "react";
<<<<<<< HEAD
import { motion, AnimatePresence, type Variants } from "framer-motion";
=======
import { motion, AnimatePresence } from "framer-motion";
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
import { BriefcaseBusiness, Plus, Search, Filter, Edit2, Trash2, MapPin, DollarSign, Calendar, Users, Building, AlertCircle, Save } from "lucide-react";

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("listings"); // listings, create

<<<<<<< HEAD
  const containerVariants: Variants = {
=======
  const containerVariants = {
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

<<<<<<< HEAD
  const itemVariants: Variants = {
=======
  const itemVariants = {
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const mockJobs = [
    { id: 1, title: "Senior Policy Analyst", department: "Research", type: "Full-Time", location: "Jakarta, Indonesia", status: "Active", applicants: 12, deadline: "Dec 31, 2026" },
    { id: 2, title: "Legal Consultant", department: "Legal", type: "Contract", location: "Remote", status: "Closed", applicants: 45, deadline: "Nov 15, 2026" },
    { id: 3, title: "Public Relations Manager", department: "Marketing", type: "Full-Time", location: "Hybrid", status: "Draft", applicants: 0, deadline: "Jan 10, 2027" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
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
            onClick={() => setActiveTab("create")}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Create Job Posting
          </button>
        )}
      </div>

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
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "create"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Plus size={16} />
          Create New Job
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full sm:w-96 group">
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-xl blur-md opacity-0 group-focus-within:opacity-50 transition-opacity" />
                  <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                    <div className="pl-4 text-slate-400"><Search size={18} /></div>
                    <input 
                      type="text" 
                      placeholder="Search jobs by title or department..." 
                      className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl focus:ring-2 focus:ring-slate-500/20 px-4 py-3 outline-none cursor-pointer shadow-sm">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Closed</option>
                    <option>Draft</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
                    <Filter size={16} />
                    Filters
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
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
                    {mockJobs.map((job) => (
                      <tr key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <BriefcaseBusiness size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{job.title}</p>
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
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-xs">
                              {job.applicants}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">candidates</span>
                          </div>
                        </td>
                        <td className="py-5 pl-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5" title="Edit"><Edit2 size={16} /></button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  
                  <section className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Job Information</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Core details about the position being offered.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Title <span className="text-rose-500">*</span></label>
                        <input type="text" placeholder="e.g. Senior Policy Analyst" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all font-bold" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Department</label>
                          <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all appearance-none cursor-pointer">
                              <option>Research & Development</option>
                              <option>Legal & Compliance</option>
                              <option>Marketing</option>
                              <option>Administration</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Employment Type</label>
                          <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all appearance-none cursor-pointer">
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
                            <input type="text" placeholder="e.g. Jakarta, Remote, Hybrid" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Salary Range (Optional)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="e.g. IDR 10M - 15M (or Negotiable)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
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
                        <textarea rows={5} placeholder="Describe the day-to-day responsibilities, team structure, and overall goal of this position..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Requirements & Qualifications</label>
                        <textarea rows={5} placeholder="List required skills, education, years of experience, etc..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all resize-none" />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column - Meta Settings */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Publishing Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
                        <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all appearance-none cursor-pointer">
                          <option value="draft">Save as Draft</option>
                          <option value="active">Active (Published)</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Application Deadline</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input type="date" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl p-5 flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      Publishing a job will immediately make it visible on your main website's Career page. Candidates will be able to submit their applications which you can review later.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Save Button Container (Only on create tab) */}
      <AnimatePresence>
        {activeTab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-end pt-4"
          >
            <div className="flex gap-3">
              <button onClick={() => setActiveTab("listings")} className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold rounded-xl transition-all">
                Cancel
              </button>
              <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
                <Save size={20} />
                Save Job Posting
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
