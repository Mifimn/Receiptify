import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, ArrowUpRight, Search, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('Vendor');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', user.id)
          .single();
        
        if (!data?.business_name || data.business_name === 'My Business') {
          router.push('/onboarding');
        } else {
          setBusinessName(data.business_name);
        }
      };
      fetchProfile();
    }
  }, [user, loading]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-brand-black">Welcome back, {businessName} 👋</h1>
          <p className="text-brand-gray text-sm">Here is what is happening with your business today.</p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total Sales" value="₦0.00" icon={<TrendingUp size={20} />} trend="0% change" />
          <StatsCard title="Receipts Generated" value="0" icon={<FileText size={20} />} trend="+0 today" />
          <StatsCard title="Active Customers" value="0" icon={<Users size={20} />} trend="0 new" />
        </div>

        {/* Empty State for Receipts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-zinc-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-brand-black">No receipts found</h3>
            <p className="text-brand-gray mb-8">Start by creating your first professional receipt.</p>
            <Link href="/generate" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-zinc-800 transition-all">
                <Plus size={20} /> Create New Receipt
            </Link>
        </motion.div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-900 border border-zinc-100">{icon}</div>
        <span className="text-xs font-medium bg-zinc-50 text-zinc-600 px-2 py-1 rounded-full border border-zinc-100">{trend}</span>
      </div>
      <p className="text-sm text-brand-gray mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-brand-black">{value}</h3>
    </div>
  );
}
