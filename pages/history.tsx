import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Download, Share2, Trash2, Plus, 
  Loader2, Eye, X 
} from 'lucide-react';
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
    // Increased timeout to ensure clean rendering before capture
    await new Promise(r => setTimeout(r, 600));
    try {
      const canvas = await html2canvas(downloadRef.current, { 
        scale: 4, // Increased scale for better text quality
        useCORS: true,
        backgroundColor: null
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
                title: `Receipt #${selectedReceipt.receipt_number}`,
                text: `Hello, here is your receipt from ${profile?.business_name || 'MifimnPay'}.`,
            });
        } else {
            handleDownload();
            alert("Sharing not supported on this browser. Image has been downloaded.");
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Receipt History</h1>
          <Link href="/generate" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm"><Plus size={18} /> New Receipt</Link>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-zinc-50 border-b text-xs uppercase text-zinc-500 font-bold">
              <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Total Amount</th><th className="px-6 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></td></tr>
              ) : filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/50 group transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500">{r.receipt_number}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-6 py-4 font-bold text-zinc-900">{r.customer_name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedReceipt(r)} className="p-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-900 hover:text-white transition-all"><Eye size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
                    <h3 className="font-bold text-zinc-800">View Receipt Details</h3>
                    <button onClick={() => setSelectedReceipt(null)} className="p-1 hover:bg-zinc-200 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-100/50 flex flex-col items-center">
                    <div className="scale-90 origin-top">
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt,
                                customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number,
                                businessName: profile?.business_name || 'Business Name',
                                businessPhone: profile?.business_phone || '',
                                logoUrl: profile?.logo_url,
                                currency: profile?.currency || '₦',
                                shipping: Number(selectedReceipt.shipping_fee || 0),
                                discount: Number(selectedReceipt.discount_amount || 0),
                                items: selectedReceipt.items || []
                            }} 
                            settings={{ color: profile?.theme_color || '#09090b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>
                <div className="p-4 border-t flex gap-3">
                    <button 
                        onClick={handleShare} 
                        disabled={isGenerating} 
                        className="flex-1 py-3 bg-zinc-100 text-zinc-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all"
                    >
                        {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <><Share2 size={18} /> Share</>}
                    </button>
                    <button 
                        onClick={handleDownload} 
                        disabled={isGenerating} 
                        className="flex-[2] py-3 bg-zinc-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                        {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <><Download size={18} /> Download Image</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
