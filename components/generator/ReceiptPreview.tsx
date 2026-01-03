import { ReceiptData, ReceiptSettings } from '../../types';

interface Props {
  data: ReceiptData;
  settings: ReceiptSettings;
  receiptRef?: React.RefObject<HTMLDivElement>;
}

export default function ReceiptPreview({ data, settings, receiptRef }: Props) {
  const subtotal = data.items.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
  const total = subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0);
  const logoLetter = (data.businessName?.charAt(0) || 'R').toUpperCase();

  return (
    <div className="flex justify-center items-start font-sans antialiased p-4">
      <div 
        ref={receiptRef}
        id="receipt-node"
        className="relative text-zinc-900 leading-normal shadow-2xl"
        style={{ width: '320px', backgroundColor: 'white' }}
      >
        <div className="h-2 w-full relative z-20" style={{ backgroundColor: settings.color }}></div>

        <div className="bg-white w-full px-5 pt-5 pb-4 relative z-10">
            {settings.showLogo && !data.logoUrl && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0 opacity-[0.03] pointer-events-none">
                <span className="text-[160px] font-black -rotate-12" style={{ color: settings.color }}>
                   {logoLetter}
                </span>
            </div>
            )}

            <div className="text-center mb-6 relative z-10 border-b border-dashed border-zinc-200 pb-4">
                {settings.showLogo && (
                    <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl shadow-sm overflow-hidden"
                        style={{ backgroundColor: settings.color }}
                    >
                      {data.logoUrl ? (
                         <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                         logoLetter
                      )}
                    </div>
                )}
                <h2 className="font-black text-base uppercase tracking-tight mb-0.5">{data.businessName || 'Business Name'}</h2>
                <p className="text-[10px] text-zinc-500 font-bold">{data.businessPhone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Billed To</span>
                    <span className="text-xs font-black break-words block leading-tight">{data.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Receipt No.</span>
                    <span className="text-xs font-black block leading-none">{data.receiptNumber}</span>
                    <span className="text-[9px] text-zinc-400 font-bold block mt-1.5">{data.date}</span>
                </div>
            </div>

            <div className="mb-6 relative z-10 text-left">
                <div className="grid grid-cols-[1fr_auto] gap-2 mb-2 pb-1 border-b border-zinc-100">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Item Description</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</span>
                </div>

                {/* Fixed Overlapping: Added more space-y and controlled leading */}
                <div className="space-y-5 pt-1"> 
                    {data.items.length === 0 ? (
                        <p className="text-[10px] text-center text-zinc-300 py-2 italic font-medium">No items listed</p>
                    ) : (
                        data.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 items-start min-h-[32px]">
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-[11px] font-black text-zinc-800 break-words leading-relaxed mb-1">
                                    {item.name || 'Item Name'}
                                </span>
                                {settings.template === 'detailed' && (
                                    <span className="text-[9px] text-zinc-400 font-bold tracking-tight">
                                        {item.qty} x {data.currency}{Number(item.price || 0).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className="text-right self-start pt-0.5">
                                <span className="text-[11px] font-black text-zinc-900 whitespace-nowrap">
                                    {data.currency}{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>

            <div className="pt-3 border-t-2 border-dashed border-zinc-100 relative z-10">
                <div className="space-y-2 mb-4 text-left">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                        <span>Subtotal</span>
                        <span>{data.currency}{subtotal.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-100 -mx-5 px-5 py-2.5 bg-zinc-50/50">
                    <span className="font-black text-[11px] uppercase tracking-widest text-zinc-600">Total Paid</span>
                    <span className="font-black text-lg tracking-tight leading-none" style={{ color: settings.color }}>
                        {data.currency}{total.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="text-center mt-5 pb-1 relative z-10">
                <p className="text-[8px] text-zinc-400 font-bold mb-1.5 uppercase tracking-tighter italic">Thank you for your patronage</p>
                <div className="flex justify-center items-center gap-1.5 opacity-30">
                     <div className="w-1 h-1 rounded-full bg-zinc-400"></div>
                     <p className="text-[7px] text-zinc-500 uppercase tracking-[0.2em] font-black">Generated by MifimnPay</p>
                     <div className="w-1 h-1 rounded-full bg-zinc-400"></div>
                </div>
            </div>
        </div>

        <div className="w-full overflow-hidden block" style={{ height: '10px' }}>
          <svg width="320" height="10" viewBox="0 0 320 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="block">
            <defs>
              <pattern id="zigzag" x="0" y="0" width="16" height="10" patternUnits="userSpaceOnUse">
                <polygon points="0,0 8,8 16,0 16,10 0,10" fill="white" />
              </pattern>
            </defs>
            <rect width="320" height="10" fill="url(#zigzag)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
