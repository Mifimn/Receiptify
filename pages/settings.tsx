import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
Store, Upload, Save, CreditCard, CheckCircle2, 
Mail, Phone, MapPin, FileText, Loader2 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Settings() {
const { user } = useAuth();
const [isLoading, setIsLoading] = useState(false);
const [logoPreview, setLogoPreview] = useState<string | null>(null);
const [logoFile, setLogoFile] = useState<File | null>(null);

const [formData, setFormData] = useState({
businessName: '',
tagline: '',
phone: '',
email: '',
address: '',
footerMessage: '',
currency: '₦ (NGN)'
});

// Fetch real data on load
useEffect(() => {
if (user) {
const fetchProfile = async () => {
const { data } = await supabase
.from('profiles')
.select('*')
.eq('id', user.id)
.single();

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
// 1. Upload Logo if a new file was selected
if (logoFile && user) {
const filePath = `${user.id}/logo-${Date.now()}`;
const { error: uploadError } = await supabase.storage
.from('business-logos')
.upload(filePath, logoFile);

if (uploadError) throw uploadError;

const { data: urlData } = supabase.storage
.from('business-logos')
.getPublicUrl(filePath);

finalLogoUrl = urlData.publicUrl;
}

// 2. Update Profile in Database
const { error } = await supabase
.from('profiles')
.update({
business_name: formData.businessName,
tagline: formData.tagline,
business_phone: formData.phone,
business_email: formData.email,
address: formData.address,
footer_message: formData.footerMessage,
currency: formData.currency,
logo_url: finalLogoUrl,
updated_at: new Date(),
})
.eq('id', user?.id);

if (error) throw error;
alert("Settings saved successfully!");
} catch (err: any) {
alert(err.message);
} finally {
setIsLoading(false);
}
};

const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (file) {
setLogoFile(file);
setLogoPreview(URL.createObjectURL(file));
}
};

return (
<div className="min-h-screen bg-zinc-50 font-sans pb-20">
<Head><title>Settings | MifimnPay</title></Head>
<DashboardNavbar />
<main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
<div>
<h1 className="text-2xl font-bold text-zinc-900">Business Settings</h1>
<p className="text-zinc-500 text-sm mt-1">Manage your business profile and subscription.</p>
</div>

<section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
<div className="p-6 border-b border-zinc-100 flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><Store size={18} /></div>
<div><h2 className="font-bold text-zinc-900">Business Profile</h2></div>
</div>

<div className="p-6 grid md:grid-cols-2 gap-6">
<div className="md:col-span-2">
<label className="block text-sm font-bold text-zinc-700 mb-2">Business Logo</label>
<div className="flex items-center gap-6">
<div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center overflow-hidden relative group">
{logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Store className="text-zinc-300" size={32} />}
<input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
</div>
<div className="flex-1">
<p className="text-xs text-zinc-400">Click circle to upload PNG or JPG.</p>
</div>
</div>
</div>

<InputField label="Business Name" value={formData.businessName} onChange={(v) => setFormData({...formData, businessName: v})} />
<InputField label="Tagline" value={formData.tagline} onChange={(v) => setFormData({...formData, tagline: v})} placeholder="Fast and Reliable" />
<InputField label="Phone Number" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} icon={<Phone size={16}/>} />
<InputField label="Email Address" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} icon={<Mail size={16}/>} />
<div className="md:col-span-2">
<InputField label="Address" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} icon={<MapPin size={16}/>} />
</div>
</div>
</section>

<section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
<div className="p-6 border-b border-zinc-100 flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><FileText size={18} /></div>
<div><h2 className="font-bold text-zinc-900">Receipt Defaults</h2></div>
</div>
<div className="p-6 space-y-6">
<div>
<label className="block text-sm font-bold text-zinc-700 mb-1.5">Default Footer Message</label>
<textarea value={formData.footerMessage} onChange={(e) => setFormData({...formData, footerMessage: e.target.value})} rows={3} className="w-full p-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 outline-none transition-all resize-none" />
</div>
<div>
<label className="block text-sm font-bold text-zinc-700 mb-1.5">Default Currency</label>
<select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full h-11 px-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 outline-none bg-white">
<option>₦ (NGN) - Nigerian Naira</option>
<option>$ (USD) - US Dollar</option>
</select>
</div>
</div>
</section>

<div className="flex justify-end z-20">
<button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
{isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Changes
</button>
</div>
</main>
</div>
);
}

function InputField({ label, value, onChange, icon, placeholder }: any) {
return (
<div className="relative">
<label className="block text-sm font-bold text-zinc-700 mb-1.5">{label}</label>
{icon && <div className="absolute left-3 top-[38px] text-zinc-400">{icon}</div>}
<input 
value={value} 
onChange={(e) => onChange(e.target.value)} 
placeholder={placeholder}
className={`w-full h-11 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 outline-none transition-all ${icon ? 'pl-10 pr-4' : 'px-4'}`} 
/>
</div>
);
}