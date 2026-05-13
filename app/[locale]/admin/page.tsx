"use client";

<<<<<<< HEAD
import { motion, type Variants } from "framer-motion";
=======
import { motion } from "framer-motion";
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
import { FileText, CalendarDays, HeartHandshake, MessageSquareQuote, ArrowUpRight, ArrowDownRight, MapPin, Star, MoreHorizontal, Briefcase } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Articles", value: "48", change: "+4", isPositive: true, icon: FileText, gradient: "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10", shadow: "shadow-slate-500/20" },
    { label: "Upcoming Events", value: "12", change: "+2", isPositive: true, icon: CalendarDays, gradient: "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10", shadow: "shadow-slate-500/20" },
    { label: "Total Partners", value: "34", change: "+1", isPositive: true, icon: HeartHandshake, gradient: "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10", shadow: "shadow-slate-500/20" },
    { label: "Testimonials", value: "56", change: "+8", isPositive: true, icon: MessageSquareQuote, gradient: "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10", shadow: "shadow-slate-500/20" },
  ];

  const upcomingEvents = [
    { id: 1, title: "Global Tech Policy Summit", date: "Mar 15, 2027", location: "Geneva, CH" },
    { id: 2, title: "AI Ethics Roundtable", date: "Apr 05, 2027", location: "Online (Zoom)" },
    { id: 3, title: "Urban Development Forum", date: "May 12, 2027", location: "Jakarta, ID" },
  ];

  const recentReviews = [
    { id: 1, name: "TechCorp Global", rating: 5, quote: "Excellent strategic insights." },
    { id: 2, name: "EcoSolutions Inc.", rating: 5, quote: "Helped us navigate complex regulations." },
    { id: 3, name: "Urban Dev Org", rating: 4, quote: "Very professional and data-driven." },
  ];

<<<<<<< HEAD
  const containerVariants: Variants = {
=======
  const containerVariants = {
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

<<<<<<< HEAD
  const itemVariants: Variants = {
=======
  const itemVariants = {
>>>>>>> 622514ea99a46e985ffc8aaf4c13fc3f253752e0
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Premium Sticky Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold mb-3">
            <Briefcase size={16} />
            <span>Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="relative group rounded-3xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-3xl`} />
            
            <div className="flex items-center justify-between relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg ${stat.shadow} transform group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} strokeWidth={2} />
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stat.isPositive ? 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upcoming Events */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-6 md:p-8 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Upcoming Events</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Next scheduled activities</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-xl transition-all">
                <MoreHorizontal size={18} />
              </button>
            </div>
            
            <div className="space-y-4 flex-1">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{event.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><CalendarDays size={14} />{event.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-6 md:p-8 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Reviews</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Latest partner testimonials</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-xl transition-all">
                <MoreHorizontal size={18} />
              </button>
            </div>
            
            <div className="space-y-4 flex-1">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-900 dark:text-white">{review.name}</p>
                    <div className="flex text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{review.quote}"</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
    </motion.div>
  );
}
