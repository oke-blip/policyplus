"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  HeartHandshake,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  Sparkles,
  BriefcaseBusiness,
  UsersRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Publications", href: "/admin/publications", icon: FileText },
  { name: "Events", href: "/admin/events", icon: CalendarDays },
  { name: "Job Postings", href: "/admin/jobs", icon: BriefcaseBusiness },
  { name: "Partners & Reviews", href: "/admin/partners", icon: HeartHandshake },
  { name: "Teams", href: "/admin/teams", icon: UsersRound },
  { name: "Setting Compro", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.username) setUsername(data.username);
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => {
    return pathname.includes(href) && (href !== "/admin" || pathname.endsWith("/admin"));
  };

  return (
    <div className="h-screen bg-[#F8F9FE] dark:bg-[#030712] flex flex-col md:flex-row font-sans selection:bg-slate-500/30 overflow-hidden relative transition-colors duration-500">

      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-slate-300/20 dark:bg-slate-800/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-400/20 dark:bg-slate-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white/60 dark:bg-white/5 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
            <Sparkles size={16} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
            Policy+
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl backdrop-blur-md transition-all shadow-sm border border-slate-200/50 dark:border-white/5"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl backdrop-blur-md transition-all shadow-sm border border-slate-200/50 dark:border-white/5"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || typeof window === 'undefined' || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className={`
              fixed md:relative top-0 left-0 z-40 
              w-72 h-screen flex flex-col
              ${isMobileMenuOpen ? "block" : "hidden md:flex"}
            `}
          >
            <div className="h-full m-0 md:my-4 md:ml-4 bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl border-r md:border border-slate-200/50 dark:border-white/5 md:rounded-3xl flex flex-col shadow-2xl shadow-slate-500/5 dark:shadow-none overflow-hidden relative">

              {/* Inner sidebar glow */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-200/50 to-transparent dark:from-slate-800/20 pointer-events-none" />

              <div className="p-8 flex items-center gap-3 font-bold text-2xl tracking-tight z-10">
                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
                  <Sparkles size={20} />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
                  Policy+
                </span>
              </div>

              <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto z-10 custom-scrollbar">
                <div className="text-xs font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-widest mb-6 px-4 mt-4 md:mt-0">Overview</div>
                {sidebarLinks.map((link) => {
                  const currentLocale = pathname.split('/')[1] || 'en';
                  const localizedHref = `/${currentLocale}${link.href}`;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={localizedHref}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group"
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 bg-white dark:bg-white/10 rounded-2xl shadow-sm border border-slate-200/50 dark:border-white/5"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-xl transition-transform duration-300 group-hover:scale-110 ${active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        <link.icon size={16} strokeWidth={active ? 2.5 : 2} />
                      </div>
                      <span className={`relative z-10 font-medium transition-colors ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 z-10 space-y-2">
                {username && (
                  <p className="px-4 py-2 text-sm font-bold text-slate-900 dark:text-white truncate">
                    {username}
                  </p>
                )}
                <button 
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    const currentLocale = pathname.split('/')[1] || 'en';
                    window.location.href = `/${currentLocale}/login`;
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl font-bold transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header */}
        <header className="h-24 hidden md:flex items-center justify-between px-10">
          <div className="relative group w-96">
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-2xl blur opacity-0 group-focus-within:opacity-50 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-1">
              <div className="pl-4 pr-2 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search resources, posts, or applications..."
                className="w-full py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              <div className="px-3 py-1 mr-1 bg-slate-100 dark:bg-white/10 rounded-lg text-xs font-medium text-slate-400 dark:text-slate-500">
                ⌘
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative p-3 text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl backdrop-blur-xl border border-slate-200/50 dark:border-white/10 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            {/* <button className="relative p-3 text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl backdrop-blur-xl border border-slate-200/50 dark:border-white/10 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-slate-900 dark:bg-white rounded-full border-2 border-white dark:border-[#0f172a]"></span>
            </button> */}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-6 pb-6 md:px-10 md:pb-10 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
