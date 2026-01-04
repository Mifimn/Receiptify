import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, Calendar, Loader2, ChevronDown, BarChart3, PieChart } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState('Vendor');
  const [isFetching, setIsFetching] = useState(true);
  
  // States for filters
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
        checkOnboarding();
        fetchDashboardData();
    }
  }, [user, loading, selectedYear, viewMode]);

  const checkOnboarding = async () => {
    const { data: profile } = await supabase.from('profiles').select('business_name').eq('id', user?.id).single();
    if (profile) setBusinessName(profile.business_name);
  }

  const fetchDashboardData = async () => {
    setIsFetching(true);
    try {
      // 1. Fetch ALL receipts to calculate years and yearly stats
      const { data: allReceipts } = await supabase
        .from('receipts')
        .select('total_amount, customer_name, created_at, receipt_number')
        .eq('user_id', user?.id);
      
      if (!allReceipts) return;

      // Extract unique years
      const years = Array.from(new Set(allReceipts.map(r => new Date(r.created_at).getFullYear())));
      setAvailableYears(years.length > 0 ? years.sort((a, b) => b - a) : [new Date().getFullYear()]);

      if (viewMode === 'monthly') {
        // Filter for current selected year
        const filtered = allReceipts.filter(r => new Date(r.created_at).getFullYear() === selectedYear);
        
        const total = filtered.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        const uniqueCustomers = new Set(filtered.map(r => r.customer_name)).size;
        setStats({ totalSales: total, count: filtered.length, customers: uniqueCustomers });

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyMap = filtered.reduce((acc: any, r) => {
          const m = months[new Date(r.created_at).getMonth()];
          acc[m] = (acc[m] || 0) + (Number(r.total_amount) || 0);
          return acc;
        }, {});

        setChartData(months.map(m => ({ name: m, total: monthlyMap[m] || 0 })));
        setRecentReceipts([...filtered].reverse().slice(0, 5));
      } else {
        // Yearly View Mode
        const yearlyMap = allReceipts.reduce((acc: any, r) => {
          const y = new Date(r.created_at).getFullYear();
          acc[y] = (acc[y] || 0) + (Number(r.total_amount) || 0);
          return acc;
        }, {});

        const totalAllTime = allReceipts.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        setStats({ totalSales: totalAllTime, count: allReceipts.length, customers: new Set(allReceipts.map(r => r.customer_name)).size });

        setChartData(Object.keys(yearlyMap).sort().map(y => ({ name: y, total: yearlyMap[y] })));
        setRecentReceipts([...allReceipts].reverse().slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans text-zinc-900">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-black tracking-tight leading-none mb-2">Business Overview</h1>
                <p className="text-zinc-500 font-medium">Tracking revenue for {businessName}.</p>
            </motion.div>

            <div className="flex items-center gap-3 bg-white p-1.5 rounded-[22px] border border-zinc-200 shadow-sm">
                <button 
                  onClick={() => setViewMode('monthly')}
                  className={`px-5 py-2.5 rounded-[18px] text-xs font-black transition-all ${viewMode === 'monthly' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setViewMode('yearly')}
                  className={`px-5 py-2.5 rounded-[18px] text-xs font-black transition-all ${viewMode === 'yearly' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  Yearly
                </button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title={viewMode === 'monthly' ? `Revenue (${selectedYear})` : "Total Revenue"} value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-green-600" />
          <StatsCard title="Receipts Issued" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-600" />
          <StatsCard title="Unique Customers" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-600" />
        </div>

        {/* Sales Chart Analysis */}
        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
                <h3 className="font-black text-zinc-900 text-xl tracking-tight">Revenue Analytics</h3>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                    {viewMode === 'monthly' ? `Month-by-month for ${selectedYear}` : 'Year-over-year performance'}
                </p>
            </div>

            {viewMode === 'monthly' && (
                <div className="relative">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="appearance-none bg-zinc-50 border-2 border-zinc-100 rounded-2xl pl-10 pr-10 py-3 font-bold text-sm outline-none focus:border-zinc-900 transition-all cursor-pointer"
                    >
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                </div>
            )}
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'monthly' ? (
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#09090b" stopOpacity={0.08}/>
                            <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#a1a1aa', fontWeight: 800}} dy={15} />
                    <YAxis hide />
                    <Tooltip 
                        cursor={{ stroke: '#e4e4e7', strokeWidth: 2 }}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                        formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#09090b" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#a1a1aa', fontWeight: 800}} dy={15} />
                    <YAxis hide />
                    <Tooltip 
                        cursor={{fill: '#f4f4f5', radius: 12}}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                        formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="total" fill="#09090b" radius={[12, 12, 12, 12]} barSize={60} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity and CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-black text-zinc-900 text-xl tracking-tight">Recent Activity</h3>
                <Link href="/history" className="text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors">View All</Link>
            </div>
            <div className="bg-white border border-zinc-200 rounded-[40px] overflow-hidden shadow-sm">
              {recentReceipts.length > 0 ? (
                <div className="divide-y divide-zinc-50">
                  {recentReceipts.map((r, i) => (
                    <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-all cursor-default group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-zinc-100 rounded-[22px] flex items-center justify-center text-zinc-400 font-black text-xl uppercase group-hover:bg-zinc-950 group-hover:text-white transition-all">{r.customer_name[0]}</div>
                        <div>
                          <p className="font-black text-zinc-900 text-base leading-none mb-1.5">{r.customer_name}</p>
                          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-zinc-900 text-lg">₦{Number(r.total_amount).toLocaleString()}</p>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-24 text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PieChart className="text-zinc-200" size={32} />
                    </div>
                    <p className="text-zinc-400 font-bold">No transactions recorded for this period.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
              <div className="bg-zinc-950 rounded-[40px] p-10 text-white shadow-2xl border border-white/5 relative overflow-hidden group h-full flex flex-col justify-center">
                <div className="relative z-10">
                    <h4 className="text-3xl font-black mb-4 tracking-tighter">Ready to sell?</h4>
                    <p className="text-zinc-400 text-sm mb-10 leading-relaxed font-medium">Create a professional receipt for your customer in under 30 seconds.</p>
                    <button onClick={() => router.push('/generate')} className="w-full py-5 bg-white text-zinc-950 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-[0.97] shadow-xl shadow-white/10">
                    <Plus size={24} strokeWidth={4}/> New Receipt
                    </button>
                </div>
                <div className="absolute -bottom-10 -right-10 p-4 opacity-[0.03] group-hover:scale-110 transition-transform text-white">
                    <BarChart3 size={240} />
                </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-14 h-14 bg-zinc-50 rounded-[22px] flex items-center justify-center mb-8 ${color} border border-zinc-100 shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] text-zinc-400 mb-2 font-black uppercase tracking-[0.25em]">{title}</p>
      <h3 className="text-3xl font-black text-zinc-950 tracking-tighter">{value}</h3>
    </div>
  );
}
