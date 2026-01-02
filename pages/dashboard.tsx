import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  FileText, 
  ArrowUpRight, 
  MoreHorizontal,
  Search
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

// MOCK DATA (Since no backend yet)
const recentReceipts = [
  { id: 'REC-001', customer: 'Amina Yusuf', amount: '₦12,500', date: 'Just now', status: 'Paid' },
  { id: 'REC-002', customer: 'Tunde Ednut', amount: '₦45,000', date: '2 hrs ago', status: 'Pending' },
  { id: 'REC-003', customer: 'Chioma Bakes', amount: '₦8,200', date: 'Yesterday', status: 'Paid' },
  { id: 'REC-004', customer: 'Unknown User', amount: '₦2,000', date: 'Yesterday', status: 'Paid' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <Head>
        <title>Dashboard | Receiptify</title>
      </Head>

      <DashboardNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* 1. Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-brand-black">Good morning, Mama Tunde 👋</h1>
          <p className="text-brand-gray text-sm">Here is what is happening with your business today.</p>
        </motion.div>

        {/* 2. Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Total Sales (Sept)" 
            value="₦450,200" 
            icon={<TrendingUp size={20} />} 
            trend="+12% from last month"
          />
          <StatsCard 
            title="Receipts Generated" 
            value="142" 
            icon={<FileText size={20} />} 
            trend="+5 today"
          />
           <StatsCard 
            title="Active Customers" 
            value="89" 
            icon={<Users size={20} />} 
            trend="3 new this week"
          />
        </div>

        {/* 3. Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/generate" className="group">
            <div className="bg-brand-black hover:bg-zinc-800 text-white p-6 rounded-2xl flex items-center justify-between transition-all shadow-lg shadow-black/10">
              <div>
                <h3 className="text-lg font-bold mb-1">Create New Receipt</h3>
                <p className="text-zinc-400 text-sm">Generate and send in seconds.</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
            </div>
          </Link>

          <Link href="/customers" className="group">
            <div className="bg-white border border-zinc-200 hover:border-brand-black p-6 rounded-2xl flex items-center justify-between transition-all">
              <div>
                <h3 className="text-lg font-bold text-brand-black mb-1">View Customers</h3>
                <p className="text-brand-gray text-sm">Manage your contact list.</p>
              </div>
              <div className="w-10 h-10 bg-zinc-100 text-brand-black rounded-full flex items-center justify-center group-hover:bg-brand-black group-hover:text-white transition-all">
                <Users size={20} />
              </div>
            </div>
          </Link>
        </div>

        {/* 4. Recent Activity Table */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h3 className="font-bold text-brand-black text-lg">Recent Receipts</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search receipt..." 
                className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/10 w-full md:w-64 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-brand-gray font-medium">
                <tr>
                  <th className="px-6 py-3">Receipt ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentReceipts.map((receipt, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-brand-gray">{receipt.id}</td>
                    <td className="px-6 py-4 font-medium text-brand-black">{receipt.customer}</td>
                    <td className="px-6 py-4 font-bold text-brand-black">{receipt.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        receipt.status === 'Paid' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-gray">{receipt.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-brand-gray hover:text-brand-black p-2 hover:bg-zinc-100 rounded-full transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 text-center">
            <Link href="/history" className="text-sm font-medium text-brand-black hover:underline flex items-center justify-center gap-1">
              View All History <ArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

      </main>
    </div>
  );
}

// Helper Component for Stats
function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-brand-bg rounded-xl text-brand-black">
          {icon}
        </div>
        <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm text-brand-gray mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-brand-black">{value}</h3>
      </div>
    </div>
  );
}