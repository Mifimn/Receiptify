import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/landing/Navbar'; 

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false); // Modal state

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

    if (authMode === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Show the custom modal instead of alert
        setShowEmailModal(true);
        setAuthMode('signin');
        setPassword('');
        setConfirmPassword('');
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
    <div className="min-h-screen bg-zinc-50 relative">
      <Head><title>{authMode === 'signin' ? 'Login' : 'Sign Up'} | MifimnPay</title></Head>
      
      <Navbar />

      {/* EMAIL CONFIRMATION MODAL */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900" />
              <button 
                onClick={() => setShowEmailModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-zinc-50 text-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100">
                <Mail size={40} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Verify your email</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                We've sent a confirmation link to <span className="text-zinc-900 font-bold">{email}</span>. Please check your inbox and spam folder.
              </p>

              <button 
                onClick={() => setShowEmailModal(false)}
                className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black shadow-xl active:scale-[0.98] transition-all"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen grid md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-between bg-zinc-950 p-12 text-white relative overflow-hidden">
          <div className="z-10 mt-20"> 
            <div className="w-10 h-10 bg-white text-zinc-950 rounded-xl flex items-center justify-center font-bold mb-6 text-xl">M</div>
            <h2 className="text-4xl font-black max-w-md leading-[1.1] tracking-tighter text-white uppercase">Professional Receipts, Generated Instantly.</h2>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-[120px]" />
        </div>

        <div className="flex items-center justify-center p-6 md:p-12 pt-32 md:pt-12"> 
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-black text-zinc-950 tracking-tight leading-none">
                {authMode === 'signin' ? 'Welcome back' : 'Join MifimnPay'}
              </h1>
              <p className="text-zinc-500 text-sm font-medium tracking-wide">Enter your details to manage your business receipts.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                <AlertCircle size={18} /> <p>{error}</p>
              </motion.div>
            )}

            <button 
              onClick={handleGoogleLogin} 
              className="w-full h-14 flex items-center justify-center gap-3 bg-white text-zinc-900 border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all font-black text-sm shadow-sm active:scale-[0.98]"
            >
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
               Continue with Google
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-200"></div>
              <span className="absolute bg-zinc-50 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">or use email</span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 ml-1 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    required 
                    className="w-full h-14 px-5 border-2 border-zinc-100 rounded-2xl outline-none focus:border-zinc-950 bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-300" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 ml-1 uppercase tracking-widest">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    className="w-full h-14 px-5 border-2 border-zinc-100 rounded-2xl outline-none focus:border-zinc-950 bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-300" 
                  />
                </div>

                <AnimatePresence>
                  {authMode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[10px] font-black text-zinc-400 ml-1 uppercase tracking-widest">Confirm Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required={authMode === 'signup'}
                        className="w-full h-14 px-5 border-2 border-zinc-100 rounded-2xl outline-none focus:border-zinc-950 bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-300" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                disabled={isLoading} 
                className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black transition-all shadow-xl shadow-zinc-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="text-center pt-4">
              <button 
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }} 
                className="text-sm font-black text-zinc-400 hover:text-zinc-950 transition-colors"
              >
                {authMode === 'signin' ? (
                  <>New here? <span className="text-zinc-950 decoration-zinc-950 underline underline-offset-4">Create an account</span></>
                ) : (
                  <>Already have an account? <span className="text-zinc-950 decoration-zinc-950 underline underline-offset-4">Sign in</span></>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
