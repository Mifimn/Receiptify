import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, Download, Plus, Calendar, Loader2, Eye, X, CheckCircle 
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
  const [isUpdating, setIsUpdating] = useState(false); // New state for status update
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

  // Function to update status from pending to paid
  const handleUpdateStatus = async (id: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('receipts')
        .update({ status: 'paid' })
        .eq('id', id);

      if (error) throw error;

      // Update local state to remove the button and update preview
      setReceipts(receipts.map(r => r.id === id ? { ...r, status: 'paid' } : r));
      setSelectedReceipt({ ...selectedReceipt, status: 'paid' });
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
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
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Receipt History</h1>
          <Link href="/generate" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"><Plus size={18} /> New Receipt</Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 mb-6">
          <input 
            type="text" 
            placeholder="Search customer or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full md:w-96 px-4 py-2 bg-zinc-50 border rounded-lg text-sm outline-none focus:border-zinc-900" 
          />
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-zinc-50 border-b text-xs uppercase text-zinc-500 font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></td></tr>
              ) : filteredReceipts.length > 0 ? (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/50 group transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500">{r.receipt_number}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{r.customer_name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedReceipt(r)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-all"><Eye size={16}/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-20 text-center text-zinc-400 italic">No history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
                    <h3 className="font-bold">Receipt Details</h3>
                    <button onClick={() => setSelectedReceipt(null)} className="p-1 hover:bg-zinc-200 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-100/50 flex flex-col items-center">
                    <div className="scale-90 origin-top">
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
                                date: new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')
                            }} 
                            settings={{ color: '#09090b', showLogo: true, template: 'detailed' }} 
                            receiptRef={downloadRef} 
                        />
                    </div>
                </div>
                <div className="p-4 border-t flex flex-wrap gap-3 bg-white">
                    {/* Mark as Paid Button (Only visible if pending) */}
                    {selectedReceipt.status === 'pending' && (
                      <button 
                          onClick={() => handleUpdateStatus(selectedReceipt.id)} 
                          disabled={isUpdating}
                          className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-sm shadow-green-200"
                      >
                          {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle size={18} />} Mark as Paid
                      </button>
                    )}
                    
                    <button 
                        onClick={handleDownloadAgain} 
                        disabled={isDownloading} 
                        className={`${selectedReceipt.status === 'pending' ? 'w-full order-last md:order-none md:flex-1' : 'flex-[2]'} py-3 bg-zinc-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all`}
                    >
                        {isDownloading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download size={18} />} Download Image
                    </button>

                    <button onClick={() => setSelectedReceipt(null)} className="flex-1 py-3 bg-zinc-100 font-bold rounded-xl transition-colors hover:bg-zinc-200">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
