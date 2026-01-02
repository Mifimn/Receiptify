import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4"
      >
        <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-sm px-6 py-3 flex justify-between items-center relative z-50">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <span className="font-bold text-zinc-900 text-lg tracking-tight">Receiptify</span>
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <Link href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it Works</Link>
            <Link href="#testimonials" className="hover:text-zinc-900 transition-colors">Testimonials</Link>
            <Link href="/login" className="hover:text-zinc-900 transition-colors">Pricing</Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Log In</Link>
            {/* UPDATED: Points to /generate instead of /login */}
            <Link href="/generate" className="bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-black/10">
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 text-zinc-900 bg-zinc-100 rounded-lg"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 md:hidden flex flex-col gap-4 z-40"
            >
              <Link href="#how-it-works" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-900 py-2 border-b border-zinc-100">How it Works</Link>
              <Link href="#testimonials" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-900 py-2 border-b border-zinc-100">Testimonials</Link>
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-900 py-2">Log In</Link>
              {/* UPDATED: Points to /generate */}
              <Link href="/generate" onClick={() => setIsOpen(false)} className="bg-zinc-900 text-center text-white text-lg font-medium px-5 py-3 rounded-xl shadow-lg">
                Create Receipt Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
