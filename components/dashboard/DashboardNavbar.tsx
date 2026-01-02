import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

export default function DashboardNavbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ business_name: string; logo_url: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        const { data } = await supabase.from('profiles').select('business_name, logo_url').eq('id', user.id).single();
        if (data) setProfile(data);
      };
      getProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 h-16 flex items-center">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-zinc-950">
          <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white text-xs">M</div>
          MifimnPay
        </Link>

        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-all"><Bell size={20} /></button>
          <div className="relative group">
            <button className="flex items-center gap-2 p-1 hover:bg-zinc-100 rounded-xl transition-all border border-transparent hover:border-zinc-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-zinc-950">{profile?.business_name || 'Vendor'}</p>
                <p className="text-[10px] text-zinc-500 text-left">Free Plan</p>
              </div>
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover border" />
              ) : (
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white"><User size={16} /></div>
              )}
              <ChevronDown size={14} className="text-zinc-400" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"><LogOut size={16} /> Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
