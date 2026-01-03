import { useState, useEffect } from 'react';
import { AlertCircle, X, Clock } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function ProfileAlert() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [missingInfo, setMissingInfo] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (user) {
      const checkProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('business_phone, logo_url, tagline, footer_message, address')
          .eq('id', user.id)
          .single();

        const missing = [];
        if (!data?.logo_url) missing.push("Business Logo");
        if (!data?.business_phone) missing.push("Phone Number");
        if (!data?.tagline) missing.push("Brand Tagline");
        if (!data?.address) missing.push("Business Address");

        if (missing.length > 0) {
          setMissingInfo(missing);
          setIsVisible(true);
        }
      };
      checkProfile();
    }
  }, [user]);

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsVisible(false);
    }
  }, [isVisible, countdown]);

  if (!isVisible || missingInfo.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:w-[400px] animate-in slide-in-from-right duration-500">
      <div className="bg-white border-l-4 border-orange-500 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle size={20} />
              <span className="font-black uppercase text-xs tracking-widest">Incomplete Profile</span>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-bold">
              <Clock size={12} /> {countdown}s
            </div>
          </div>
          
          <p className="text-zinc-600 text-sm mb-4 leading-relaxed">
            To provide the best experience for your customers, please upload:
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {missingInfo.map((item, i) => (
              <span key={i} className="bg-zinc-100 text-zinc-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-200">
                + {item}
              </span>
            ))}
          </div>

          <button 
            onClick={() => window.location.href = '/settings'}
            className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95"
          >
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
