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
      // Set basic receipt info
      setData(prev => ({
        ...prev,
        receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      }));

      // If logged in, fetch business profile
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
            currency: profile.currency || '₦'
          }));
        }
      }
    };

    initializeData();
  }, [user]);

  // --- AUTO-SAVE TO SUPABASE ---
  const saveToHistory = async () => {
    if (!user) return; //

    const total = (data.items.reduce((acc, i) => acc + ((Number(i.price)||0) * (Number(i.qty)||0)), 0) + (Number(data.shipping) || 0) - (Number(data.discount) || 0)).toLocaleString();

    await supabase.from('receipts').insert([{
      user_id: user.id,
      customer_name: data.customerName || 'Guest Customer',
      amount: `${data.currency}${total}`,
      items: data.items,
      status: data.status,
      receipt_number: data.receiptNumber
    }]); //
  };

  // --- ACTIONS ---
  const handleItemChange = (id: string, field: keyof ReceiptItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: '', qty: 1, price: '' as any }]
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length === 1) return; 
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const initiateAction = (action: () => void) => {
    // 1. If not logged in, force login
    if (!user) {
      if (confirm("You must create a free account to Download or Share receipts. Sign up now?")) {
        router.push('/login');
      }
      return;
    }

    // 2. If logged in, show confirmation check
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
            if (watermark) watermark.style.display = 'none'; // Never download the watermark
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
    await saveToHistory(); // Auto-save on success
    const link = document.createElement('a');
    link.href = image;
    link.download = `${data.customerName || 'receipt'}-${data.receiptNumber}.png`;
    link.click();
  };

  const handleWhatsApp = async () => {
    const image = await generateImage();
    if (!image) return;
    await saveToHistory(); // Auto-save on success
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
    <div className="h-[100dvh] bg-zinc-100 flex flex-col overflow-hidden">
      <Head><title>Create Receipt | MifimnPay</title></Head>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Check details carefully</h3>
            <p className="text-sm text-zinc-500 mb-6">Are you sure the amounts and names are correct?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="py-3 rounded-xl font-bold text-sm bg-zinc-100 text-zinc-600">Go Back</button>
              <button onClick={confirmAndExecute} className="py-3 rounded-xl font-bold text-sm bg-zinc-900 text-white">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex justify-between items-center z-30">
        <div className="flex items-center gap-3">
            <Link href={user ? "/dashboard" : "/"} className="text-zinc-500 p-2"><ArrowLeft size={22} /></Link>
            <h1 className="font-bold text-lg text-zinc-900">Create Receipt</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => initiateAction(handleWhatsApp)} className="bg-[#25D366] text-white p-2.5 md:px-5 rounded-full text-sm font-bold flex items-center gap-2">
                {!user ? <Lock size={16} /> : <Share2 size={18} />} <span className="hidden md:inline">Share</span>
            </button>
            <button onClick={() => initiateAction(handleDownload)} className="bg-zinc-900 text-white p-2.5 md:px-5 rounded-full text-sm font-bold flex items-center gap-2">
                {!user ? <Lock size={16} /> : <Download size={18} />} <span className="hidden md:inline">Download</span>
            </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* FORM SIDE */}
        <div className={`flex-1 h-full overflow-y-auto bg-zinc-50 p-4 md:p-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
           <div className="max-w-2xl mx-auto space-y-6 pb-20">
              <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Settings size={16}/> Customer Details</h3>
                <input value={data.customerName} onChange={(e) => setData({...data, customerName: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl outline-none focus:border-zinc-900" placeholder="Customer Name" />
                <div className="grid grid-cols-2 gap-4">
                  <input value={data.receiptNumber} disabled className="w-full h-12 px-4 bg-zinc-100 border-2 border-transparent rounded-xl text-zinc-500 font-bold" />
                  <input value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl outline-none focus:border-zinc-900" />
                </div>
              </section>

              <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center"><h3 className="font-bold text-xs text-zinc-500 uppercase">Items</h3><button onClick={addItem} className="text-xs font-bold text-zinc-900">+ Add Item</button></div>
                {data.items.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <input placeholder="Item" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="flex-[3] p-3 border-2 border-zinc-100 rounded-xl outline-none" />
                    <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="flex-1 p-3 border-2 border-zinc-100 rounded-xl text-center outline-none" />
                    <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="flex-[2] p-3 border-2 border-zinc-100 rounded-xl outline-none" />
                    <button onClick={() => removeItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500"><Trash2 size={20}/></button>
                  </div>
                ))}
              </section>
           </div>
        </div>

        {/* PREVIEW SIDE */}
        <div className={`flex-1 h-full bg-zinc-200/50 flex flex-col relative ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-white border-b border-zinc-200 p-3 flex justify-between items-center z-10">
             <div className="flex gap-1.5 overflow-x-auto">
               {colors.map(c => (
                 <button key={c} onClick={() => setSettings({...settings, color: c})} className={`w-7 h-7 rounded-full border-2 ${settings.color === c ? 'border-zinc-900' : 'border-white'}`} style={{ backgroundColor: c }} />
               ))}
             </div>
             <div className="flex gap-2">
               <button onClick={() => setSettings({...settings, showLogo: !settings.showLogo})} className={`px-3 py-1.5 rounded-full text-xs font-bold ${settings.showLogo ? 'bg-zinc-100' : 'text-zinc-400'}`}>Logo</button>
               <button onClick={() => setSettings({...settings, template: settings.template === 'simple' ? 'detailed' : 'simple'})} className="px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-100">{settings.template === 'simple' ? 'Simple' : 'Detailed'}</button>
             </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
             {/* WATERMARK OVERLAY - ONLY FOR GUESTS */}
             {!user && (
               <div id="preview-watermark" className="absolute inset-0 pointer-events-none z-50 flex flex-col items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-12 opacity-10 rotate-[-15deg] scale-150">
                     {[...Array(12)].map((_, i) => (
                        <span key={i} className="text-4xl font-black text-black whitespace-nowrap">PREVIEW ONLY</span>
                     ))}
                  </div>
               </div>
             )}

             <div className="scale-[0.85] md:scale-100 transition-transform">
               <ReceiptPreview data={data} settings={settings} receiptRef={receiptRef} />
             </div>
          </div>
        </div>

        {/* MOBILE TABS */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex z-40">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'edit' ? 'text-zinc-900 bg-zinc-50' : 'text-zinc-400'}`}>Edit</button>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'preview' ? 'text-zinc-900 bg-zinc-50' : 'text-zinc-400'}`}>Preview</button>
        </div>
      </div>
    </div>
  );
}