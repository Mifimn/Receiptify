import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Download, Share2, Plus, Trash2, ArrowLeft, Loader2, 
  Palette, Settings, Lock, AlertTriangle, User 
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { ReceiptData, ReceiptItem, ReceiptSettings } from '../types';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; 
import { useAuth } from '../lib/AuthContext'; 

export default function Generator() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const receiptRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // --- NEW: State for Customer Suggestions ---
  const [pastCustomers, setPastCustomers] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // -------------------------------------------

  const [data, setData] = useState<ReceiptData>({
    receiptNumber: '001',
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
    tagline: '',
    footerMessage: '',
    note: ''
  });

  const [settings, setSettings] = useState<ReceiptSettings>({
    color: '#09090b', 
    showLogo: true,
    template: 'detailed'
  });

  useEffect(() => {
    setIsClient(true);
    const initializeData = async () => {
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (user) {
        try {
          const { data: nextNum } = await supabase.rpc('get_next_receipt_number', { target_user_id: user.id });

          const { data: profile } = await supabase
            .from('profiles')
            .select('business_name, business_phone, currency, logo_url, tagline, footer_message')
            .eq('id', user.id)
            .single();

          if (profile) {
            setData(prev => ({
              ...prev,
              receiptNumber: nextNum || '001',
              date: today,
              businessName: profile.business_name || 'My Business',
              businessPhone: profile.business_phone || '',
              currency: profile.currency || '₦',
              logoUrl: profile.logo_url,
              tagline: profile.tagline || '', 
              footerMessage: profile.footer_message || '' 
            }));
          }

          // --- NEW: Fetch Past Customers ---
          const { data: receipts } = await supabase
            .from('receipts')
            .select('customer_name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (receipts) {
            // Filter unique names, remove blanks and "Walk-in"
            const uniqueNames = Array.from(new Set(
              receipts
                .map(r => r.customer_name)
                .filter(name => name && name.trim() !== '' && name !== 'Walk-in Customer')
            ));
            setPastCustomers(uniqueNames);
          }
          // ---------------------------------

        } catch (err) { console.error(err); }
      } else {
        setData(prev => ({ ...prev, date: today }));
      }
    };
    if (!authLoading) initializeData();
  }, [user, authLoading]);

  // --- NEW: Suggestion Handlers ---
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setData({ ...data, customerName: value });

    if (value.length > 0) {
      const matches = pastCustomers.filter(name => 
        name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(matches.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (name: string) => {
    setData({ ...data, customerName: name });
    setShowSuggestions(false);
  };
  // --------------------------------

  const saveToHistory = async () => {
    if (!user) return; 
    const subtotal = data.items.reduce((acc, i) => acc + ((Number(i.price)||0) * (Number(i.qty)||0)), 0);
    const numericTotal = subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0);

    const { error } = await supabase.from('receipts').insert([{
      user_id: user.id,
      receipt_number: data.receiptNumber,
      customer_name: data.customerName || 'Walk-in Customer',
      total_amount: numericTotal,
      shipping_fee: Number(data.shipping) || 0,
      discount_amount: Number(data.discount) || 0,
      status: data.status,
      payment_method: data.paymentMethod,
      items: data.items,
      created_at: new Date().toISOString()
    }]);
    if (error) throw error;
  };

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
    if (data.items.length === 1) return;
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const initiateAction = (action: () => void) => {
    if (!user) {
      if (confirm("Sign up for a free account to Download or Share?")) router.push('/login');
      return;
    }
    setPendingAction(() => action);
    setShowConfirm(true);
  };

  const confirmAndExecute = () => {
    setShowConfirm(false);
    if (pendingAction) pendingAction();
  };

  const generateImage = async () => {
    if (!receiptRef.current) return null;
    setIsGenerating(true);
    setActiveTab('preview');
    await new Promise(r => setTimeout(r, 400)); 
    try {
      return await toPng(receiptRef.current, { pixelRatio: 3, cacheBust: true });
    } catch (err) { return null; } finally { setIsGenerating(false); }
  };

  const handleDownload = async () => {
    try {
      const image = await generateImage();
      if (!image) return;
      await saveToHistory(); 
      const link = document.createElement('a');
      link.href = image;
      link.download = `receipt-${data.receiptNumber}.png`;
      link.click();
      router.push('/history');
    } catch (err: any) { alert(err.message); }
  };

  const handleShare = async () => {
    try {
      const image = await generateImage();
      if (!image) return;
      await saveToHistory();
      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], `receipt-${data.receiptNumber}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt #${data.receiptNumber}`,
          text: `Hello ${data.customerName || 'Customer'}, attached is your receipt.`,
        });
        router.push('/history');
      } else {
        const link = document.createElement('a');
        link.href = image;
        link.download = `receipt-${data.receiptNumber}.png`;
        link.click();
        alert("Sharing not supported. Image has been downloaded.");
        router.push('/history');
      }
    } catch (err: any) { console.error(err); }
  };

  const colors = ['#09090b', '#166534', '#1e40af', '#b45309', '#7e22ce', '#be123c', '#0891b2', '#854d0e'];
  if (!isClient || authLoading) return null;

  return (
    <div className="h-[100dvh] bg-zinc-100 flex flex-col overflow-hidden">
      <Head><title>Create Receipt | MifimnPay</title></Head>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Check details carefully</h3>
            <p className="text-sm text-zinc-500 mb-6">Are you sure the details are correct? This will be saved to your history.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="py-3 px-4 rounded-xl font-bold text-sm bg-zinc-100 text-zinc-600">Cancel</button>
              <button onClick={confirmAndExecute} className="py-3 px-4 rounded-xl font-bold text-sm bg-zinc-900 text-white">Save & Proceed</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-2">
            <Link href={user ? "/dashboard" : "/"} className="text-zinc-500 p-2 hover:bg-zinc-100 rounded-full transition-colors"><ArrowLeft size={22} /></Link>
            <h1 className="font-bold text-lg text-zinc-900 tracking-tight uppercase">New Receipt</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => initiateAction(handleShare)} disabled={isGenerating} className="bg-zinc-100 text-zinc-900 p-2.5 rounded-full shadow-sm active:scale-95 transition-all">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Share2 size={18} />}
            </button>
            <button onClick={() => initiateAction(handleDownload)} disabled={isGenerating} className="bg-zinc-900 text-white p-2.5 rounded-full shadow-sm active:scale-95 transition-all">
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : !user ? <Lock size={16} /> : <Download size={18} />}
            </button>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        <div className={`flex-1 h-full overflow-y-auto bg-zinc-50 p-4 md:p-6 space-y-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-10">
            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-50 pb-2"><Settings size={16} className="text-zinc-400" /> Details</h3>

              {/* --- MODIFIED: Customer Input with Suggestions --- */}
              <div className="relative">
                <input 
                  value={data.customerName} 
                  onChange={handleCustomerNameChange}
                  onFocus={() => { if(data.customerName) setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none font-medium bg-zinc-50 focus:bg-white transition-all text-base" 
                  placeholder="Customer Name"
                  autoComplete="off" 
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-3 py-2 bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                      Previous Customers
                    </div>
                    {filteredSuggestions.map((name, index) => (
                      <button
                        key={index}
                        onClick={() => selectCustomer(name)}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-2"
                      >
                        <User size={14} className="text-zinc-400" />
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* ----------------------------------------------- */}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-zinc-400 ml-1 mb-1">RECEIPT NO.</label>
                  <input value={data.receiptNumber} disabled className="w-full h-12 px-4 bg-zinc-100 rounded-xl text-zinc-900 font-bold" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-zinc-400 ml-1 mb-1 uppercase">Date</label>
                  <input value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl outline-none focus:border-zinc-900 bg-zinc-50 focus:bg-white text-base" />
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
                <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider">Items</h3>
                <button onClick={addItem} className="text-xs font-bold text-zinc-900 hover:bg-zinc-100 px-3 py-1 rounded-full transition-all">+ Add Item</button>
              </div>
              <div className="space-y-4">
                {data.items.map((item) => (
                  <div key={item.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 md:bg-transparent md:p-0 md:border-0 relative">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-zinc-400 mb-1 block md:hidden uppercase">Description</label>
                        <input placeholder="Item Name" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="w-full p-3 text-base border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none font-medium bg-white md:bg-zinc-50" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-20">
                          <label className="text-[10px] font-bold text-zinc-400 mb-1 block md:hidden uppercase">Qty</label>
                          <input type="number" placeholder="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full p-3 text-base border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none text-center font-bold bg-white md:bg-zinc-50" />
                        </div>
                        <div className="flex-1 md:w-32">
                          <label className="text-[10px] font-bold text-zinc-400 mb-1 block md:hidden uppercase">Price</label>
                          <input type="number" placeholder="0" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="w-full p-3 text-base border-2 border-zinc-100 rounded-xl focus:border-zinc-900 outline-none font-bold bg-white md:bg-zinc-50" />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-3 text-zinc-300 hover:text-red-500 self-end md:self-center transition-colors"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
               <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider">Fees & Method</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">Discount (Amount)</label>
                    <input type="number" placeholder="0" value={data.discount} onChange={(e) => setData({...data, discount: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl outline-none focus:border-zinc-900 bg-zinc-50 focus:bg-white text-base" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">Shipping (Amount)</label>
                    <input type="number" placeholder="0" value={data.shipping} onChange={(e) => setData({...data, shipping: e.target.value})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl outline-none focus:border-zinc-900 bg-zinc-50 focus:bg-white text-base" />
                  </div>
                  <select value={data.paymentMethod} onChange={(e) => setData({...data, paymentMethod: e.target.value as any})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl bg-white outline-none focus:border-zinc-900 text-sm">
                     <option>Transfer</option><option>Cash</option><option>POS</option>
                  </select>
                  <select value={data.status} onChange={(e) => setData({...data, status: e.target.value as any})} className="w-full h-12 px-4 border-2 border-zinc-100 rounded-xl bg-white outline-none focus:border-zinc-900 text-sm">
                     <option>Paid</option><option>Pending</option>
                  </select>
               </div>
            </section>
          </div>
        </div>

        <div className={`flex-1 h-full bg-zinc-200/50 flex flex-col relative ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-white/80 backdrop-blur-md border-b border-zinc-200 p-3 flex justify-between items-center z-10 shadow-sm shrink-0">
             <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
               {colors.map(c => (
                 <button key={c} onClick={() => setSettings({...settings, color: c})} className={`w-7 h-7 rounded-full border-2 transition-all ${settings.color === c ? 'border-zinc-900 scale-110' : 'border-white'}`} style={{ backgroundColor: c }} />
               ))}
             </div>
             <div className="flex gap-2">
               <button onClick={() => setSettings({...settings, showLogo: !settings.showLogo})} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${settings.showLogo ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>Logo</button>
               <button onClick={() => setSettings({...settings, template: settings.template === 'simple' ? 'detailed' : 'simple'})} className="px-3 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm border border-zinc-100 text-zinc-700">{settings.template === 'simple' ? 'Simple' : 'Detailed'}</button>
             </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-zinc-100/50 relative">
             <div className="scale-[0.85] md:scale-100 origin-center transition-transform">
               <ReceiptPreview data={data} settings={settings} receiptRef={receiptRef} />
             </div>
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex z-40 pb-safe shadow-lg">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'edit' ? 'text-zinc-900 bg-zinc-50' : 'text-zinc-400'}`}>Edit Details</button>
          <div className="w-[1px] bg-zinc-200 h-6 self-center"></div>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'preview' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400'}`}>Live Preview</button>
        </div>
      </div>
    </div>
  );
}