import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Simulation of login logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request delay
    setTimeout(() => {
      setIsLoading(false);
      
      if (authMode === 'signup') {
        // New users go to setup profile
        router.push('/onboarding');
      } else {
        // Existing users go to dashboard
        router.push('/dashboard');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-zinc-50">
      <Head>
        <title>{authMode === 'signin' ? 'Login' : 'Sign Up'} | Receiptify</title>
      </Head>

      {/* LEFT SIDE: Visual Art (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col justify-between bg-zinc-950 p-12 text-white relative overflow-hidden">
        <div className="z-10">
          <Link href="/" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-bold border border-white/10 mb-6">R</Link>
          <h2 className="text-4xl font-bold max-w-md leading-tight">Manage your business like a pro.</h2>
        </div>
        
        <div className="z-10">
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-4">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" />
              ))}
            </div>
            <p className="text-zinc-400 text-sm">Joined by 5,000+ vendors</p>
          </div>
        </div>

        {/* Abstract shapes background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-3xl" />
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-zinc-950">
              {authMode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-zinc-500 mt-2">
              {authMode === 'signin' ? 'Enter your details to access your dashboard.' : 'Start generating professional receipts today.'}
            </p>
          </div>

          {/* Priority Google Button */}
          <button className="w-full h-12 flex items-center justify-center gap-3 bg-white text-zinc-950 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all font-medium relative group overflow-hidden">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
            </svg>
            <span className="relative z-10">Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-50 px-2 text-zinc-400">Or continue with email</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-950">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                <input 
                  type="email" 
                  placeholder="vendor@example.com"
                  className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-950">Password</label>
                {authMode === 'signin' && (
                  <Link href="#" className="text-xs text-zinc-950 font-medium hover:underline">Forgot?</Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full h-12 bg-zinc-950 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-500">
            {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-zinc-950 font-bold hover:underline"
            >
              {authMode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
