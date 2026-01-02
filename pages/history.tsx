import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/head';
import { Search, Filter, Download, Trash2, Plus, Calendar, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function History() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const fetchReceipts = async () => {
        const { data } = await supabase.from('receipts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setReceipts(data);
        setLoading(false);
      };
      fetchReceipts();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this record?')) {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (!error) setReceipts(receipts.filter(r => r.id !== id));
    }
  };

  const filtered = receipts.filter(r => r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">History</h1>
            <input type="text" placeholder="Search customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border p-2 rounded-lg text-sm" />
        </div>
        
        {loading ? <Loader2 className="animate-spin mx-auto" /> : (
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr className="text-zinc-500 font-bold uppercase text-xs">
                  <th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-mono text-xs">{r.receipt_number}</td>
                    <td className="p-4 font-bold">{r.customer_name}</td>
                    <td className="p-4">{r.amount}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">{r.status}</span></td>
                    <td className="p-4 text-right"><button onClick={() => handleDelete(r.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}