import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Download, Share2, Send, Check } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "1. Enter Details",
    desc: "Type customer info and items. No account needed.",
    icon: <Edit3 size={20} />
  },
  {
    id: 2,
    title: "2. Instant Preview",
    desc: "Watch the receipt generate instantly as you type.",
    icon: <Download size={20} />
  },
  {
    id: 3,
    title: "3. Share & Grow",
    desc: "Send directly to WhatsApp and look professional.",
    icon: <Share2 size={20} />
  }
];

export default function InteractiveFeature() {
  const [activeStep, setActiveStep] = useState(1);

  // Auto-cycle through steps every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // SVG for ZigZag pattern (Same as generator)
  const zigzagImage = `data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2020%2010%27%20width%3D%2720%27%20height%3D%2710%27%3E%3Cpolygon%20points%3D%270%2C0%2010%2C10%2020%2C0%27%20fill%3D%27white%27%2F%3E%3C%2Fsvg%3E`;

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* LEFT SIDE: The Steps Menu */}
      <div className="space-y-4">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border ${
              activeStep === step.id
                ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-105"
                : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeStep === step.id ? 'bg-zinc-800' : 'bg-zinc-100 text-zinc-900'}`}>
                {step.icon}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${activeStep === step.id ? 'text-white' : 'text-zinc-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm mt-1 ${activeStep === step.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* RIGHT SIDE: The Virtual Phone Screen */}
      <div className="relative mx-auto border-zinc-800 bg-zinc-900 border-[14px] rounded-[2.5rem] h-[550px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
        {/* Phone Notch/Header */}
        <div className="h-[32px] bg-zinc-800 w-full absolute top-0 left-0 z-20 flex justify-center">
            <div className="h-4 w-24 bg-black rounded-b-xl"></div>
        </div>
        
        {/* Screen Content */}
        <div className="bg-zinc-100 w-full h-full pt-12 relative flex flex-col items-center justify-center font-sans">
          <AnimatePresence mode="wait">
            
            {/* SCENE 1: TYPING FORM */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full px-4 space-y-4"
              >
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Customer</label>
                      <div className="h-8 border-b border-zinc-200 flex items-center text-sm font-bold text-zinc-900">
                        <Typewriter text="Amina Yusuf" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Item</label>
                      <div className="h-8 border-b border-zinc-200 flex items-center text-sm font-bold text-zinc-900">
                        <Typewriter text="Bone Straight Hair" delay={1.5} />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Price</label>
                      <div className="h-8 border-b border-zinc-200 flex items-center text-sm font-bold text-zinc-900">
                        <Typewriter text="300,000" delay={3} />
                      </div>
                   </div>
                </div>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 4 }}
                  className="bg-zinc-900 text-white text-center py-3 rounded-xl text-sm font-bold shadow-lg"
                >
                  Generate Receipt
                </motion.div>
              </motion.div>
            )}

            {/* SCENE 2: RECEIPT PREVIEW (EXACT GENERATOR MATCH) */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-[260px] drop-shadow-xl text-zinc-900 leading-tight"
              >
                 {/* Top Color Bar */}
                 <div className="h-2 w-full bg-zinc-900 rounded-t-sm relative z-20"></div>

                 {/* Main Body */}
                 <div className="bg-white p-4 pt-4 pb-2 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-4 border-b border-dashed border-zinc-200 pb-3">
                       <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-2 text-white font-bold text-xs">M</div>
                       <h2 className="font-extrabold text-xs uppercase tracking-tight mb-0.5">Mama Tunde Logistics</h2>
                       <p className="text-[8px] text-zinc-500 font-medium">0812 345 6789</p>
                    </div>

                    {/* Customer Info */}
                    <div className="flex justify-between mb-4 text-[9px]">
                        <div>
                            <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Billed To</span>
                            <span className="font-bold block">Amina Yusuf</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Receipt No.</span>
                            <span className="font-bold block">REC-001</span>
                            <span className="text-zinc-400 block mt-0.5">24 Dec 2025</span>
                        </div>
                    </div>

                    {/* Item List */}
                    <div className="mb-4">
                        <div className="flex justify-between text-[8px] font-bold text-zinc-400 uppercase border-b border-zinc-100 pb-1 mb-1">
                            <span>Item</span>
                            <span>Amount</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold items-start">
                            <div>
                                <span className="text-zinc-800 block">Bone Straight</span>
                                <span className="text-[8px] text-zinc-500 block font-normal">1 x ₦300,000</span>
                            </div>
                            <span className="text-zinc-900">₦300,000</span>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="pt-2 border-t-2 border-dashed border-zinc-100">
                        <div className="flex justify-between text-[9px] font-medium text-zinc-500 mb-1">
                            <span>Subtotal</span>
                            <span>₦300,000</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-100 mt-1 -mx-4 px-4 py-1 bg-zinc-50">
                            <span className="font-black text-xs uppercase tracking-tight text-zinc-700">TOTAL PAID</span>
                            <span className="font-black text-sm text-zinc-900">₦300,000</span>
                        </div>
                    </div>
                 </div>

                 {/* Bottom ZigZag Only */}
                 <div className="w-full h-2 relative z-20" style={{ backgroundImage: `url("${zigzagImage}")`, backgroundSize: '10px 5px' }} />
              </motion.div>
            )}

            {/* SCENE 3: WHATSAPP SHARE */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full px-4 gap-4"
              >
                 <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ type: "spring" }}
                   className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-xl"
                 >
                    <Send size={32} />
                 </motion.div>
                 
                 <div className="bg-white p-4 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm border border-zinc-100 text-xs text-zinc-600 w-full">
                    <p className="font-bold mb-1 text-zinc-900">Mama Tunde</p>
                    Hello Amina, here is your receipt for ₦300,000. Thanks for your patronage!
                 </div>

                 <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full text-xs border border-green-100"
                 >
                    <Check size={14} /> Sent Successfully
                 </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Typing Animation Sub-component
function Typewriter({ text, delay = 0 }: { text: string, delay?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    const startTimeout = setTimeout(() => {
        let i = 0;
        const typing = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i === text.length) clearInterval(typing);
        }, 80); 
        return () => clearInterval(typing);
    }, delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}
