import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ComparisonDemo from './ComparisonDemo';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-brand-bg">
      {/* Background Decor (Subtle Gray Blobs) */}
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
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white text-brand-black px-4 py-1.5 rounded-full text-sm font-semibold border border-brand-border shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            #1 Receipt Generator in Nigeria
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-brand-black tracking-tighter leading-[1.1]"
          >
            Stop sending <br/>
            <span className="text-brand-gray">
              boring texts.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-brand-gray max-w-lg leading-relaxed font-medium"
          >
            Turn your "DM for price" into professional invoices. 
            Create, download, and share branded receipts in seconds. 
            Build trust with every transaction.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button className="flex items-center justify-center gap-2 bg-brand-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-black/10">
              Create Free Receipt
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center gap-2 bg-white text-brand-black border border-brand-border px-8 py-4 rounded-xl font-semibold hover:bg-brand-bg transition-all">
              View Demo
            </button>
          </motion.div>

          {/* Trust Metrics */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pt-8 border-t border-brand-border flex gap-12"
          >
            <div>
              <p className="font-bold text-3xl text-brand-black">5k+</p>
              <p className="text-sm text-brand-gray font-medium">Active Vendors</p>
            </div>
            <div>
              <p className="font-bold text-3xl text-brand-black">120k+</p>
              <p className="text-sm text-brand-gray font-medium">Receipts Generated</p>
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
