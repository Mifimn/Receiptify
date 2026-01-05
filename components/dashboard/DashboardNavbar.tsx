import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bell, User, LayoutGrid, History, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

export default function DashboardNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ business_name: string; logo_url: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('business_name, logo_url').eq('id', user.id).single();
        if (data) setProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 md:px-6 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        <div className="flex items-center gap-8">
          {/* Logo Section - Replaced placeholder with favicon.png */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="MifimnPay" 
              className="w-8 h-8 rounded-lg shadow-sm object-cover" 
            />
            <span className="font-bold text-zinc-900 text-lg hidden md:block tracking-tight">MifimnPay</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
            <NavLink href="/dashboard" icon={<LayoutGrid size={16} />} label="Overview" active={isActive('/dashboard')} />
            <NavLink href="/history" icon={<History size={16} />} label="History" active={isActive('/history')} />
            <NavLink href="/settings" icon={<Settings size={16} />} label="Settings" active={isActive('/settings')} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 focus:outline-none group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-zinc-900 truncate max-w-[120px]">{profile?.business_name || 'Vendor'}</p>
                <p className="text-[10px] text-zinc-500">Free Plan</p>
              </div>
              <div className="w-9 h-9 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 flex items-center justify-center">
                {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover" /> : <User size={18} className="text-zinc-400" />}
              </div>
              <div className="md:hidden p-1 hover:bg-zinc-100 rounded-lg">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden">
                     <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                        <p className="text-sm font-bold text-zinc-900">{profile?.business_name || 'Vendor'}</p>
                        <p className="text-xs text-zinc-500">Free Plan</p>
                     </div>
                     <div className="md:hidden p-2 border-b border-zinc-100">
                        <MobileLink href="/dashboard" icon={<LayoutGrid size={16}/>} label="Overview" active={isActive('/dashboard')} onClick={() => setIsMenuOpen(false)} />
                        <MobileLink href="/history" icon={<History size={16}/>} label="History" active={isActive('/history')} onClick={() => setIsMenuOpen(false)} />
                        <MobileLink href="/settings" icon={<Settings size={16}/>} label="Settings" active={isActive('/settings')} onClick={() => setIsMenuOpen(false)} />
                     </div>
                     <div className="p-2">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
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

function NavLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>{icon} {label}</Link>
  );
}

function MobileLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}>{icon} {label}</Link>
  );
}
