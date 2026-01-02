import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bell, User, LayoutGrid, History, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardNavbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 md:px-6 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* LEFT: Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold text-zinc-900 text-lg hidden md:block">MifimnPay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
            <Link 
              href="/dashboard" 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/dashboard') 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
              }`}
            >
              <LayoutGrid size={16} /> Overview
            </Link>

            <Link 
              href="/history" 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/history') 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
              }`}
            >
              <History size={16} /> History
            </Link>

             <Link 
              href="/settings" 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/settings') 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
              }`}
            >
              <Settings size={16} /> Settings
            </Link>
          </div>
        </div>

        {/* RIGHT: User Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <div className="h-6 w-[1px] bg-zinc-200 hidden md:block"></div>

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 pl-2 md:pl-0 focus:outline-none"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-zinc-900">Mama Tunde</p>
                <p className="text-[10px] text-zinc-500">Free Plan</p>
              </div>
              <div className={`w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center border transition-all ${isMenuOpen ? 'border-zinc-900 text-zinc-900' : 'border-zinc-200 text-zinc-400'}`}>
                <User size={18} />
              </div>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden"
                  >
                     <div className="md:hidden px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                        <p className="text-sm font-bold text-zinc-900">Mama Tunde</p>
                        <p className="text-xs text-zinc-500">Free Plan</p>
                     </div>

                     <div className="md:hidden border-b border-zinc-100 p-2">
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/dashboard') ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}>
                           <LayoutGrid size={16} /> Overview
                        </Link>
                        <Link href="/history" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/history') ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}>
                           <History size={16} /> History
                        </Link>
                        <Link href="/settings" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/settings') ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}>
                           <Settings size={16} /> Settings
                        </Link>
                     </div>

                     <div className="p-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                           <LogOut size={16} /> Log Out
                        </button>
                     </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}