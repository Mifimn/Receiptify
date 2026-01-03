import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Plus, Loader2, Eye, X, Search, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import { toPng } from 'html-to-image';

export default function History() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) { fetchReceipts(); fetchProfile(); }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
    if (data) setProfile(data);
  };

  const fetchReceipts = async () => {
    setLoading(true);
    const { data } = await supabase.from('receipts').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
    if (data) setReceipts(data);
    setLoading(false);
  };

  const handleAction = async (type: 'download' | 'share') => {
    if (!downloadRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(downloadRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
      if (type === 'download') {
        const link = document.createElement('a'); link.href = dataUrl; link.download = `receipt.png`; link.click();
      } else {
        const res = await fetch(dataUrl); const blob = await res.blob();
        const file = new File([blob], 'receipt.png', { type: 'image/png' });
        if (navigator.share) await navigator.share({ files: [file], title: 'Receipt' });
      }
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const filtered = receipts.filter(r => r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-50">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-none">Activity</h1>
          <Link href="/generate" className="bg-zinc-900 text-white px-8 py-4 rounded-[20px] font-black flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-zinc-200">
            <Plus size={22} /> New Receipt
          </Link>
        </header>

        <div className="relative mb-10 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={22} />
            <input 
                type="text" placeholder="Search customer name..." 
                className="w-full h-16 pl-16 pr-8 bg-white border border-zinc-100 rounded-[24px] outline-none shadow-sm focus:shadow-xl transition-all font-bold"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="space-y-4">
            {loading ? (
                <div className="py-20 text-center flex flex-col items-center gap-4 text-zinc-300">
                    <Loader2 className="animate-spin" size={32} />
                    <span className="font-black text-sm uppercase tracking-widest">Loading...</span>
                </div>
            ) : filtered.map((r, idx) => (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    key={r.id} onClick={() => setSelectedReceipt(r)}
                    className="bg-white p-6 rounded-[28px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center justify-between"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400"><Clock size={24} /></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">#{r.receipt_number}</span>
                            <span className="text-lg font-black text-zinc-900">{r.customer_name}</span>
                        </div>
                    </div>
                    <span className="text-xl font-black text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</span>
                </motion.div>
            ))}
        </div>
      </main>

      <AnimatePresence>
        {selectedReceipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center bg-white shrink-0">
                    <h3 className="text-2xl font-black text-zinc-900 leading-none">Receipt Preview</h3>
                    <button onClick={() => setSelectedReceipt(null)} className="p-3 hover:bg-zinc-100 rounded-full transition-colors"><X size={28}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-zinc-50 flex flex-col items-center">
                    <div className="scale-100 bg-white p-1 rounded-sm shadow-2xl shrink-0 overflow-hidden" ref={downloadRef}>
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt, customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number, businessName: profile?.business_name,
                                businessPhone: profile?.business_phone, logoUrl: profile?.logo_url, currency: '₦',
                                items: selectedReceipt.items || [], date: new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')
                            }} 
                            settings={{ color: profile?.theme_color || '#09090b', showLogo: true, template: 'detailed' }} 
                        />
                    </div>
                </div>

                <div className="p-10 bg-white border-t flex flex-col gap-4 shrink-0">
                    <button onClick={() => handleAction('share')} disabled={isGenerating} className="w-full py-5 bg-zinc-100 text-zinc-900 font-black rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all text-lg leading-none">
                        {isGenerating ? <Loader2 className="animate-spin w-6 h-6" /> : <><Share2 size={24} /> Share Receipt</>}
                    </button>
                    <button onClick={() => handleAction('download')} disabled={isGenerating} className="w-full py-5 bg-zinc-900 text-white font-black rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-zinc-200 text-lg leading-none">
                        {isGenerating ? <Loader2 className="animate-spin w-6 h-6" /> : <><Download size={24} /> Download PNG</>}
                    </button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
