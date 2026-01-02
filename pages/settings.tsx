import { useState } from 'react';
import Head from 'next/head';
import { 
  Store, 
  Upload, 
  Save, 
  CreditCard, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Loader2,
  Trash2
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Mock User Data
  const [formData, setFormData] = useState({
    businessName: 'Mama Tunde Logistics',
    tagline: 'Fast and Reliable Delivery',
    phone: '0812 345 6789',
    email: 'mamatunde@gmail.com',
    address: 'Shop 24, Balogun Market, Lagos',
    footerMessage: 'Thanks for your patronage! No refunds after 3 days.',
    currency: '₦ (NGN)'
  });

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-20">
      <Head>
        <title>Settings | Receiptify</title>
      </Head>

      <DashboardNavbar />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Business Settings</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your business profile and subscription.</p>
        </div>

        {/* 1. BRANDING SECTION */}
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
               <Store size={18} />
             </div>
             <div>
               <h2 className="font-bold text-zinc-900">Business Profile</h2>
               <p className="text-xs text-zinc-500">This information appears on your receipts.</p>
             </div>
          </div>
          
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Logo Upload - Visual Area */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-zinc-700 mb-2">Business Logo</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center overflow-hidden relative group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-zinc-300" size={32} />
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <p className="text-[10px] text-white font-bold">Change</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex gap-3 mb-2">
                    <label className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all shadow-sm">
                      Upload New
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {logoPreview && (
                      <button 
                        onClick={() => setLogoPreview(null)}
                        className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">Recommended: 400x400px PNG or JPG.</p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Business Name</label>
              <input 
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="w-full h-11 px-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
              />
            </div>
            
             <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Tagline (Optional)</label>
              <input 
                value={formData.tagline}
                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                className="w-full h-11 px-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
                placeholder="e.g. Best items in town"
              />
            </div>

             <div className="relative">
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Phone Number</label>
              <Phone size={16} className="absolute left-3 top-[34px] text-zinc-400" />
              <input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full h-11 pl-10 pr-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Email Address</label>
              <Mail size={16} className="absolute left-3 top-[34px] text-zinc-400" />
              <input 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full h-11 pl-10 pr-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
              />
            </div>

            <div className="md:col-span-2 relative">
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Address</label>
              <MapPin size={16} className="absolute left-3 top-[34px] text-zinc-400" />
              <input 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full h-11 pl-10 pr-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
              />
            </div>
          </div>
        </section>

        {/* 2. RECEIPT DEFAULTS */}
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
               <FileText size={18} />
             </div>
             <div>
               <h2 className="font-bold text-zinc-900">Receipt Defaults</h2>
               <p className="text-xs text-zinc-500">Set default messages for your customers.</p>
             </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Default Footer Message</label>
              <textarea 
                value={formData.footerMessage}
                onChange={(e) => setFormData({...formData, footerMessage: e.target.value})}
                rows={3}
                className="w-full p-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all resize-none" 
              />
              <p className="text-xs text-zinc-400 mt-2 text-right">Max 150 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Default Currency</label>
              <select 
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full h-11 px-4 border border-zinc-200 rounded-lg text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none bg-white"
              >
                <option>₦ (NGN) - Nigerian Naira</option>
                <option>$ (USD) - US Dollar</option>
                <option>£ (GBP) - British Pound</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. SUBSCRIPTION PLAN */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-900 shadow-lg overflow-hidden text-white relative">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/10 p-2 rounded-lg">
                  <CreditCard size={20} className="text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Current Plan</span>
              </div>
              <h2 className="text-3xl font-black mb-2">Free Plan</h2>
              <p className="text-zinc-400 text-sm max-w-sm">
                You are currently on the free plan. Upgrade to Pro to remove watermarks and access premium templates.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full md:w-auto min-w-[280px]">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle2 size={16} className="text-green-400" /> 10 Receipts / month
                </div>
                 <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle2 size={16} className="text-green-400" /> Basic Template
                </div>
                 <div className="flex items-center gap-2 text-sm text-zinc-500 line-through">
                  <CheckCircle2 size={16} /> Remove Watermark
                </div>
              </div>
              <button className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold py-3 rounded-lg transition-colors shadow-lg">
                Upgrade to Pro - ₦2,000/mo
              </button>
            </div>
          </div>
        </section>

        {/* SAVE BUTTON (Floating on Mobile, Fixed on Desktop) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 md:relative md:bg-transparent md:border-0 md:p-0 flex justify-end z-20">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-zinc-900/20 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

      </main>
    </div>
  );
}