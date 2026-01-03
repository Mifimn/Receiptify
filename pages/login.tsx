import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `https://mifimnpay.vercel.app/dashboard` },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
        setAuthMode('signin');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', data.user.id)
          .single();

        if (!profile?.business_name || profile.business_name === 'My Business') {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <Head><title>{authMode === 'signin' ? 'Login' : 'Sign Up'} | MifimnPay</title></Head>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-zinc-200 space-y-10"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-950 text-white rounded-2xl flex items-center justify-center font-bold mx-auto mb-4">M</div>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight">
            {authMode === 'signin' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-zinc-500 font-medium">Professional receipts for your business.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle size={18} /> <p className="font-medium">{error}</p>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          className="w-full h-14 flex items-center justify-center gap-4 bg-white text-zinc-950 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-sm shadow-sm"
        >
           <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
           Continue with Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t w-full border-zinc-100"></div>
          <span className="bg-white px-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest absolute">or use email</span>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div className="space-y-4">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email address" 
              required 
              className="w-full h-14 px-6 border border-zinc-200 rounded-2xl outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all bg-zinc-50 focus:bg-white text-base font-medium" 
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
              className="w-full h-14 px-6 border border-zinc-200 rounded-2xl outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all bg-zinc-50 focus:bg-white text-base font-medium" 
            />
          </div>
          
          <button 
            disabled={isLoading} 
            className="w-full h-14 bg-zinc-950 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-950/20 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <button 
          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
          className="w-full text-center text-sm font-bold text-zinc-950 hover:text-zinc-700 transition-colors"
        >
          {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}
