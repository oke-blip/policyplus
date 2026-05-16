"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, MapPin, ArrowRight, X, Loader2,
  CheckCircle2, UploadCloud,
  Banknote, ClipboardList, Info, ChevronLeft 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import {
  resolveCareersHeroContent,
  type CareersHeroLocaleFallbacks,
} from "@/lib/careers-hero-settings";
import { formatSalaryDisplay } from "@/lib/rupiah-format";

type JobPosting = {
  id: string; title: string; title_id?: string | null;
  department: string | null; department_id?: string | null;
  location: string | null; location_id?: string | null;
  type: string;
  salaryRange: string | null; salaryRange_id?: string | null;
  description: string; description_id?: string | null;
  requirements: string | null; requirements_id?: string | null;
  status: string;
};

type JobDisplay = JobPosting & {
  displayTitle: string;
  displayDepartment: string;
  displayLocation: string;
  displaySalary: string;
  displayDescription: string;
  displayRequirements: string;
};

function mapJobForDisplay(job: JobPosting, locale: ContentLocale): JobDisplay {
  const salaryRaw = pickLocalized(locale, job.salaryRange, job.salaryRange_id);
  return {
    ...job,
    displayTitle: pickLocalized(locale, job.title, job.title_id),
    displayDepartment: pickLocalized(locale, job.department, job.department_id),
    displayLocation: pickLocalized(locale, job.location, job.location_id),
    displaySalary: formatSalaryDisplay(salaryRaw) || salaryRaw,
    displayDescription: pickLocalized(locale, job.description, job.description_id),
    displayRequirements: pickLocalized(locale, job.requirements, job.requirements_id),
  };
}

export function CareersPage({
  initialHeroSettings,
}: {
  initialHeroSettings?: Record<string, unknown>;
} = {}) {
  const { t, locale } = useLanguage();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal Control
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [view, setView] = useState<"details" | "form">("details");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", linkedinUrl: "", coverLetter: "", cvFileUrl: "",
  });

  const displayJobs = useMemo(
    () => jobs.map((job) => mapJobForDisplay(job, locale)),
    [jobs, locale],
  );

  const selectedDisplay = useMemo(
    () => (selectedJob ? mapJobForDisplay(selectedJob, locale) : null),
    [selectedJob, locale],
  );

  const heroCopy = useMemo(() => {
    const fallbacks: CareersHeroLocaleFallbacks = {
      title: t("careers.heroTitle"),
      titleAccent: t("careers.heroTitleAccent"),
      subtitle: t("careers.heroSubtitle"),
    };
    return resolveCareersHeroContent(initialHeroSettings, locale, fallbacks);
  }, [initialHeroSettings, locale, t]);

  const jobTypeLabel = (type: string) => {
    const key = `careers.jobTypes.${type}`;
    const label = t<string>(key);
    return label === key ? type.replace(/_/g, " ") : label;
  };

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(`/api/jobs?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setJobs(data.filter((j: JobPosting) => j.status === "ACTIVE"));
        } else { setError(true); }
      } catch (err) { setError(true); } finally { setLoading(false); }
    }
    fetchJobs();
  }, []);

  const handleOpenModal = (job: JobPosting) => {
    setSelectedJob(job);
    setView("details");
    setFormData({ fullName: "", email: "", phone: "", linkedinUrl: "", coverLetter: "", cvFileUrl: "" });
    setMessage({ type: "", text: "" });
  };

  const handleCloseModal = () => setSelectedJob(null);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    try {
      setUploadingCv(true);
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/posts/upload-image?folder=cv`, { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.url) setFormData((prev) => ({ ...prev, cvFileUrl: data.url }));
    } catch (err) { setMessage({ type: "error", text: t("careers.uploadFailed") }); } 
    finally { setUploadingCv(false); }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cvFileUrl) {
        setMessage({ type: "error", text: t("careers.uploadCvFirst") });
        return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId: selectedJob?.id, ...formData }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: t("careers.applicationSent") });
        setTimeout(() => handleCloseModal(), 2500);
      }
    } catch (err) { setMessage({ type: "error", text: t("careers.submissionFailed") }); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <section className="relative min-h-svh w-full bg-[#050505] pt-28 pb-16 lg:pt-32 lg:pb-24">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white sm:text-6xl mb-6">{heroCopy.title} <span className="text-yellow-500">{heroCopy.titleAccent}</span></h1>
          <p className="text-xl text-gray-400">{heroCopy.subtitle}</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1,2].map(i => <div key={i} className="h-80 animate-pulse rounded-[2.5rem] bg-white/5" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {displayJobs.map((job) => (
              <article key={job.id} className="group flex flex-col justify-between rounded-[2.5rem] border border-white/5 bg-[#0a0a0c] p-10 transition-all hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/5">
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <span className="rounded-full bg-yellow-500/10 px-4 py-1.5 text-xs font-black text-yellow-500 uppercase tracking-widest border border-yellow-500/20">{job.displayDepartment}</span>
                    <span className="rounded-full bg-white/5 px-4 py-1.5 text-xs font-black text-gray-300 uppercase tracking-widest border border-white/10">{jobTypeLabel(job.type)}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white group-hover:text-yellow-500 transition-colors">{job.displayTitle}</h3>
                </div>
                <button onClick={() => handleOpenModal(job)} className="mt-10 inline-flex items-center gap-3 text-base font-bold text-white hover:text-yellow-500 transition-all">
                  {t("careers.viewDetails")} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedJob && selectedDisplay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative w-full max-w-4xl bg-[#0a0a0c] rounded-[3rem] border border-white/10 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
              
              {/* Header Modal - Premium Look */}
              <div className="p-8 sm:p-12 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                        {selectedDisplay.displayTitle}
                    </h2>
                    <div className="flex flex-wrap gap-6 mt-4 text-gray-400 font-medium">
                      <span className="flex items-center gap-2"><MapPin size={18} className="text-yellow-500"/> {selectedDisplay.displayLocation}</span>
                      <span className="flex items-center gap-2"><Banknote size={18} className="text-yellow-500"/> {selectedDisplay.displaySalary}</span>
                      <span className="flex items-center gap-2"><Briefcase size={18} className="text-yellow-500"/> {jobTypeLabel(selectedJob.type)}</span>
                    </div>
                  </div>
                  <button onClick={handleCloseModal} className="p-3 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
                </div>
              </div>

              {/* Body Modal */}
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar">
                {view === "details" ? (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <section>
                      <h4 className="flex items-center gap-3 text-yellow-500 font-black uppercase tracking-[0.2em] text-sm mb-6"><Info size={18}/> {t("careers.description")}</h4>
                      <div className="text-gray-300 text-lg leading-relaxed prose prose-invert prose-yellow max-w-none" 
                        dangerouslySetInnerHTML={{ __html: selectedDisplay.displayDescription }} 
                      />
                    </section>
                    <section>
                      <h4 className="flex items-center gap-3 text-yellow-500 font-black uppercase tracking-[0.2em] text-sm mb-6"><ClipboardList size={18}/> {t("careers.requirements")}</h4>
                      <div className="text-gray-300 text-lg leading-relaxed prose prose-invert prose-yellow max-w-none" 
                        dangerouslySetInnerHTML={{ __html: selectedDisplay.displayRequirements }} 
                      />
                    </section>
                  </div>
                ) : (
                  /* FORM PENDAFTARAN LENGKAP */
                  <form id="apply-form" onSubmit={handleSubmitApplication} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t("careers.fullName")} <span className="text-yellow-500">*</span></label>
                           <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-yellow-500/50 outline-none transition-all" placeholder={t("careers.placeholders.fullName")} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t("careers.emailAddress")} <span className="text-yellow-500">*</span></label>
                           <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-yellow-500/50 outline-none transition-all" placeholder={t("careers.placeholders.email")} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t("careers.phoneNumber")}</label>
                           <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-yellow-500/50 outline-none transition-all" placeholder={t("careers.placeholders.phone")} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t("careers.linkedinUrl")}</label>
                           <input type="url" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-yellow-500/50 outline-none transition-all" placeholder={t("careers.placeholders.linkedin")} value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t("careers.coverLetter")}</label>
                        <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-yellow-500/50 outline-none transition-all resize-none" placeholder={t("careers.placeholders.coverLetter")} value={formData.coverLetter} onChange={e => setFormData({...formData, coverLetter: e.target.value})} />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t("careers.uploadCv")} <span className="text-yellow-500">*</span></label>
                        <div className={`relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${formData.cvFileUrl ? "border-emerald-500/40 bg-emerald-500/[0.03]" : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-yellow-500/30"}`}>
                           <input required={!formData.cvFileUrl} type="file" accept=".pdf" onChange={handleCvUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                           {uploadingCv ? (
                               <div className="flex flex-col items-center text-yellow-500 gap-3">
                                   <Loader2 className="animate-spin" size={40} />
                                   <span className="font-bold">{t("careers.uploading")}</span>
                               </div>
                           ) : formData.cvFileUrl ? (
                               <div className="flex flex-col items-center text-emerald-400 gap-3">
                                   <CheckCircle2 size={40} />
                                   <span className="font-bold text-lg">{t("careers.cvAttached")}</span>
                                   <span className="text-xs text-gray-500">{t("careers.clickToReplace")}</span>
                               </div>
                           ) : (
                               <div className="flex flex-col items-center text-gray-400 gap-3">
                                   <UploadCloud size={40} className="opacity-50" />
                                   <span className="font-bold text-white">{t("careers.dropCv")}</span>
                                   <span className="text-xs uppercase tracking-tighter">{t("careers.pdfOnly")}</span>
                               </div>
                           )}
                        </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Footer Modal - Persistent Button */}
              <div className="p-8 sm:p-12 border-t border-white/5 bg-white/[0.01] shrink-0">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl text-center font-bold text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {message.text}
                    </div>
                )}

                {view === "details" ? (
                  <button onClick={() => setView("form")} className="w-full py-6 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-3xl transition-all shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-3">
                    {t("careers.applyForPosition")} <ArrowRight size={24}/>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setView("details")} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
                        <ChevronLeft size={20}/> {t("careers.backToDetails")}
                    </button>
                    <button form="apply-form" type="submit" disabled={isSubmitting || uploadingCv} className="flex-[2] py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : t("careers.submitApplication")}
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
