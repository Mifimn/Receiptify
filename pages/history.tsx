import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, Filter, Download, Trash2, Plus, 
  Calendar, CheckCircle2, Clock, XCircle, Loader2 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function History() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch real receipts from Supabase
  useEffect(() => {
    if (user) {
      const fetchReceipts = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) setReceipts(data);
        setLoading(false);
      };
      fetchReceipts();
    }
  }, [user]);

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      (receipt.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (receipt.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this receipt record?')) {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (!error) setReceipts(prev => prev.filter(r => r.id !== id));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Head><title>History | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Receipt History</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage and track all your past transactions.</p>
          </div>
          <Link href="/generate" className="bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={18} /> New Receipt
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" placeholder="Search customer or receipt ID..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border rounded-lg text-sm outline-none focus:border-zinc-900"
            />
          </div>
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 border text-zinc-700 text-sm rounded-lg p-2.5 outline-none w-full md:w-40"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b text-xs uppercase text-zinc-500 font-bold">
                  <th className="px-6 py-4">Receipt No.</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">{receipt.receipt_number}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(receipt.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-zinc-900">{receipt.customer_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900">{receipt.amount}</td>
                    <td className="px-6 py-4"><StatusBadge status={receipt.status} /></td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDelete(receipt.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = { Paid: "bg-green-100 text-green-700", Pending: "bg-yellow-100 text-yellow-700", Unpaid: "bg-red-100 text-red-700" };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || styles.Paid}`}>
      {status}
    </span>
  );
}
