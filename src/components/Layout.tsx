import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.tsx';
import { Compass, Bookmark, MessageSquare, User, LogIn, LogOut, Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

export function Layout() {
  const { user, dbUser, signIn, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Compass, label: 'Explore' },
    { path: '/ask', icon: MessageSquare, label: 'Ask SEVA' },
    { path: '/saved', icon: Bookmark, label: 'Saved' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col font-sans text-neutral-900 selection:bg-orange-200">
      
      {/* Premium Top Bar (Clean, no nav links) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F4F4F5]/80 backdrop-blur-xl border-b border-neutral-200/50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              SEVA
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {dbUser?.role === 'ADMIN' && (
              <Link 
                to="/admin" 
                className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
            
            {user ? (
              <button
                onClick={signOut}
                className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={signIn}
                className="px-5 py-2 rounded-full bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Mobile Constrained for Premium App Feel */}
      <main className="flex-1 w-full max-w-3xl mx-auto pt-20 pb-32 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Universal Floating Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-50 pb-safe pointer-events-none">
        <div className="max-w-md mx-auto p-4 sm:pb-8">
          <nav className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-neutral-200/50 shadow-2xl shadow-neutral-900/5 rounded-3xl p-2 flex items-center justify-between">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/explore'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex-1 flex flex-col items-center justify-center py-2"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-neutral-100 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Icon className={cn("w-6 h-6", isActive ? "text-neutral-900" : "text-neutral-400")} />
                    <span className={cn("text-[10px] font-semibold tracking-wide", isActive ? "text-neutral-900" : "text-neutral-400")}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
