import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, Loader2, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState('Vendor');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) checkOnboardingAndFetch();
  }, [user, loading, view]); // Re-run when view changes

  const checkOnboardingAndFetch = async () => {
    setIsFetching(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name')
        .eq('id', user?.id)
        .single();

      if (!profile?.business_name || profile.business_name === 'My Business') {
        router.push('/onboarding');
        return;
      }
      setBusinessName(profile.business_name);

      const { data: receipts } = await supabase
        .from('receipts')
        .select('total_amount, customer_name, created_at, receipt_number')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (receipts) {
        const total = receipts.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        const uniqueCustomers = new Set(receipts.map(r => r.customer_name)).size;
        setStats({ totalSales: total, count: receipts.length, customers: uniqueCustomers });

        if (view === 'monthly') {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthlyMap = receipts.reduce((acc: any, r) => {
            const m = months[new Date(r.created_at).getMonth()];
            acc[m] = (acc[m] || 0) + (Number(r.total_amount) || 0);
            return acc;
          }, {});
          setChartData(months.map(m => ({ name: m, total: monthlyMap[m] || 0 })));
        } else {
          const yearlyMap = receipts.reduce((acc: any, r) => {
            const y = new Date(r.created_at).getFullYear().toString();
            acc[y] = (acc[y] || 0) + (Number(r.total_amount) || 0);
            return acc;
          }, {});
          // Sort years numerically
          const sortedYears = Object.keys(yearlyMap).sort((a, b) => Number(a) - Number(b));
          setChartData(sortedYears.map(y => ({ name: y, total: yearlyMap[y] || 0 })));
        }

        setRecentReceipts([...receipts].reverse().slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  if (loading || isFetching) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Business Overview</h1>
            <p className="text-zinc-500 font-medium">Performance tracking for {businessName}.</p>
          </motion.div>
          
          <div className="flex bg-zinc-200/50 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'monthly' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setView('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'yearly' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Revenue" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-green-600" />
          <StatsCard title="Receipts Issued" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-600" />
          <StatsCard title="Active Customers" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-600" />
        </div>

        {/* Sales Chart Analysis */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">Revenue Trend</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.15em]">{view} Sales Performance</p>
            </div>
            <Calendar className="text-zinc-300" size={20} />
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090b" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 600}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#d1d5db', fontWeight: 600}} 
                  tickFormatter={(val) => `₦${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                />
                <Tooltip 
                  cursor={{ stroke: '#09090b', strokeWidth: 1, strokeDasharray: '5 5' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 800, color: '#09090b' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#09090b" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-zinc-900 text-lg">Recent Activity</h3>
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              {recentReceipts.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {recentReceipts.map((r, i) => (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600 font-black text-lg uppercase">{r.customer_name[0]}</div>
                        <div>
                          <p className="font-bold text-zinc-900">{r.customer_name}</p>
                          <p className="text-xs text-zinc-400 font-bold tracking-tight">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="font-black text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-zinc-400 italic font-medium">No transactions recorded yet.</div>
              )}
            </div>
          </div>

          <div className="bg-zinc-950 rounded-3xl p-8 text-white h-fit shadow-2xl shadow-zinc-200 border border-white/5">
             <h4 className="text-2xl font-black mb-3">Ready to bill?</h4>
             <p className="text-zinc-400 text-sm mb-10 leading-relaxed font-medium">Issue professional, branded receipts to your customers in seconds.</p>
             <button onClick={() => router.push('/generate')} className="w-full py-5 bg-white text-zinc-950 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all active:scale-[0.97]">
               <Plus size={22} strokeWidth={3}/> New Receipt
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
      <div className={`w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 ${color} border border-zinc-100`}>
        {icon}
      </div>
      <p className="text-sm text-zinc-400 mb-1 font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-zinc-950 tracking-tight">{value}</h3>
    </div>
  );
}
