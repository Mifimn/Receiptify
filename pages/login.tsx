import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
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

        // Redirect based on whether they have finished setup
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
    <div className="min-h-screen grid md:grid-cols-2 bg-zinc-50">
      <Head><title>{authMode === 'signin' ? 'Login' : 'Sign Up'} | MifimnPay</title></Head>
      <div className="hidden md:flex flex-col justify-between bg-zinc-950 p-12 text-white relative overflow-hidden">
        <div className="z-10">
          <div className="w-10 h-10 bg-white text-zinc-950 rounded-xl flex items-center justify-center font-bold mb-6">M</div>
          <h2 className="text-4xl font-bold max-w-md leading-tight text-white decoration-transparent">Professional Receipts, Generated Instantly.</h2>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight">{authMode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
            <p className="text-zinc-500 text-sm font-medium">Continue your journey with MifimnPay</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} /> <p>{error}</p>
            </div>
          )}

          {/* Expanded Google Button for better touch targets and premium feel */}
          <button 
            onClick={handleGoogleLogin} 
            className="w-full h-14 flex items-center justify-center gap-3 bg-white text-zinc-900 border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all font-bold text-sm shadow-sm active:scale-[0.98]"
          >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
             Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-zinc-200"></div>
            <span className="absolute bg-zinc-50 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">or use email</span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                  className="w-full h-14 px-5 border-2 border-zinc-100 rounded-2xl outline-none focus:border-zinc-900 bg-white transition-all font-medium text-zinc-900 placeholder:text-zinc-300" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="w-full h-14 px-5 border-2 border-zinc-100 rounded-2xl outline-none focus:border-zinc-900 bg-white transition-all font-medium text-zinc-900 placeholder:text-zinc-300" 
                />
              </div>
            </div>

            <button 
              disabled={isLoading} 
              className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold transition-all shadow-lg shadow-zinc-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {authMode === 'signin' ? (
                <>New here? <span className="text-zinc-900">Create an account</span></>
              ) : (
                <>Already have an account? <span className="text-zinc-900">Sign in</span></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
