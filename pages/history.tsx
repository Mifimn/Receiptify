import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, Download, Plus, Calendar, Loader2, Eye, X, CheckCircle2, Clock 
} from 'lucide-react';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
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

  const handleUpdateStatus = async (id: string) => {
    setIsUpdating(id);
    try {
      const { error } = await supabase
        .from('receipts')
        .update({ status: 'paid' })
        .eq('id', id);

      if (error) throw error;

      // Update local state to remove the button and change text
      setReceipts(receipts.map(r => r.id === id ? { ...r, status: 'paid' } : r));
      
      // If the receipt being viewed in the modal is this one, update it too
      if (selectedReceipt?.id === id) {
        setSelectedReceipt({ ...selectedReceipt, status: 'paid' });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDownloadAgain = async () => {
    if (!downloadRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(downloadRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `receipt-${selectedReceipt.receipt_number}.png`;
      link.click();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsDownloading(false); 
    }
  };

  const filteredReceipts = receipts.filter(r => 
    (r.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Receipt History</h1>
          <Link href="/generate" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all hover:scale-95"><Plus size={16} /> New Receipt</Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customer or receipt ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full md:w-96 pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-900 transition-colors" 
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] uppercase text-zinc-400 font-black tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5">Receipt ID</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr><td colSpan={6} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></td></tr>
                ) : filteredReceipts.length > 0 ? (
                  filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50 group transition-colors">
                      <td className="px-6 py-5 font-mono text-[10px] font-bold text-zinc-400">#{r.receipt_number}</td>
                      <td className="px-6 py-5 text-xs font-bold text-zinc-500">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-5 font-black text-sm uppercase tracking-tight">{r.customer_name}</td>
                      <td className="px-6 py-5 text-sm font-black">₦{Number(r.total_amount).toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                          r.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {r.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span className="text-[9px] font-black uppercase tracking-widest">{r.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right flex justify-end gap-2">
                        {r.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(r.id)}
                            disabled={isUpdating === r.id}
                            className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-all disabled:opacity-50"
                          >
                            {isUpdating === r.id ? <Loader2 size={10} className="animate-spin" /> : "Mark Paid"}
                          </button>
                        )}
                        <button onClick={() => setSelectedReceipt(r)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-all bg-zinc-50 rounded-md"><Eye size={16}/></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-24 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest italic">No history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL VIEW */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-zinc-200">
                <div className="p-4 border-b flex justify-between items-center bg-white">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Previewing Receipt</h3>
                      <p className="text-sm font-black uppercase tracking-tighter">#{selectedReceipt.receipt_number}</p>
                    </div>
                    <button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 flex flex-col items-center">
                    <div className="scale-90 origin-top bg-white shadow-xl rounded-sm">
                        <ReceiptPreview 
                            data={{
                                ...selectedReceipt,
                                customerName: selectedReceipt.customer_name,
                                receiptNumber: selectedReceipt.receipt_number,
                                currency: '₦',
                                businessName: profile?.business_name || 'Business Name',
                                businessPhone: profile?.business_phone || '',
                                logoUrl: profile?.logo_url,
                                tagline: profile?.tagline || '',
                                footerMessage: profile?.footer_message || '',
                                shipping: Number(selectedReceipt.shipping_fee || 0),
                                discount: Number(selectedReceipt.discount_amount || 0),
                                items: selectedReceipt.items || [],
                                date: new Date(selectedReceipt.created_at).toLocaleDateString('en-GB'),
                                status: selectedReceipt.status // Pass current status to preview
                            }} 
                            settings={{ color: '#09090b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>
                <div className="p-4 border-t flex gap-3 bg-white">
                    <button onClick={() => setSelectedReceipt(null)} className="flex-1 py-3 bg-zinc-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors hover:bg-zinc-200">Close</button>
                    <button 
                        onClick={handleDownloadAgain} 
                        disabled={isDownloading} 
                        className="flex-[2] py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                    >
                        {isDownloading ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={16} />} Download Image
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
