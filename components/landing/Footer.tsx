import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-brand-black font-bold text-xs">R</div>
            <span className="font-bold text-lg">Receiptify</span>
          </div>
          <p className="text-zinc-400 text-sm">Professional receipts for Nigerian businesses.</p>
        </div>
        
        <div className="flex gap-6 text-sm text-zinc-400">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
          <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
        </div>
        
        <div className="text-zinc-500 text-xs">
          © 2024 Receiptify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
