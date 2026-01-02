import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Download, Share2, Plus, Trash2, ArrowLeft, Loader2, Palette, Settings, CreditCard, Lock, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ReceiptData, ReceiptItem, ReceiptSettings } from '../types';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; //
import { useAuth } from '../lib/AuthContext'; //

export default function Generator() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); //
  const receiptRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // --- CONFIRMATION MODAL STATE ---
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 1. DATA STATE
  const [data, setData] = useState<ReceiptData>({
    receiptNumber: 'REC-0000',
    date: '...',
    customerName: '',
    currency: '₦',
    items: [{ id: '1', name: '', qty: 1, price: '' as any }], 
    paymentMethod: 'Transfer',
    status: 'Paid',
    discount: '' as any,
    shipping: '' as any,
    businessName: 'My Business',
    businessPhone: '',
    note: ''
  });

  // 2. SETTINGS STATE
  const [settings, setSettings] = useState<ReceiptSettings>({
    color: '#09090b', 
    showLogo: true,
    template: 'detailed'
  });

  // --- FETCH USER PROFILE & SET DEFAULTS ---
  useEffect(() => {
    setIsClient(true);
    
    const initializeData = async () => {
      // Set initial receipt ID and date
      setData(prev => ({
        ...prev,
        receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      }));

      // If user is logged in, fetch their saved business profile
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, business_phone, currency, logo_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          setData(prev => ({
            ...prev,
            businessName: profile.business_name || 'My Business',
            businessPhone: profile.business_phone || '',
            currency: profile.currency || '₦',
            logoUrl: profile.logo_url // Ensure types.ts supports logoUrl
          }));
        }
      }
    };

    initializeData();
  }, [user]);

  // --- AUTO-SAVE TO SUPABASE ---
  const saveToHistory = async () => {
    if (!user) return; 

    const subtotal = data.items.reduce((acc, i) => acc + ((Number(i.price)||0) * (Number(i.qty)||0)), 0);
    const total = (subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0)).toLocaleString();

    const { error } = await supabase.from('receipts').insert([{
      user_id: user.id,
      customer_name: data.customerName || 'Guest Customer',
      amount: `${data.currency}${total}`,
      items: data.items, // Saves as JSONB
      status: data.status,
      receipt_number: data.receiptNumber
    }]);

    if (error) console.error("Auto-save failed:", error.message);
  };

  // --- ACTIONS ---
  const handleItemChange = (id: string, field: keyof ReceiptItem, value: any) => {
    const finalValue = (field === 'price' || field === 'qty') && value === '' ? '' : value;
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: finalValue } : item)
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: '', qty: 1, price: '' as any }]
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length === 1) {
        handleItemChange(id, 'name', '');
        handleItemChange(id, 'price', '');
        handleItemChange(id, 'qty', 1);
        return;
    }; 
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const initiateAction = (action: () => void) => {
    // 1. If not logged in, force login/signup
    if (!user) {
      if (confirm("You must create a free account to Download or Share receipts. Sign up now?")) {
        router.push('/login');
      }
      return;
    }

    // 2. If logged in, proceed with confirmation check
    setPendingAction(() => action);
    setShowConfirm(true);
  };

  const confirmAndExecute = () => {
    setShowConfirm(false);
    if (pendingAction) {
      pendingAction(); 
    }
  };

  // --- IMAGE GENERATION ---
  const generateImage = async () => {
    if (!receiptRef.current) return null;
    setIsGenerating(true);
    setActiveTab('preview');
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      const canvas = await html2canvas(receiptRef.current, { 
        scale: 3, 
        useCORS: true,
        backgroundColor: null, 
        onclone: (clonedDoc) => {
            const watermark = clonedDoc.getElementById('preview-watermark');
            if (watermark) watermark.style.display = 'none'; // Ensure watermark never downloads
        }
      });
      return canvas.toDataURL("image/png", 1.0);
    } catch (err) {
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const image = await generateImage();
    if (!image) return;
    await saveToHistory(); // Silent save
    const link = document.createElement('a');
    link.href = image;
    const safeName = data.customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'receipt';
    link.download = `${safeName}-${data.receiptNumber}.png`;
    link.click();
  };

  const handleWhatsApp = async () => {
    const image = await generateImage();
    if (!image) return;
    await saveToHistory(); // Silent save
    const text = `Hello ${data.customerName}, here is your receipt for ${data.currency}${calculateTotal()}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const calculateTotal = () => {
     const sub = data.items.reduce((acc, i) => acc + ((Number(i.price)||0) * (Number(i.qty)||0)), 0);
     return (sub + (Number(data.shipping) || 0) - (Number(data.discount) || 0)).toLocaleString();
  }

  const colors = ['#09090b', '#166534', '#1e40af', '#b45309', '#7e22ce', '#be123c', '#0891b2', '#854d0e'];

  if (!isClient || authLoading) return null;

  return (
    <div className="h-[100dvh] bg-zinc-100 flex flex-col font-sans overflow-hidden">
      <Head><title>Create Receipt | MifimnPay</title></Head>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Check details carefully</h3>
            <p className="text-sm text-zinc-500 mb-6">Are you sure the amounts and names are correct? Once generated, this record is saved.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="py-3 px-4 rounded-xl font-bold text-sm bg-zinc-100 text-zinc-600 hover:bg-zinc-200">Go Back</button>
              <button onClick={confirmAndExecute} className="py-3 px-4 rounded-xl font-bold text-sm bg-zinc-900 text-white hover:bg-zinc-800">Yes, Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-3">
            <Link href={user ? "/dashboard" : "/"} className="text-zinc-500 hover:bg-zinc-100 p-2 rounded-full"><ArrowLeft size={22} /></Link>
            <h1 className="font-bold text-lg text-zinc-900 tracking-tight">Create Receipt</h1>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => initiateAction(handleWhatsApp)} disabled={isGenerating} className="bg-[#25D366] text-white p-2.5 md:px-5 md:py-2.5 rounded-full text-sm font-bold flex items-center gap-2">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Share2 size={18} />}
                <span className="hidden md:inline">Share</span>
            </button>
            <button onClick={() => initiateAction(handleDownload)} disabled={isGenerating} className="bg-zinc-900 text-white p-2.5 md:px-5 md:py-2.5 rounded-full text-sm font-bold flex items-center gap-2">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Download size={18} />}
                <span className="hidden md:inline">Download</span>
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: FORM */}
        <div className={`flex-1 h-full overflow-y-auto bg-zinc-50 p-4 md:p-6 space-y-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          <div className="space-y-6 pb-40 md:pb-10 max-w-2xl mx-auto">
            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Settings size={16} className="text-zinc-400" /> Customer & Details</h3>
              <div className="space-y-4">
                <input value={data.customerName} onChange={(e) => setData({...data, customerName: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none transition-all font-medium text-zinc-900 bg-zinc-50 focus:bg-white text-base" placeholder="e.g. Amina Yusuf" />
                <div className="grid grid-cols-2 gap-4">
                  <input value={data.receiptNumber} disabled className="w-full h-12 px-4 bg-zinc-100 border-2 border-transparent rounded-xl text-zinc-500 font-bold" />
                  <input value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none font-medium text-zinc-900 bg-zinc-50 focus:bg-white text-base" />
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Palette size={16} className="text-zinc-400" /> Items Purchased</h3>
                <button onClick={addItem} className="text-xs font-bold text-zinc-900 flex items-center gap-1 hover:bg-zinc-100 px-3 py-1.5 rounded-full">+ Add Item</button>
              </div>
              <div className="space-y-3">
                {data.items.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-start relative group">
                    <div className="flex-1 grid grid-cols-12 gap-2">
                          <div className="col-span-12 md:col-span-7">
                              <input placeholder="Item Name" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="w-full p-3 text-base border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none font-medium bg-zinc-50 focus:bg-white" />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                              <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full p-3 text-base border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none text-center font-bold bg-zinc-50 focus:bg-white" />
                          </div>
                          <div className="col-span-8 md:col-span-3">
                              <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="w-full p-3 text-base border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none font-mono font-bold bg-zinc-50 focus:bg-white" />
                          </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-3 text-zinc-300 hover:text-red-500 transition-colors mt-0"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className={`flex-1 h-full bg-zinc-200/50 relative flex flex-col md:border-l border-zinc-200/50 ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-white/80 backdrop-blur-md border-b border-zinc-200 p-3 flex flex-col md:flex-row justify-between items-center gap-3 z-10 shadow-sm shrink-0">
             <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-full border border-zinc-100 w-full md:w-auto overflow-hidden">
               <span className="text-xs font-bold text-zinc-400 uppercase pl-2 shrink-0">Color</span>
               <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full md:w-auto pr-2">
                 {colors.map(c => (
                   <button key={c} onClick={() => setSettings({...settings, color: c})} className={`w-7 h-7 rounded-full border-2 transition-all shadow-sm shrink-0 ${settings.color === c ? 'border-zinc-900 scale-110' : 'border-white'}`} style={{ backgroundColor: c }} />
                 ))}
               </div>
             </div>
             <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-full border border-zinc-100 w-full md:w-auto">
               <button onClick={() => setSettings({...settings, showLogo: !settings.showLogo})} className={`flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${settings.showLogo ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>Logo</button>
               <button onClick={() => setSettings({...settings, template: settings.template === 'simple' ? 'detailed' : 'simple'})} className="flex-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm border border-zinc-100 text-zinc-700">{settings.template === 'simple' ? 'Simple' : 'Detailed'}</button>
             </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center pb-40 md:pb-10 p-4 bg-zinc-100/50 relative">
             {/* ANTI-SCREENSHOT WATERMARK OVERLAY - ONLY FOR GUESTS */}
             {!user && (
               <div id="preview-watermark" className="absolute inset-0 pointer-events-none z-50 flex flex-col items-center justify-center overflow-hidden" style={{ mixBlendMode: 'multiply' }}>
                  <div className="grid grid-cols-2 gap-12 opacity-10 rotate-[-15deg] scale-150">
                     {[...Array(12)].map((_, i) => (
                        <span key={i} className="text-4xl font-black text-black whitespace-nowrap">PREVIEW ONLY</span>
                     ))}
                  </div>
               </div>
             )}

             <div className="scale-[0.85] md:scale-100 transition-transform duration-300 origin-center">
               <ReceiptPreview data={data} settings={settings} receiptRef={receiptRef} />
             </div>
          </div>
        </div>

        {/* MOBILE TABS */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 flex z-40 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 ${activeTab === 'edit' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400'}`}>Edit Details</button>
          <div className="w-[1px] bg-zinc-200 h-6 self-center"></div>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 ${activeTab === 'preview' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400'}`}>Live Preview</button>
        </div>
      </div>
    </div>
  );
}