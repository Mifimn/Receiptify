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
      options: {
        redirectTo: `https://mifimnpay.vercel.app/dashboard`,
      },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `https://mifimnpay.vercel.app/onboarding` }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
        setAuthMode('signin');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // CHECK IF PROFILE IS COMPLETE
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', data.user.id)
          .single();

        // Redirect based on whether they have changed the default name
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
          <Link href="/" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-bold border border-white/10 mb-6 text-white decoration-transparent uppercase">M</Link>
          <h2 className="text-4xl font-bold max-w-md leading-tight">Professional Receipts, Generated Instantly.</h2>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-zinc-950">{authMode === 'signin' ? 'Welcome back' : 'Create an account'}</h1>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} /> <p>{error}</p>
            </div>
          )}

          <button onClick={handleGoogleLogin} className="w-full h-12 flex items-center justify-center gap-3 bg-white text-zinc-950 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all font-medium">
             Continue with Google
          </button>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl outline-none" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl outline-none" />
            <button disabled={isLoading} className="w-full h-12 bg-zinc-950 text-white rounded-xl font-medium">
              {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-500">
            <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className="text-zinc-950 font-bold hover:underline">
              {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
