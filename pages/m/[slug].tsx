import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Package } from 'lucide-react';

export default function PublicStore() {
  const router = useRouter();
  const { slug } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchStore();
  }, [slug]);

  const fetchStore = async () => {
    try {
      const { data: prof } = await supabase.from('profiles').select('*').eq('slug', slug).single();
      if (prof) {
        setProfile(prof);
        const { data: prod } = await supabase
          .from('menu_items')
          .select('*')
          .eq('user_id', prof.id)
          .order('created_at', { ascending: true });
        setItems(prod || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin" /></div>;
  if (!profile) return <div className="p-20 text-center font-black uppercase tracking-widest text-zinc-400">Store Not Found</div>;

  const logoLetter = (profile.business_name?.charAt(0) || 'R').toUpperCase();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 relative overflow-hidden">
      <Head><title>{profile.business_name} | Price List</title></Head>
      
      {/* 1. Repeated Slanted Background Logo Pattern (Same as Receipt Preview) */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-0 flex flex-wrap gap-14 p-6 rotate-[-15deg] scale-150 justify-center items-center">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="w-12 h-12 flex items-center justify-center">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="" className="w-full h-full object-contain grayscale" />
            ) : (
              <span className="text-4xl font-black text-zinc-900">
                {logoLetter}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="p-10 text-center border-b border-zinc-100 bg-white/80 backdrop-blur-md">
          {profile.logo_url && (
            <img 
              src={profile.logo_url} 
              className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-xl border-4 border-white" 
              alt="Store Logo" 
            />
          )}
          <h1 className="text-3xl font-black uppercase tracking-tighter">{profile.business_name}</h1>
          {profile.tagline && (
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-3 italic">
              {profile.tagline}
            </p>
          )}
        </div>

        <div className="max-w-xl mx-auto p-8 space-y-10 mb-20">
          <div className="flex items-center gap-3 border-b-2 border-zinc-900 pb-3">
            <Package size={20} />
            <h2 className="font-black uppercase tracking-widest text-sm">Official Price List</h2>
          </div>

          <div className="space-y-8">
            {items.length > 0 ? items.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-b border-zinc-50 pb-6 group transition-all">
                <div className="flex-1 space-y-1">
                  <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    {item.description || 'Verified product price.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-zinc-900">
                    {profile.currency?.split(' ')[0] || '₦'}{Number(item.price).toLocaleString()}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-center text-zinc-300 font-bold py-20 uppercase tracking-widest text-xs">
                No items listed yet.
              </p>
            )}
          </div>
        </div>

        <div className="p-10 text-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-[0.4em]">Powered by MifimnPay</p>
        </div>
      </div>
    </div>
  );
}
