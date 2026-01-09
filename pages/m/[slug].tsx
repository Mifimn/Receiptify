// pages/m/[slug].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Package, ShieldCheck } from 'lucide-react';

export default function PublicStore() {
  const router = useRouter();
  const { slug } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const siteUrl = 'https://mifimnpay.vercel.app';

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

  const getOptimizedImage = (url: string) => {
    if (!url) return `${siteUrl}/favicon.png`;
    if (url.includes('supabase.co')) {
      return `${url}?width=300&height=300&resize=contain&quality=70`;
    }
    return url;
  };

  // --- DYNAMIC SEO LOGIC ---
  // If profile is not yet loaded, we use the slug from the URL to show the name immediately
  const displayName = profile?.business_name || (slug ? String(slug).replace(/-/g, ' ').toUpperCase() : "Storefront");
  const pageTitle = `${displayName} | Official Price List`;
  const pageDesc = `View the live price list and products from ${displayName} on MifimnPay.`;
  const shareImage = getOptimizedImage(profile?.logo_url);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 relative overflow-hidden">
      {/* Head rendered outside of loading to ensure social media crawlers see the slug name */}
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />

        {/* Open Graph / WhatsApp / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/m/${slug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:secure_url" content={shareImage} />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={shareImage} />
      </Head>

      {loading ? (
        <div className="h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-zinc-900" size={24} />
        </div>
      ) : !profile ? (
        <div className="h-screen flex items-center justify-center bg-zinc-50">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Storefront Not Found</p>
        </div>
      ) : (
        <>
          {/* Background Logo Pattern */}
          <div className="fixed inset-0 opacity-[0.07] pointer-events-none z-0 flex flex-wrap gap-12 p-6 rotate-[-15deg] scale-150 justify-center items-center">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="w-10 h-10 flex items-center justify-center">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="" className="w-full h-full object-contain grayscale" />
                ) : (
                  <span className="text-3xl font-black text-zinc-900">{(profile.business_name?.charAt(0) || 'B').toUpperCase()}</span>
                )}
              </div>
            ))}
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <header className="pt-10 pb-6 px-6 border-b border-zinc-100 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
              <div className="max-w-screen-md mx-auto text-center">
                {profile.logo_url && (
                  <div className="inline-block p-1 bg-white rounded-full shadow-lg mb-3 border border-zinc-100">
                    <img 
                      src={profile.logo_url} 
                      className="w-14 h-14 rounded-full object-cover" 
                      alt="Business Logo" 
                    />
                  </div>
                )}
                <h1 className="text-lg font-black uppercase tracking-tighter text-zinc-900 sm:text-xl">
                  {profile.business_name}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-[1px] w-3 bg-zinc-200"></span>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.2em] italic">
                    {profile.tagline || 'Official Price List'}
                  </p>
                  <span className="h-[1px] w-3 bg-zinc-200"></span>
                </div>
              </div>
            </header>

            <main className="flex-1 max-w-screen-md mx-auto w-full px-6 py-8">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-8">
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-zinc-900" />
                  <h2 className="font-black uppercase tracking-[0.2em] text-[9px]">Catalog</h2>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <ShieldCheck size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Live Rates</span>
                </div>
              </div>

              <div className="space-y-0.5">
                {items.length > 0 ? items.map((item) => (
                  <div 
                    key={item.id} 
                    className="group flex justify-between items-center py-4 border-b border-zinc-50 hover:bg-zinc-50/50 transition-all duration-300 px-2 -mx-2 rounded-lg"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-[10px] font-black uppercase tracking-tight text-zinc-800 group-hover:translate-x-1 transition-transform duration-300">
                        {item.name}
                      </h3>
                      <p className="text-[9px] text-zinc-400 font-medium mt-0.5 leading-relaxed line-clamp-1">
                        {item.description || 'Verified listing.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-zinc-900 tabular-nums">
                        <span className="text-[9px] mr-0.5 text-zinc-400 font-bold">{profile.currency?.split(' ')[0] || '₦'}</span>
                        {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center">
                    <p className="text-[8px] text-zinc-300 font-black uppercase tracking-[0.3em]">No Public Listings</p>
                  </div>
                )}
              </div>
            </main>

            <footer className="py-12 px-6 border-t border-zinc-50 bg-zinc-50/20 text-center">
              <div className="max-w-screen-md mx-auto">
                <p className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400 leading-relaxed">
                  Secure Digital Storefront &copy; {new Date().getFullYear()} <br/>
                  <span className="text-zinc-300">Powered by MifimnPay</span>
                </p>
              </div>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}
