import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/landing/Navbar';

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
        router.push('/dashboard');
      }
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head><title>{authMode === 'signin' ? 'Login' : 'Sign Up'} | MifimnPay</title></Head>
      
      {/* Integrated Landing Navbar */}
      <Navbar />

      <main className="flex items-center justify-center pt-32 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-zinc-950">{authMode === 'signin' ? 'Welcome Back' : 'Join MifimnPay'}</h1>
            <p className="text-zinc-500 mt-2">Manage your receipts effortlessly</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} /> <p>{error}</p>
            </div>
          )}

          <button 
            onClick={handleGoogleLogin} 
            className="w-full h-14 flex items-center justify-center gap-3 bg-white text-zinc-950 border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all shadow-sm font-bold text-sm"
          >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
             Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t w-full border-zinc-100"></div>
            <span className="bg-white px-4 text-xs text-zinc-400 font-bold uppercase tracking-widest absolute">or email</span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="w-full h-13 px-4 border border-zinc-200 rounded-xl outline-none focus:border-zinc-900 transition-colors" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full h-13 px-4 border border-zinc-200 rounded-xl outline-none focus:border-zinc-900 transition-colors" />
            <button disabled={isLoading} className="w-full h-14 bg-zinc-950 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-zinc-200">
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className="w-full text-center text-sm font-bold text-zinc-950 transition-colors hover:text-zinc-600">
            {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
