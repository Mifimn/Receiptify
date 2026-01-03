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
        className="relative text-zinc-900 leading-tight shadow-2xl"
        style={{ width: '320px', backgroundColor: 'white' }}
      >
        {/* Top Color Bar */}
        <div className="h-2 w-full relative z-20" style={{ backgroundColor: settings.color }}></div>

        <div className="bg-white w-full px-5 pt-5 pb-2 relative z-10">
            {/* Background Watermark Letter */}
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
                <h2 className="font-extrabold text-base uppercase tracking-tight mb-1">{data.businessName || 'Business Name'}</h2>
                <p className="text-[10px] text-zinc-500 font-medium">{data.businessPhone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Billed To</span>
                    <span className="text-xs font-bold break-words block leading-tight">{data.customerName || 'Guest'}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Receipt No.</span>
                    <span className="text-xs font-bold block">{data.receiptNumber}</span>
                    <span className="text-[9px] text-zinc-400 block mt-1">{data.date}</span>
                </div>
            </div>

            <div className="mb-5 relative z-10 text-left">
                <div className="grid grid-cols-[1fr_auto] gap-2 mb-2 pb-1 border-b border-zinc-100">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Item Description</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-right">Amount</span>
                </div>

                <div className="space-y-3"> 
                    {data.items.length === 0 ? (
                        <p className="text-[10px] text-center text-zinc-300 py-2 italic">No items added</p>
                    ) : (
                        data.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2 items-start">
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-zinc-800 break-words leading-tight">{item.name || 'Item Name'}</span>
                                {settings.template === 'detailed' && (
                                    <span className="text-[9px] text-zinc-500 font-medium mt-1">
                                    {item.qty} x {data.currency}{Number(item.price || 0).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-mono font-bold text-zinc-900 text-right pt-0.5">
                                {data.currency}{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}
                            </span>
                        </div>
                        ))
                    )}
                </div>
            </div>

            <div className="pt-2 border-t-2 border-dashed border-zinc-100 relative z-10">
                <div className="space-y-2 mb-4 text-left">
                    <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                        <span>Subtotal</span>
                        <span>{data.currency}{subtotal.toLocaleString()}</span>
                    </div>
                    {(Number(data.shipping) > 0) && (
                        <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                        <span>Shipping</span>
                        <span>{data.currency}{Number(data.shipping).toLocaleString()}</span>
                    </div>
                    )}
                    {(Number(data.discount) > 0) && (
                        <div className="flex justify-between text-[10px] font-bold text-green-600">
                        <span>Discount</span>
                        <span>-{data.currency}{Number(data.discount).toLocaleString()}</span>
                    </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-100 -mx-5 px-5 py-2 bg-zinc-50/50">
                    <span className="font-black text-sm uppercase tracking-tight text-zinc-700">TOTAL PAID</span>
                    <span className="font-black text-xl font-mono tracking-tight leading-none" style={{ color: settings.color }}>
                        {data.currency}{total.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="text-center mt-4 pb-2 relative z-10">
                <p className="text-[8px] text-zinc-400 font-medium">Thank you for your patronage!</p>
                <div className="flex justify-center items-center gap-1 mt-1.5 opacity-40">
                     <div className="w-1 h-1 rounded-full bg-zinc-400"></div>
                     <p className="text-[7px] text-zinc-400 uppercase tracking-[0.15em] font-bold">Generated by MifimnPay</p>
                     <div className="w-1 h-1 rounded-full bg-zinc-400"></div>
                </div>
            </div>
        </div>

        {/* Real SVG Zigzag for perfect download capture */}
        <div className="w-full overflow-hidden leading-[0] line-height-[0]">
          <svg width="320" height="10" viewBox="0 0 320 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="zigzag" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
                <polygon points="0,0 10,10 20,0 20,10 0,10" fill="white" />
              </pattern>
            </defs>
            <rect width="320" height="10" fill="url(#zigzag)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
