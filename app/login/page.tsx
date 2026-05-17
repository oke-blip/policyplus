"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] dark:bg-[#030712] flex items-center justify-center p-4 font-sans selection:bg-slate-500/30 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-slate-300/20 dark:bg-slate-800/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-slate-400/20 dark:bg-slate-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-500/5 dark:shadow-none relative overflow-hidden">
          {/* Inner glow effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent" />
          
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl mb-6"
            >
              <Sparkles size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Sign in to manage Policy+
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-2xl blur opacity-0 group-focus-within:opacity-50 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl px-4 py-4 transition-all duration-300 focus-within:border-slate-400 dark:focus-within:border-white/20">
                  <User size={18} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-2xl blur opacity-0 group-focus-within:opacity-50 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl px-4 py-4 transition-all duration-300 focus-within:border-slate-400 dark:focus-within:border-white/20">
                  <Lock size={18} className="text-slate-400 mr-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold shadow-lg shadow-slate-900/10 dark:shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link 
              href="/"
              className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 dark:text-slate-600 text-xs font-medium uppercase tracking-widest">
          Secured by Policy+ Shield
        </p>
      </motion.div>
    </div>
  );
}
