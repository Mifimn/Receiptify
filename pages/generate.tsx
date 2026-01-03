import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Settings, AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { ReceiptData, ReceiptItem, ReceiptSettings } from '../types';
import ReceiptPreview from '../components/generator/ReceiptPreview';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; 
import { useAuth } from '../lib/AuthContext'; 

export default function Generator() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [data, setData] = useState<ReceiptData>({
    receiptNumber: '001', date: '...', customerName: '', currency: '₦',
    items: [{ id: '1', name: '', qty: 1, price: '' as any }], 
    businessName: 'My Business', businessPhone: '', paymentMethod: 'Transfer',
    status: 'Paid', discount: 0 as any, shipping: 0 as any,
  });

  const [settings, setSettings] = useState<ReceiptSettings>({ color: '#09090b', showLogo: true, template: 'detailed' });

  useEffect(() => {
    const init = async () => {
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (user) {
        const { data: nextNum } = await supabase.rpc('get_next_receipt_number', { target_user_id: user.id });
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setData(p => ({ ...p, receiptNumber: nextNum || '001', date: today, businessName: profile?.business_name, businessPhone: profile?.business_phone, logoUrl: profile?.logo_url }));
      } else { setData(p => ({ ...p, date: today })); }
    };
    if (!authLoading) init();
  }, [user, authLoading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const total = data.items.reduce((acc, i) => acc + (Number(i.price)*Number(i.qty)), 0);
        await supabase.from('receipts').insert([{ user_id: user?.id, receipt_number: data.receiptNumber, customer_name: data.customerName || 'Walk-in Customer', total_amount: total, items: data.items }]);
        setShowConfirm(false); setShowSuccess(true);
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen bg-zinc-50 flex flex-col overflow-hidden">
      <Head><title>New Receipt | MifimnPay</title></Head>

      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-black mb-2">Check Details</h3>
              <p className="text-zinc-500 mb-8 font-medium">Ready to save this receipt to history?</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowConfirm(false)} className="py-4 bg-zinc-100 rounded-2xl font-bold">Edit</button>
                <button onClick={handleSave} className="py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center">
                  {isSaving ? <Loader2 className="animate-spin" /> : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
              <h3 className="text-2xl font-black mb-4">Saved Successfully!</h3>
              <p className="text-zinc-500 mb-10 font-medium">Go to History to share or download the receipt.</p>
              <button onClick={() => router.push('/history')} className="w-full py-5 bg-zinc-900 text-white rounded-[24px] font-black text-lg active:scale-95 transition-all">Go to History</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0">
        <Link href="/dashboard" className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><ArrowLeft size={24} /></Link>
        <button onClick={() => setShowConfirm(true)} className="bg-zinc-900 text-white px-8 py-3 rounded-full font-black text-sm flex items-center gap-2">
            <Save size={18} /> Save Receipt
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-zinc-50">
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-xl mx-auto space-y-8 pb-10">
            <motion.section initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-sm border border-zinc-100 space-y-6">
              <div className="flex items-center gap-3 text-zinc-400 font-black text-[11px] uppercase tracking-widest border-b pb-4"><Settings size={18} /> Basic Info</div>
              <input value={data.customerName} onChange={(e) => setData({...data, customerName: e.target.value})} className="w-full h-14 px-6 border-2 border-zinc-50 rounded-[20px] focus:border-zinc-900 outline-none font-bold bg-zinc-50 transition-all" placeholder="Customer Name" />
            </motion.section>

            <motion.section initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[32px] shadow-sm border border-zinc-100 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-[11px] text-zinc-400 uppercase tracking-widest">Inventory</h3>
                <button onClick={() => setData(p => ({...p, items: [...p.items, { id: Date.now().toString(), name: '', qty: 1, price: '' as any }]}))} className="bg-zinc-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><Plus size={22} /></button>
              </div>
              <div className="space-y-4">
                {data.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-[24px]">
                    <div className="flex gap-2">
                        <input placeholder="Product Name" value={item.name} onChange={(e) => setData(p => ({...p, items: p.items.map(i => i.id === item.id ? {...i, name: e.target.value} : i)}))} className="flex-1 h-12 px-5 rounded-[16px] outline-none font-bold bg-white shadow-sm" />
                        <button onClick={() => setData(p => ({...p, items: p.items.filter(i => i.id !== item.id)}))} className="w-12 h-12 bg-red-50 text-red-500 rounded-[16px] flex items-center justify-center"><Trash2 size={18} /></button>
                    </div>
                    <div className="flex gap-3">
                      <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => setData(p => ({...p, items: p.items.map(i => i.id === item.id ? {...i, qty: Number(e.target.value)} : i)}))} className="w-24 h-12 px-4 rounded-[16px] outline-none font-bold bg-white text-center shadow-sm" />
                      <input type="number" placeholder="Price" value={item.price} onChange={(e) => setData(p => ({...p, items: p.items.map(i => i.id === item.id ? {...i, price: e.target.value as any} : i)}))} className="flex-1 h-12 px-5 rounded-[16px] outline-none font-bold bg-white shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center p-12 bg-zinc-100/30">
             <ReceiptPreview data={data} settings={settings} />
        </div>
      </div>
    </motion.div>
  );
}
