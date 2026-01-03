import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Download, Share2, Plus, Loader2, Eye, X, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import html2canvas from 'html2canvas';

export default function History() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
        fetchReceipts();
        fetchProfile();
    }
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

  const generateImage = async () => {
    if (!downloadRef.current) return null;
    setIsGenerating(true);
    
    // Crucial: Wait for fonts and table layout to settle
    await new Promise(r => setTimeout(r, 800));

    try {
      const canvas = await html2canvas(downloadRef.current, { 
        scale: 4, 
        useCORS: true,
        backgroundColor: null,
        width: 300, // Lock width for capture
        height: downloadRef.current.offsetHeight,
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
    const link = document.createElement('a');
    link.href = image;
    link.download = `receipt-${selectedReceipt.receipt_number}.png`;
    link.click();
  };

  const handleShare = async () => {
    const image = await generateImage();
    if (!image) return;
    try {
        const res = await fetch(image);
        const blob = await res.blob();
        const file = new File([blob], `receipt-${selectedReceipt.receipt_number}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Receipt',
                text: 'Your receipt is ready.',
            });
        } else {
            handleDownload();
        }
    } catch (err) { console.error(err); }
  };

  const filteredReceipts = receipts.filter(r => 
    (r.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ).filter(r => statusFilter === 'All' || r.status === statusFilter);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl font-black text-zinc-900">Receipt History</h1>
          <Link href="/generate" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95">
            <Plus size={18} /> New Receipt
          </Link>
        </div>

        {/* RESTORED FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search name or ID..." 
                    className="w-full h-12 pl-12 pr-4 bg-white border border-zinc-200 rounded-2xl outline-none focus:border-zinc-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-4">
                <select 
                    className="h-12 px-4 bg-white border border-zinc-200 rounded-2xl outline-none focus:border-zinc-900 font-bold text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] uppercase text-zinc-400 font-black tracking-widest">
                <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></td></tr>
                ) : filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50 group transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500">#{r.receipt_number}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{r.customer_name}</td>
                    <td className="px-6 py-4 text-sm font-black text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedReceipt(r)} className="p-3 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all"><Eye size={18}/></button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-white/20">
                <div className="p-6 border-b flex justify-between items-center bg-white">
                    <h3 className="font-black text-zinc-900 text-lg">Receipt Details</h3>
                    <button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-zinc-50 flex flex-col items-center">
                    <div className="scale-[0.9] md:scale-110 origin-top bg-white p-1 rounded shadow-xl">
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt,
                                customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number,
                                businessName: profile?.business_name,
                                businessPhone: profile?.business_phone,
                                logoUrl: profile?.logo_url,
                                currency: profile?.currency || '₦',
                                shipping: Number(selectedReceipt.shipping_fee || 0),
                                discount: Number(selectedReceipt.discount_amount || 0),
                                items: selectedReceipt.items || [],
                                date: new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')
                            }} 
                            settings={{ color: profile?.theme_color || '#09090b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>

                <div className="p-8 bg-white border-t flex flex-col gap-4">
                    <button onClick={handleShare} disabled={isGenerating} className="w-full py-5 bg-zinc-100 text-zinc-900 font-black rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                        {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <><Share2 size={20} /> Share Receipt</>}
                    </button>
                    <button onClick={handleDownload} disabled={isGenerating} className="w-full py-5 bg-zinc-900 text-white font-black rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-zinc-200">
                        {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <><Download size={20} /> Download PNG</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
