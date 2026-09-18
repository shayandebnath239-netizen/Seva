import { Search, ChevronRight, GraduationCap, Building, HeartPulse, Tractor, Info, Sparkles, BookOpen, Briefcase, Coins, PiggyBank } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext.tsx';

const categories = [
  { id: 1, name: 'Agriculture', icon: Tractor, color: 'bg-[#E8F5E9] text-[#2E7D32]' },
  { id: 2, name: 'Healthcare', icon: HeartPulse, color: 'bg-[#FFEBEE] text-[#C62828]' },
  { id: 3, name: 'Housing', icon: Building, color: 'bg-[#E3F2FD] text-[#1565C0]' },
  { id: 4, name: 'Education', icon: GraduationCap, color: 'bg-[#F3E5F5] text-[#6A1B9A]' },
  { id: 5, name: 'Finance', icon: Coins, color: 'bg-[#FFF8E1] text-[#F57F17]' },
  { id: 6, name: 'Welfare', icon: PiggyBank, color: 'bg-[#E0F2F1] text-[#00695C]' },
];

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Header Section */}
      <section className="space-y-2 mt-4">
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="text-neutral-500 font-medium tracking-wide uppercase text-xs"
        >
          {user ? 'Welcome Back' : 'Independent Platform'}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
          className="text-4xl font-bold tracking-tight text-neutral-900 leading-tight"
        >
          Discover<br/>Schemes.
        </motion.h1>
      </section>

      {/* Fake Search Bar leading to Explore */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        onClick={() => navigate('/explore')}
        className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-neutral-200/60 cursor-pointer active:scale-95 transition-transform"
      >
        <Search className="w-5 h-5 text-neutral-400" />
        <span className="text-neutral-400 font-medium">Search for "PM Kisan"...</span>
      </motion.div>

      {/* AI Assistant Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="w-full relative overflow-hidden rounded-3xl bg-neutral-900 p-6 flex flex-col justify-between min-h-[160px] shadow-lg shadow-neutral-900/10"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/30 to-amber-500/0 rounded-full blur-2xl -translate-y-8 translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-orange-200">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Guide</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">Ask SEVA<br/>anything.</h2>
        </div>
        
        <Link to="/ask" className="relative z-10 mt-6 inline-flex w-fit items-center gap-2 bg-white text-neutral-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-100 transition-colors">
          Start Chat <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Categories Grid (Bento) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Categories</h2>
          <Link to="/explore" className="text-sm font-semibold text-orange-600">See All</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (idx * 0.05) }}
                onClick={() => navigate('/explore')}
                className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-3 active:scale-95 transition-transform cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-neutral-800 text-sm">{cat.name}</span>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Popular/Featured */}
      <section className="space-y-4 mt-4">
        <h2 className="text-lg font-bold text-neutral-900">Recommended</h2>
        <div className="flex flex-col gap-3">
          {[
            { title: 'PM Kisan Samman Nidhi', subtitle: 'Agriculture • Central', icon: Tractor },
            { title: 'Ayushman Bharat', subtitle: 'Healthcare • Central', icon: HeartPulse },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              onClick={() => navigate('/explore')}
              className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mt-8 flex items-start gap-3 p-4 bg-neutral-200/50 rounded-2xl">
        <Info className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-neutral-500 leading-relaxed">
          SEVA is an independent platform and not affiliated with the Government of India. Always verify details on official government portals.
        </p>
      </div>

    </div>
  );
}
