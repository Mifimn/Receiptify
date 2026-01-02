import { useState } from 'react';
import Head from 'next/head'; // Fixed import
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

// 1. MOCK DATA
const initialReceipts = [
  { id: 'REC-9021', customer: 'Amina Yusuf', date: '02 Jan 2026', amount: '₦15,000', status: 'Paid', items: 'Lace Material (5 yards)' },
  { id: 'REC-9020', customer: 'Tunde Ednut', date: '01 Jan 2026', amount: '₦4,500', status: 'Pending', items: 'Delivery Fee' },
  { id: 'REC-9019', customer: 'Chioma Bakes', date: '01 Jan 2026', amount: '₦32,000', status: 'Paid', items: 'Wedding Cake Deposit' },
  { id: 'REC-9018', customer: 'Emmanuel K.', date: '31 Dec 2025', amount: '₦8,200', status: 'Unpaid', items: 'Logistics Service' },
  { id: 'REC-9017', customer: 'Mama Nkechi', date: '30 Dec 2025', amount: '₦125,000', status: 'Paid', items: 'Wholesale Rice (2 Bags)' },
  { id: 'REC-9016', customer: 'Guest User', date: '29 Dec 2025', amount: '₦2,000', status: 'Paid', items: 'Airtime' },
];

export default function History() {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 2. FILTERING LOGIC
  const filteredReceipts = receipts.filter(receipt => {
    // Search match
    const matchesSearch = 
      receipt.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
      receipt.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status match
    const matchesStatus = statusFilter === 'All' || receipt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 3. ACTIONS
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this receipt record?')) {
      setReceipts(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDownload = (id: string) => {
    alert(`Downloading receipt ${id}...`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Head>
        <title>History | Receiptify</title>
      </Head>

      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Receipt History</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage and track all your past transactions.</p>
          </div>
          <Link href="/generate" className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
            <Plus size={18} /> New Receipt
          </Link>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer or receipt ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Filter size={18} className="text-zinc-400" />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm rounded-lg p-2.5 focus:border-zinc-900 outline-none w-full md:w-40 cursor-pointer"
             >
               <option value="All">All Status</option>
               <option value="Paid">Paid</option>
               <option value="Pending">Pending</option>
               <option value="Unpaid">Unpaid</option>
             </select>
          </div>
        </div>

        {/* RECEIPTS TABLE */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                  <th className="px-6 py-4">Receipt No.</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-zinc-50/50 transition-colors group">
                      
                      {/* ID */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">{receipt.id}</span>
                      </td>
                      
                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-zinc-500 flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400" />
                        {receipt.date}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900">{receipt.customer}</p>
                        <p className="text-xs text-zinc-400 truncate max-w-[150px]">{receipt.items}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900">
                        {receipt.amount}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <StatusBadge status={receipt.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleDownload(receipt.id)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all" title="Download">
                             <Download size={16} />
                           </button>
                           <button onClick={() => handleDelete(receipt.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Delete">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-zinc-900">No receipts found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500">
            <span>Showing {filteredReceipts.length} results</span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 bg-white border border-zinc-200 rounded hover:bg-zinc-100 disabled:opacity-50">Previous</button>
              <button disabled className="px-3 py-1 bg-white border border-zinc-200 rounded hover:bg-zinc-100 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

// Sub-component for Status Indicators
function StatusBadge({ status }: { status: string }) {
  const styles = {
    Paid: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Unpaid: "bg-red-100 text-red-700 border-red-200"
  };

  const icons = {
    Paid: <CheckCircle2 size={12} />,
    Pending: <Clock size={12} />,
    Unpaid: <XCircle size={12} />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  );
}
