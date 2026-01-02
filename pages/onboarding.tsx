import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('₦');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    let logoUrl = null;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: businessName || 'New Vendor',
          business_phone: phone,
          currency: currency,
          logo_url: logoUrl,
          updated_at: new Date(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-zinc-950">
      <Head><title>Setup Profile | MifimnPay</title></Head>
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-zinc-200 shadow-xl p-8">
          {step === 1 ? (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold">Business Details</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-900" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-900" />
              </div>
              <button onClick={() => setStep(2)} className="w-full h-12 bg-zinc-900 text-white rounded-xl font-bold">Continue</button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold">Add your Logo</h2>
              <label className="block border-2 border-dashed border-zinc-200 rounded-xl p-8 hover:bg-zinc-50 cursor-pointer relative">
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={previewUrl} alt="Preview" className="h-20 w-20 object-contain mb-2" />
                    <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Ready</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-zinc-400">
                    <Upload size={32} className="mb-2" />
                    <p className="text-sm font-medium">Click to upload logo</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
              <div className="flex gap-3">
                <button onClick={handleFinish} className="flex-1 h-12 bg-zinc-100 rounded-xl font-bold">Skip</button>
                <button onClick={handleFinish} disabled={loading} className="flex-[2] h-12 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center">
                   {loading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
