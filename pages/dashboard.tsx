import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, ArrowUpRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
// Import Recharts components
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchDashboardData();
  }, [user, loading]);

  const fetchDashboardData = async () => {
    setIsFetching(true);
    try {
      const { data: receipts } = await supabase
        .from('receipts')
        .select('total_amount, customer_name, created_at, receipt_number')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (receipts) {
        // 1. Calculate General Stats
        const total = receipts.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        const uniqueCustomers = new Set(receipts.map(r => r.customer_name)).size;
        setStats({ totalSales: total, count: receipts.length, customers: uniqueCustomers });

        // 2. Format Data for Chart (Group by Month)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = receipts.reduce((acc: any, r) => {
          const date = new Date(r.created_at);
          const monthName = months[date.getMonth()];
          acc[monthName] = (acc[monthName] || 0) + (Number(r.total_amount) || 0);
          return acc;
        }, {});

        const formattedChartData = months.map(m => ({
          name: m,
          total: monthlyData[m] || 0
        }));
        
        setChartData(formattedChartData);
        setRecentReceipts([...receipts].reverse().slice(0, 5));
      }
    } catch (err) { console.error(err); }
    finally { setIsFetching(false); }
  };

  if (loading || isFetching) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-zinc-900">Analysis & Overview</h1>
          <p className="text-zinc-500 text-sm">Review your business trends and performance.</p>
        </motion.div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Revenue" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-green-600" />
          <StatsCard title="Receipts" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-600" />
          <StatsCard title="Customers" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-600" />
        </div>

        {/* --- SALES ANALYSIS CHART --- */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-zinc-900">Revenue Trend</h3>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Monthly Analysis</p>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#09090b" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Receipts List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-zinc-900">Recent Activity</h3>
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              {recentReceipts.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {recentReceipts.map((r, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold uppercase">{r.customer_name[0]}</div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{r.customer_name}</p>
                          <p className="text-xs text-zinc-400">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-400 italic text-sm">No activity recorded.</div>
              )}
            </div>
          </div>

          {/* Quick Action Panel */}
          <div className="bg-zinc-900 rounded-2xl p-8 text-white h-fit shadow-xl shadow-zinc-200">
             <h4 className="text-xl font-bold mb-2">Ready to grow?</h4>
             <p className="text-sm text-zinc-400 mb-8 leading-relaxed">Continue generating professional receipts to see more detailed insights into your customer behavior.</p>
             <button onClick={() => router.push('/generate')} className="w-full py-4 bg-white text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all">
               <Plus size={18}/> Create New Receipt
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-zinc-50 rounded-xl ${color}`}>{icon}</div>
      </div>
      <p className="text-sm text-zinc-500 mb-1 font-medium">{title}</p>
      <h3 className="text-2xl font-black text-zinc-900">{value}</h3>
    </div>
  );
}
