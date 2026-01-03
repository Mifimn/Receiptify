import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/landing/Navbar'; // Import the landing page Navbar

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (authMode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        alert('Verification email sent!');
        setAuthMode('signin');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/dashboard'); 
      }
    } catch (err: any) { setError(err.message); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head><title>MifimnPay | Login</title></Head>
      
      {/* Integrated Landing Page Navbar */}
      <Navbar />

      <main className="flex items-center justify-center pt-40 pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-12">
          <div className="text-center">
            <img src="/favicon.png" alt="M" className="w-20 h-20 mx-auto mb-8 rounded-3xl shadow-2xl shadow-zinc-200" />
            <h1 className="text-5xl font-black text-zinc-950 tracking-tight leading-tight">
              {authMode === 'signin' ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-zinc-500 mt-4 text-xl tracking-tight">The fastest way to bill your customers professionally.</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-4">
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email Address" required 
                className="w-full h-18 px-8 border-2 border-zinc-100 rounded-2xl outline-none focus:border-zinc-950 focus:ring-8 focus:ring-zinc-900/5 transition-all text-lg font-medium" 
              />
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" required 
                className="w-full h-18 px-8 border-2 border-zinc-100 rounded-2xl outline-none focus:border-zinc-950 focus:ring-8 focus:ring-zinc-900/5 transition-all text-lg font-medium" 
              />
            </div>
            
            <button 
              disabled={isLoading} 
              className="w-full h-18 bg-zinc-950 text-white rounded-2xl font-black text-xl transition-all active:scale-[0.98] shadow-2xl shadow-zinc-300 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <button 
            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
            className="w-full text-center text-base font-bold text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            {authMode === 'signin' ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
