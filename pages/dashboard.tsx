import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, Loader2, Calendar, QrCode, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react'; // Ensure you ran: npm install qrcode.react
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ProfileAlert from '../components/dashboard/ProfileAlert';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [yearReceipts, setYearReceipts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      fetchProfile();
      fetchGlobalStats();
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchYearlyData(selectedYear);
  }, [user, selectedYear]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (data) setProfile(data);
    } catch (err) { console.error(err); }
  };

  const fetchGlobalStats = async () => {
    try {
      const { data: statsData } = await supabase.rpc('get_dashboard_stats', { target_user_id: user?.id });
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

  const fetchYearlyData = async (year: number) => {
    setIsFetching(true);
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const { data } = await supabase.from('receipts').select('total_amount, created_at, customer_name').eq('user_id', user?.id).gte('created_at', startDate).lte('created_at', endDate).order('created_at', { ascending: true });
      if (data) {
        setYearReceipts(data);
        const unique = new Set(data.map(r => r.customer_name)).size;
        setStats(prev => ({ ...prev, customers: unique }));
      }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  // Helper to generate slug for the URL
  const businessSlug = profile?.slug || profile?.business_name?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || '';
  const menuUrl = `https://mifimnpay.vercel.app/m/${businessSlug}`;

  const chartData = useMemo(() => {
    if (selectedMonth === "all") {
      return months.map((m, index) => {
        const total = yearReceipts.filter(r => new Date(r.created_at).getMonth() === index).reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        return { name: m, total };
      });
    } else {
      const monthIndex = months.indexOf(selectedMonth);
      const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const total = yearReceipts.filter(r => {
          const d = new Date(r.created_at);
          return d.getMonth() === monthIndex && d.getDate() === day;
        }).reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        return { name: `${day}`, total };
      });
    }
  }, [yearReceipts, selectedYear, selectedMonth]);

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-900" size={32} /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      <ProfileAlert />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* QR MENU SECTION */}
        <section className="bg-zinc-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div>
              <h2 className="text-2xl font-black tracking-tight">QR Menu is Live 🍔</h2>
              <p className="text-zinc-400 text-sm mt-1 font-medium">Customers can scan to see your food list and prices instantly.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowQR(!showQR)} className="bg-white text-zinc-900 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <QrCode size={16} /> {showQR ? 'Hide QR' : 'View QR Code'}
                </button>
                <a href={menuUrl} target="_blank" className="bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-zinc-700">
                  <ExternalLink size={16} /> Open Menu
                </a>
              </div>
            </div>

            {showQR && (
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                <QRCodeSVG value={menuUrl} size={140} />
                <p className="text-zinc-900 text-[9px] font-black uppercase mt-3 tracking-widest">Scan to View Menu</p>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><QrCode size={120} /></div>
        </section>

        {/* Existing Stats and Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Sales Analytics</h1>
            <p className="text-zinc-500 font-medium">Managing {profile?.business_name || 'Business'}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 outline-none shadow-sm">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 outline-none shadow-sm">
              <option value="all">Full Year</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Revenue" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-green-600" />
          <StatsCard title="Receipts Issued" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-600" />
          <StatsCard title="Active Customers" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-600" />
        </div>

        {/* Sales Chart Analysis */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 text-center md:text-left">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">{selectedMonth === "all" ? `Revenue Trend (${selectedYear})` : `${selectedMonth} ${selectedYear} Breakdown`}</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.15em]">{selectedMonth === "all" ? "Monthly Cumulative" : "Daily Sales Tracking"}</p>
            </div>
            {isFetching && <Loader2 className="animate-spin text-zinc-400" size={20} />}
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#09090b" stopOpacity={0.1}/><stop offset="95%" stopColor="#09090b" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} dy={10} interval={selectedMonth === "all" ? 0 : 4} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="total" stroke="#09090b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-zinc-900 text-lg">Recent Receipts</h3>
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              {recentReceipts.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {recentReceipts.map((r, i) => (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600 font-black text-lg uppercase">{r.customer_name ? r.customer_name[0] : 'W'}</div>
                        <div>
                          <p className="font-bold text-zinc-900">{r.customer_name || 'Walk-in'}</p>
                          <p className="text-xs text-zinc-400 font-bold tracking-tight">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="font-black text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : ( <div className="p-20 text-center text-zinc-400 italic font-medium">No transactions recorded yet.</div> )}
            </div>
          </div>

          <div className="bg-zinc-950 rounded-3xl p-8 text-white h-fit shadow-2xl shadow-zinc-200 border border-white/5">
             <h4 className="text-2xl font-black mb-3 text-center md:text-left">Ready to bill?</h4>
             <p className="text-zinc-400 text-sm mb-10 leading-relaxed font-medium text-center md:text-left">Issue professional, branded receipts to your customers in seconds.</p>
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
      <div className={`w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 ${color} border border-zinc-100`}>{icon}</div>
      <p className="text-sm text-zinc-400 mb-1 font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-zinc-950 tracking-tight">{value}</h3>
    </div>
  );
}