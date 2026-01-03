import { ReceiptData, ReceiptSettings } from '../../types';

interface Props {
  data: ReceiptData;
  settings: ReceiptSettings;
  receiptRef?: React.RefObject<HTMLDivElement>;
}

export default function ReceiptPreview({ data, settings, receiptRef }: Props) {
  const subtotal = data.items.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 0)), 0);
  const total = subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0);
  const logoLetter = (data.businessName?.charAt(0) || 'R').toUpperCase();

  const zigzagImage = `data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2020%2010%27%20width%3D%2720%27%20height%3D%2710%27%3E%3Cpolygon%20points%3D%270%2C0%2010%2C10%2020%2C0%27%20fill%3D%27white%27%2F%3E%3C%2Fsvg%3E`;

  return (
    <div className="flex justify-center items-start font-sans antialiased p-4">
      <div 
        ref={receiptRef}
        id="receipt-node"
        className="relative text-zinc-900 leading-tight drop-shadow-xl overflow-hidden"
        style={{ width: '320px', backgroundColor: '#ffffff' }}
      >
        {/* NEW: Slanted Repeated Background Logo Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 flex flex-wrap gap-12 p-4 rotate-[-15deg] scale-125">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="text-4xl font-black" style={{ color: settings.color }}>
              {logoLetter}
            </span>
          ))}
        </div>

        <div className="h-2 w-full relative z-20 rounded-t-sm" style={{ backgroundColor: settings.color }}></div>

        <div className="bg-transparent w-full px-5 pt-5 pb-2 relative z-10">
            <div className="text-center mb-6 relative z-10 border-b border-dashed border-zinc-200 pb-4">
                {settings.showLogo && (
                    <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg shadow-sm overflow-hidden"
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
                    <span className="text-xs font-bold break-words block leading-snug">{data.customerName || 'Guest'}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Receipt No.</span>
                    <span className="text-xs font-bold block">{data.receiptNumber}</span>
                    <span className="text-[9px] text-zinc-400 block mt-1">{data.date}</span>
                </div>
            </div>

            <div className="mb-5 relative z-10 text-left">
                <div className="grid grid-cols-[1fr_auto] gap-2 mb-2 pb-1 border-b border-zinc-100">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Item</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-right">Amount</span>
                </div>

                <div className="space-y-2"> 
                    {data.items.length === 0 ? (
                        <p className="text-[10px] text-center text-zinc-300 py-2 italic">No items</p>
                    ) : (
                        data.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2 text-xs items-start leading-snug">
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-800 block break-words">{item.name || 'Item Name'}</span>
                                {settings.template === 'detailed' && (
                                    <span className="text-[9px] text-zinc-500 font-medium mt-0.5 block">
                                    {item.qty} x {data.currency}{(item.price || 0).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <span className="font-mono font-bold text-zinc-900 whitespace-nowrap text-right block">
                                {data.currency}{((item.qty || 0) * (item.price || 0)).toLocaleString()}
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

            <div className="text-center mt-3 pb-2 relative z-10">
                <p className="text-[8px] text-zinc-400 font-medium">Thank you for your patronage!</p>
                <div className="flex justify-center items-center gap-1 mt-1 opacity-50">
                     <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                     <p className="text-[7px] text-zinc-300 uppercase tracking-widest font-bold">Generated by MifimnPay</p>
                     <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                </div>
            </div>
        </div>

        <div className="w-full h-3 relative z-20" style={{ backgroundImage: `url("${zigzagImage}")`, backgroundSize: '12px 6px', backgroundRepeat: 'repeat-x', height: '6px' }} />
      </div>
    </div>
  );
}
