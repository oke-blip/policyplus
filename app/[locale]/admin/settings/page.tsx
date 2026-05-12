"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Globe, LayoutTemplate, Image as ImageIcon, Loader, Type, Briefcase, AtSign, Camera, Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("global");

  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: "LinkedIn", url: "https://linkedin.com/company/policyplus" },
    { id: 2, platform: "Twitter", url: "" },
    { id: 3, platform: "Instagram", url: "https://instagram.com/policyplus" },
    { id: 4, platform: "Facebook", url: "" }
  ]);

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { id: Date.now(), platform: "", url: "" }]);
  };

  const removeSocialLink = (id: number) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const [heroBanners, setHeroBanners] = useState([
    { id: 1, image: "/images/hero-1.jpg" }
  ]);

  const addHeroBanner = () => {
    setHeroBanners([...heroBanners, { id: Date.now(), image: "" }]);
  };

  const removeHeroBanner = (id: number) => {
    setHeroBanners(heroBanners.filter(banner => banner.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">Manage global website configurations and homepage layout.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "global"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
        >
          <Globe size={16} />
          Global Settings
        </button>
        <button
          onClick={() => setActiveTab("homepage")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "homepage"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
        >
          <LayoutTemplate size={16} />
          Homepage Layout
        </button>
      </div>

      {/* Content Area */}
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">

        {activeTab === "global" && (
          <div className="space-y-10">
            {/* Header Settings */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Header & Branding</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure company logo and primary branding elements.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                  <input type="text" defaultValue="PolicyPlus" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Logo</label>
                    <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                      <ImageIcon size={24} className="mb-2 text-slate-400" />
                      <span className="text-sm font-medium">Upload logo</span>
                      <span className="text-xs mt-1">PNG, JPG (Max 2MB)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Favicon</label>
                    <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                      <ImageIcon size={24} className="mb-2 text-slate-400" />
                      <span className="text-sm font-medium">Upload favicon</span>
                      <span className="text-xs mt-1">ICO, PNG (32x32px)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Preloader Settings */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Loader size={20} className="text-slate-500" />
                  Preloader Configuration
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize the loading screen shown before the website fully loads.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Preloader Text (Greeting / Quote)</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" defaultValue="Empowering Policies for the Future..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This text appears after the percentage counter finishes.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Preloader Logo</label>
                  <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                    <ImageIcon size={24} className="mb-2 text-slate-400" />
                    <span className="text-sm font-medium">Upload preloader logo</span>
                    <span className="text-xs mt-1">We recommend using an icon-only logo</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Settings */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Global Footer</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Company address, contact info, and copyright.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input type="email" defaultValue="hello@policyplus.com" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input type="text" defaultValue="+62 812 3456 7890" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Office Address</label>
                  <textarea rows={3} defaultValue="Jakarta, Indonesia" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all resize-none" />
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Social Media Links</h3>
                    <button onClick={addSocialLink} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-all">
                      <Plus size={14} />
                      Add Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="flex items-center gap-3">
                        <div className="w-1/3 relative">
                          <select 
                            value={link.platform || ""} 
                            onChange={(e) => {
                              const newLinks = [...socialLinks];
                              const index = newLinks.findIndex(l => l.id === link.id);
                              newLinks[index].platform = e.target.value;
                              setSocialLinks(newLinks);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all text-sm appearance-none cursor-pointer" 
                          >
                            <option value="" disabled>Select Platform</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="YouTube">YouTube</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Other">Other / Website</option>
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="URL" 
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...socialLinks];
                              const index = newLinks.findIndex(l => l.id === link.id);
                              newLinks[index].url = e.target.value;
                              setSocialLinks(newLinks);
                            }}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all text-sm" 
                          />
                        </div>
                        <button onClick={() => removeSocialLink(link.id)} className="p-3 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/10 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "homepage" && (
          <div className="space-y-10">
            {/* Hero Section */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hero Section</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The first impression area at the top of the homepage.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Banner Images (Carousel)</label>
                    <button onClick={addHeroBanner} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-all">
                      <Plus size={14} />
                      Add Banner
                    </button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                    {heroBanners.map((banner, index) => (
                      <div key={banner.id} className="group relative w-48 shrink-0 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 snap-center">
                        {/* Placeholder for actual image */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                           <ImageIcon size={24} className="mb-1 opacity-50" />
                           <span className="text-[10px] uppercase font-bold tracking-wider">Banner {index + 1}</span>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => removeHeroBanner(banner.id)} className="p-1.5 bg-white/90 dark:bg-slate-900/90 text-rose-600 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add new placeholder */}
                    <div onClick={addHeroBanner} className="w-48 shrink-0 aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500 dark:text-slate-400 snap-center">
                      <Plus size={24} className="mb-1 text-slate-400" />
                      <span className="text-xs font-medium">Upload Image</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Recommended size: 1920x1080px. You can add multiple images to create a carousel.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input type="text" defaultValue="Shaping Policies, Transforming Futures." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all font-bold text-lg" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={3} defaultValue="We provide strategic insights and data-driven solutions to navigate complex regulatory landscapes." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Text</label>
                  <input type="text" defaultValue="Discover Our Expertise" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Link</label>
                  <input type="text" defaultValue="/expertise" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                </div>
              </div>
            </section>

            {/* Introduction Section */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Introduction Section</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Brief intro text and visual right below the hero.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Subtitle (Kicker)</label>
                  <input type="text" defaultValue="About Us" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all uppercase text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input type="text" defaultValue="Who We Are" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={4} defaultValue="PolicyPlus is a leading advisory firm..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all resize-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Accompanying Image</label>
                  <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
                    <ImageIcon size={24} className="mb-2 text-slate-400" />
                    <span className="text-sm font-medium">Upload introduction image</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Pre-Footer CTA */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pre-Footer CTA</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The final call to action before the website footer.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subtitle (Kicker)</label>
                  <input type="text" defaultValue="Ready to start?" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all uppercase text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input type="text" defaultValue="Let's build the future together." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Text</label>
                  <input type="text" defaultValue="Contact Us" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Link</label>
                  <input type="text" defaultValue="/contact" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500/50 outline-none transition-all" />
                </div>
              </div>
            </section>
          </div>
        )}

      </motion.div>

      {/* Save Button Container */}
      <motion.div variants={itemVariants} className="flex justify-end pt-4">
        <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
          <Save size={20} />
          Save Changes
        </button>
      </motion.div>
    </motion.div>
  );
}
