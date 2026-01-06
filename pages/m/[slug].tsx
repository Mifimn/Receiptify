import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Utensils } from 'lucide-react';

export default function PublicMenu() {
  const router = useRouter();
  const { slug } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchMenu();
  }, [slug]);

  const fetchMenu = async () => {
    try {
      // Find the business by its URL slug
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (prof) {
        setProfile(prof);
        const { data: items } = await supabase
          .from('menu_items')
          .select('*')
          .eq('user_id', prof.id)
          .eq('is_available', true);
        setMenuItems(items || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!profile) return <div className="p-10 text-center font-bold uppercase">Menu not found</div>;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Head><title>{profile.business_name} | Menu</title></Head>
      
      <div className="p-8 text-center border-b border-zinc-100">
        {profile.logo_url && (
          <img src={profile.logo_url} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-md" alt="Logo" />
        )}
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">{profile.business_name}</h1>
        {profile.tagline && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2 italic">{profile.tagline}</p>}
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8">
        <div className="flex items-center gap-2 border-b-2 border-zinc-900 pb-2">
          <Utensils size={18} />
          <h2 className="font-black uppercase tracking-widest text-xs">Available Today</h2>
        </div>

        <div className="space-y-6">
          {menuItems.map((item) => (
            <div key={item.id} className="flex justify-between items-start border-b border-zinc-50 pb-4">
              <div className="flex-1">
                <h3 className="font-bold text-zinc-900 text-sm">{item.name}</h3>
                <p className="text-[11px] text-zinc-400 mt-1">{item.description}</p>
              </div>
              <span className="font-mono font-black text-zinc-900">
                  {profile.currency || '₦'}{Number(item.price).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-10 text-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.2em]">Powered by MifimnPay</p>
      </div>
    </div>
  );
}
