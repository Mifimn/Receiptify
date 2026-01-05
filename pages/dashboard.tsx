import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, Loader2, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ProfileAlert from '../components/dashboard/ProfileAlert'; // Added this back

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // State for data
  const [yearReceipts, setYearReceipts] = useState<any[]>([]); // Only fetch ONE year at a time
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 }); // Global stats
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState('Vendor');
  const [isFetching, setIsFetching] = useState(true);

  // Filters
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
        checkProfile();
        fetchGlobalStats(); // Fast RPC call
    }
  }, [user, loading]);

  // Refetch chart data whenever Year changes
  useEffect(() => {
    if (user) fetchYearlyData(selectedYear);
  }, [user, selectedYear]);

  // 1. Check Profile & Business Name
  const checkProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name')
        .eq('id', user?.id)
        .single();

      if (profile) setBusinessName(profile.business_name || 'My Business');
    } catch (err) { console.error(err); }
  };

  // 2. Fetch Global Stats (Total Revenue/Count) using RPC
  // This is the "Time Bomb" fix. It calculates totals on the server.
  const fetchGlobalStats = async () => {
    try {
      const { data: statsData } = await supabase.rpc('get_dashboard_stats', { target_user_id: user?.id });

      // Fetch recent 5 for the list
      const { data: recent } = await supabase
        .from('receipts')
        .select('total_amount, customer_name, created_at, receipt_number')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (statsData) {
        setStats(prev => ({
            ...prev,
            totalSales: statsData.total_revenue || 0,
            count: statsData.total_receipts || 0
        }));
      }
      if (recent) setRecentReceipts(recent);
    } catch (err) { console.error(err); }
  };

  // 3. Fetch Chart Data (Specific Year Only)
  // Prevents downloading 5 years of data when you only need 2026
  const fetchYearlyData = async (year: number) => {
    setIsFetching(true);
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data } = await supabase
        .from('receipts')
        .select('total_amount, created_at, customer_name')
        .eq('user_id', user?.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (data) {
        setYearReceipts(data);
        // Calculate unique customers for THIS year
        const unique = new Set(data.map(r => r.customer_name)).size;
        setStats(prev => ({ ...prev, customers: unique }));
      }
    } catch (err) { console.error(err); } 
    finally { setIsFetching(false); }
  };

  // Memoized Chart Calculation
  const chartData = useMemo(() => {
    if (selectedMonth === "all") {
      // Monthly View
      return months.map((m, index) => {
        const total = yearReceipts
          .filter(r => new Date(r.created_at).getMonth() === index)
          .reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        return { name: m, total };
      });
    } else {
      // Daily View
      const monthIndex = months.indexOf(selectedMonth);
      const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();

      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const total = yearReceipts
          .filter(r => {
            const d = new Date(r.created_at);
            return d.getMonth() === monthIndex && d.getDate() === day;
          })
          .reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        return { name: `${day}`, total };
      });
    }
  }, [yearReceipts, selectedYear, selectedMonth]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      <ProfileAlert />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Business Overview</h1>
            <p className="text-zinc-500 font-medium">Performance tracking for {businessName}.</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-white border border-zinc-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/5 cursor-pointer shadow-sm"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
            </div>

            <div className="relative">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-zinc-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/5 cursor-pointer shadow-sm"
              >
                <option value="all">Full Year (Monthly)</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Revenue" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-green-600" />
          <StatsCard title="Receipts Issued" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-600" />
          <StatsCard title="Active Customers (Year)" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-600" />
        </div>

        {/* Sales Chart Analysis */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">
                {selectedMonth === "all" ? `Revenue Trend (${selectedYear})` : `${selectedMonth} ${selectedYear} Daily Breakdown`}
              </h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.15em]">
                {selectedMonth === "all" ? "Monthly Cumulative" : "Daily Sales Tracking"}
              </p>
            </div>
            {isFetching && <Loader2 className="animate-spin text-zinc-400" size={20} />}
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} 
                  dy={10} 
                  interval={selectedMonth === "all" ? 0 : 4} // Adjust interval for daily view
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => selectedMonth === "all" ? label : `${selectedMonth} ${label}`}
                />
                <Area type="monotone" dataKey="total" stroke="#09090b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-zinc-900 text-lg">Recent Activity</h3>
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              {recentReceipts.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {recentReceipts.map((r, i) => (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600 font-black text-lg uppercase">
                            {r.customer_name ? r.customer_name[0] : 'W'}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{r.customer_name || 'Walk-in'}</p>
                          <p className="text-xs text-zinc-400 font-bold tracking-tight">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="font-black text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</span>
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