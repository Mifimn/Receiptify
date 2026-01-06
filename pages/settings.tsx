import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Store, Upload, Save, Mail, Phone, MapPin, 
  FileText, Loader2, Utensils, Trash2, Plus, Link as LinkIcon 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    footerMessage: '',
    currency: '₦ (NGN)',
    slug: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMenu();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
    if (data) {
      setFormData({
        businessName: data.business_name || '',
        tagline: data.tagline || '',
        phone: data.business_phone || '',
        email: data.business_email || '',
        address: data.address || '',
        footer_message: data.footer_message || '',
        currency: data.currency || '₦ (NGN)',
        slug: data.slug || ''
      });
      setLogoPreview(data.logo_url);
    }
  };

  const fetchMenu = async () => {
    const { data } = await supabase.from('menu_items').select('*').eq('user_id', user?.id).order('created_at', { ascending: true });
    if (data) setMenuItems(data);
  };

  const handleSave = async () => {
    setIsLoading(true);
    let finalLogoUrl = logoPreview;
    try {
      if (logoFile && user) {
        const filePath = `${user.id}/logo-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('business-logos').upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(filePath);
        finalLogoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('profiles').update({
        business_name: formData.businessName,
        tagline: formData.tagline,
        business_phone: formData.phone,
        business_email: formData.email,
        address: formData.address,
        footer_message: formData.footerMessage,
        currency: formData.currency,
        logo_url: finalLogoUrl,
        slug: formData.slug.toLowerCase().trim().replace(/[\s_]+/g, '-'),
        updated_at: new Date(),
      }).eq('id', user?.id);

      if (error) throw error;
      alert("Settings saved successfully!");
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { id: `new-${Date.now()}`, name: '', price: 0, description: '', is_new: true }]);
  };

  const saveMenu = async () => {
    setIsLoading(true);
    try {
      for (const item of menuItems) {
        if (item.is_new) {
          await supabase.from('menu_items').insert({
            user_id: user?.id,
            name: item.name,
            price: item.price,
            description: item.description
          });
        } else {
          await supabase.from('menu_items').update({
            name: item.name,
            price: item.price,
            description: item.description
          }).eq('id', item.id);
        }
      }
      fetchMenu();
      alert("Menu updated!");
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const deleteMenuItem = async (id: string) => {
    if (id.toString().startsWith('new')) {
      setMenuItems(menuItems.filter(i => i.id !== id));
      return;
    }
    if (confirm("Delete this item?")) {
      await supabase.from('menu_items').delete().eq('id', id);
      fetchMenu();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-20">
      <Head><title>Settings | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Business Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure your profile and digital menu.</p>
        </div>

        {/* PROFILE SECTION */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
             <Store size={18} className="text-zinc-400" />
             <h2 className="font-bold text-zinc-900">Business Profile</h2>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Logo</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-2 border-zinc-100 bg-zinc-50 flex items-center justify-center overflow-hidden relative group shadow-inner">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Store className="text-zinc-200" size={32} />}
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f){ setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }}} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tap to upload <br/> PNG/JPG</p>
              </div>
            </div>
            <InputField label="Business Name" value={formData.businessName} onChange={(v) => setFormData({...formData, businessName: v})} />
            <InputField label="Menu URL Slug" value={formData.slug} onChange={(v) => setFormData({...formData, slug: v})} placeholder="item-7" icon={<LinkIcon size={16}/>} />
            <InputField label="Tagline" value={formData.tagline} onChange={(v) => setFormData({...formData, tagline: v})} />
            <InputField label="Phone" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} icon={<Phone size={16}/>} />
          </div>
        </section>

        {/* MENU MANAGER SECTION */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
             <div className="flex items-center gap-3">
               <Utensils size={18} className="text-zinc-400" />
               <h2 className="font-bold text-zinc-900">Digital QR Menu</h2>
             </div>
             <button onClick={addMenuItem} className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
               <Plus size={14}/> Add Item
             </button>
          </div>
          <div className="p-6 space-y-4">
            {menuItems.map((item, idx) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100 relative group">
                <div className="flex-1 space-y-2">
                   <input placeholder="Item Name (e.g. Jollof Rice)" value={item.name} onChange={(e) => { const n = [...menuItems]; n[idx].name = e.target.value; setMenuItems(n); }} className="w-full bg-white border-none text-sm font-bold p-0 focus:ring-0" />
                   <input placeholder="Short description..." value={item.description} onChange={(e) => { const n = [...menuItems]; n[idx].description = e.target.value; setMenuItems(n); }} className="w-full bg-transparent border-none text-xs text-zinc-400 p-0 focus:ring-0" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₦</span>
                    <input type="number" value={item.price} onChange={(e) => { const n = [...menuItems]; n[idx].price = e.target.value; setMenuItems(n); }} className="w-full bg-white border border-zinc-200 rounded-lg pl-6 pr-2 py-2 text-xs font-bold focus:border-zinc-900 outline-none" />
                  </div>
                  <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
            {menuItems.length > 0 && (
              <button onClick={saveMenu} disabled={isLoading} className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18}/>} Sync Menu Items
              </button>
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save All Changes
          </button>
        </div>
      </main>
    </div>
  );
}

function InputField({ label, value, onChange, icon, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</div>}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full h-12 border-2 border-zinc-100 rounded-xl text-sm font-bold focus:border-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white ${icon ? 'pl-10 pr-4' : 'px-4'}`} />
      </div>
    </div>
  );
}
import { CheckCircle2 } from 'lucide-react';
