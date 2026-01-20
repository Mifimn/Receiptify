import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, QrCode, Receipt } from 'lucide-react';
import ComparisonDemo from './ComparisonDemo';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-brand-bg">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-zinc-200 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-zinc-300 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Text Content */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white text-brand-black px-4 py-1.5 rounded-full text-sm font-semibold border border-brand-border shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            Complete Business Suite for Nigeria
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-brand-black tracking-tighter leading-[1.1]"
          >
            Manage sales. <br/>
            <span className="text-brand-gray">
              Not just receipts.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-brand-gray max-w-lg leading-relaxed font-medium"
          >
            Branded receipts, real-time sales analytics, and professional digital storefronts. 
            Everything you need to grow your business at mifimnpay.com.ng.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {/* UPDATED: Directs to /generate so users can create receipts for free immediately */}
            <Link 
              href="/generate"
              className="flex items-center justify-center gap-2 bg-brand-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-black/10"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 bg-white text-brand-black border border-brand-border px-8 py-4 rounded-xl font-semibold hover:bg-brand-bg transition-all"
            >
              View Dashboard
            </Link>
          </motion.div>

          {/* Feature Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-4"
          >
            <div className="flex flex-col gap-1">
              <Receipt size={20} className="text-zinc-900" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Image Receipts</span>
            </div>
            <div className="flex flex-col gap-1">
              <BarChart3 size={20} className="text-zinc-900" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Sales Analysis</span>
            </div>
            <div className="flex flex-col gap-1">
              <QrCode size={20} className="text-zinc-900" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">QR Storefront</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: The Dynamic Visual */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="relative"
        >
          <ComparisonDemo />
        </motion.div>
      </div>
    </section>
  );
}
