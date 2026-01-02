import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Store, Upload, Loader2 } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
        // Redirect to Dashboard (Home Base)
        router.push('/dashboard'); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <Head>
        <title>Setup Profile | Receiptify</title>
      </Head>

      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 1 ? 'bg-zinc-950' : 'bg-zinc-200'}`} />
          <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 2 ? 'bg-zinc-950' : 'bg-zinc-200'}`} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-xl p-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-950">
                  <Store size={24} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-950">Tell us about your business</h2>
                <p className="text-zinc-500 text-sm mt-1">This will appear on your receipts.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-zinc-950 block mb-2">Business Name</label>
                  <input type="text" placeholder="e.g. Mama Tunde Logistics" className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-zinc-950 block mb-2">Phone Number</label>
                  <input type="tel" placeholder="0812 345 6789" className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-zinc-950 block mb-2">Currency</label>
                  <select className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white outline-none">
                    <option>₦ Naira (NGN)</option>
                    <option>$ Dollar (USD)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full h-12 bg-zinc-950 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-950">
                  <Upload size={24} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-950">Add your Logo</h2>
                <p className="text-zinc-500 text-sm mt-1">Optional. You can skip this for now.</p>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-zinc-950 group-hover:border-zinc-950 transition-all">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-medium text-zinc-950">Click to upload logo</p>
                <p className="text-xs text-zinc-500">PNG or JPG (Max 2MB)</p>
              </div>

              <div className="flex gap-3">
                 <button 
                  onClick={handleFinish}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-950 rounded-xl font-medium hover:bg-zinc-200 transition-all"
                >
                  Skip
                </button>
                <button 
                  onClick={handleFinish}
                  className="flex-[2] h-12 bg-zinc-950 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                   {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
