import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  FileText, 
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('Vendor');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const checkProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('business_name')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;

          // If the business name is the default from the SQL trigger, force onboarding
          if (!data?.business_name || data.business_name === 'My Business') {
            router.push('/onboarding');
          } else {
            setBusinessName(data.business_name);
            setIsChecking(false);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          setIsChecking(false);
        }
      };
      checkProfile();
    }
  }, [user, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <Head>
        <title>Dashboard | MifimnPay</title>
      </Head>

      <DashboardNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-brand-black">Welcome back, {businessName} 👋</h1>
          <p className="text-brand-gray text-sm">Here is your business overview.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total Sales" value="₦0.00" icon={<TrendingUp size={20} />} trend="0% change" />
          <StatsCard title="Receipts Generated" value="0" icon={<FileText size={20} />} trend="+0 today" />
          <StatsCard title="Active Customers" value="0" icon={<Users size={20} />} trend="0 new" />
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
            <FileText className="mx-auto text-zinc-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-brand-black">No receipts found</h3>
            <p className="text-brand-gray mb-8 max-w-sm mx-auto">Your recent transactions will appear here once you start generating receipts.</p>
            <button 
                onClick={() => router.push('/generate')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-all shadow-lg"
            >
                <Plus size={20} /> Create Your First Receipt
            </button>
        </div>
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
