import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Store, Upload, Save, CreditCard, CheckCircle2, Mail, Phone, MapPin, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: '', tagline: '', phone: '', email: '', address: '', footerMessage: '', currency: '₦ (NGN)'
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setFormData({
            businessName: data.business_name || '',
            tagline: data.tagline || '',
            phone: data.business_phone || '',
            email: data.business_email || '',
            address: data.address || '',
            footerMessage: data.footer_message || '',
            currency: data.currency || '₦ (NGN)'
          });
          setLogoPreview(data.logo_url);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    let finalLogoUrl = logoPreview;

    try {
      if (logoFile && user) {
        const filePath = `${user.id}/logo-${Date.now()}`;
        await supabase.storage.from('business-logos').upload(filePath, logoFile);
        const { data } = supabase.storage.from('business-logos').getPublicUrl(filePath);
        finalLogoUrl = data.publicUrl;
      }

      const { error } = await supabase.from('profiles').update({
        business_name: formData.businessName,
        tagline: formData.tagline,
        business_phone: formData.phone,
        business_email: formData.email,
        address: formData.address,
        footer_message: formData.footerMessage,
        currency: formData.currency,
        logo_url: finalLogoUrl
      }).eq('id', user?.id);

      if (error) throw error;
      alert("Settings saved!");
    } catch (err: any) { alert(err.message); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Head><title>Settings | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-zinc-900">Business Settings</h1>
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 overflow-hidden relative group">
              {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <Store className="m-auto text-zinc-300" size={32} />}
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
              }} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <p className="text-xs text-zinc-400">Click circle to change logo.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Business Name" value={formData.businessName} onChange={(v) => setFormData({...formData, businessName: v})} />
            <Input label="Tagline" value={formData.tagline} onChange={(v) => setFormData({...formData, tagline: v})} />
            <Input label="Phone" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
            <Input label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
            <div className="md:col-span-2"><Input label="Address" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} /></div>
          </div>
        </section>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={isLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-zinc-700 mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-11 px-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 outline-none" />
    </div>
  );
}