import { ReceiptData, ReceiptSettings } from '../../types';
import { useAuth } from '../../lib/AuthContext';

interface Props {
  data: ReceiptData;
  settings: ReceiptSettings;
  receiptRef?: React.RefObject<HTMLDivElement>;
}

const cleanCurrency = (currencyStr: string) => {
  if (!currencyStr) return '₦';
  return currencyStr.split(' ')[0]; 
};

const cleanPrice = (val: any): number => {
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export default function ReceiptPreview({ data, settings, receiptRef }: Props) {
  const { user } = useAuth();
  const currencySymbol = cleanCurrency(data.currency); 

  const subtotal = data.items.reduce((acc, item) => 
    acc + (cleanPrice(item.price) * (item.qty || 0)), 0);

  const total = subtotal + (Number(data.shipping) || 0) - (Number(data.discount) || 0);
  const logoLetter = (data.businessName?.charAt(0) || 'R').toUpperCase();

  const zigzagImage = `data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2020%2010%27%20width%3D%2720%27%20height%3D%2710%27%3E%3Cpolygon%20points%3D%270%2C0%2010%2C10%2020%2C0%27%20fill%3D%27white%27%2F%3E%3C%2Fsvg%3E`;

  return (
    <div className="flex justify-center items-start font-sans antialiased p-4 relative">
      {!user && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden opacity-[0.06]">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="whitespace-nowrap text-3xl font-black rotate-[-25deg] py-6 uppercase">
              Preview Only • Sign up to Download • MifimnPay
            </div>
          ))}
        </div>
      )}

      <div 
        ref={receiptRef}
        id="receipt-node"
        className="relative text-zinc-900 leading-tight drop-shadow-xl overflow-hidden"
        style={{ width: '320px', backgroundColor: '#ffffff' }}
      >
        {/* PENDING WATERMARK - Only shows if status is pending */}
        {data.status === 'pending' && (
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.08] rotate-[-35deg]">
                <h1 className="text-7xl font-black uppercase tracking-tighter border-8 border-zinc-900 px-4">PENDING</h1>
            </div>
        )}

        {/* Slanted Background Pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0 flex flex-wrap gap-14 p-6 rotate-[-15deg] scale-125 justify-center items-center">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-8 h-8 flex items-center justify-center">
              {data.logoUrl ? (
                <img src={data.logoUrl} alt="" className="w-full h-full object-contain grayscale" />
              ) : (
                <span className="text-3xl font-black" style={{ color: settings.color }}>{logoLetter}</span>
              )}
            </div>
          ))}
        </div>

        <div className="h-2 w-full relative z-20 rounded-t-sm" style={{ backgroundColor: settings.color }}></div>

        <div className="bg-transparent w-full px-5 pt-5 pb-2 relative z-10">
            <div className="text-center mb-6 relative z-10 border-b border-dashed border-zinc-200 pb-4">
                {settings.showLogo && (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg shadow-sm overflow-hidden" style={{ backgroundColor: settings.color }}>
                      {data.logoUrl ? ( <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" /> ) : ( logoLetter )}
                    </div>
                )}
                <h2 className="font-extrabold text-base uppercase tracking-tight mb-0.5">{data.businessName || 'Business Name'}</h2>
                {data.tagline && ( <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1 italic">{data.tagline}</p> )}
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
                    {data.items.map((item) => {
                      const itemPrice = cleanPrice(item.price);
                      return (
                        <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2 text-xs items-start leading-snug">
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-800 block break-words">{item.name || 'Item Name'}</span>
                                {settings.template === 'detailed' && (
                                    <span className="text-[9px] text-zinc-500 font-medium mt-0.5 block">{item.qty} x {currencySymbol}{itemPrice.toLocaleString()}</span>
                                )}
                            </div>
                            <span className="font-mono font-bold text-zinc-900 whitespace-nowrap text-right block">
                                {currencySymbol}{( (item.qty || 0) * itemPrice ).toLocaleString()}
                            </span>
                        </div>
                      );
                    })}
                </div>
            </div>

            <div className="pt-2 border-t-2 border-dashed border-zinc-100 relative z-10">
                <div className="space-y-2 mb-4 text-left">
                    <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                        <span>Subtotal</span>
                        <span>{currencySymbol}{subtotal.toLocaleString()}</span>
                    </div>
                    {(Number(data.shipping) > 0) && (
                        <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                        <span>Shipping</span>
                        <span>{currencySymbol}{Number(data.shipping).toLocaleString()}</span>
                    </div>
                    )}
                    {(Number(data.discount) > 0) && (
                        <div className="flex justify-between text-[10px] font-bold text-green-600">
                        <span>Discount</span>
                        <span>-{currencySymbol}{Number(data.discount).toLocaleString()}</span>
                    </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-100 -mx-5 px-5 py-2 bg-zinc-50/50">
                    {/* DYNAMIC TEXT: CHANGE TO 'TOTAL DUE' IF PENDING */}
                    <span className="font-black text-sm uppercase tracking-tight text-zinc-700">
                        {data.status === 'pending' ? 'TOTAL DUE' : 'TOTAL PAID'}
                    </span>
                    <span className="font-black text-xl font-mono tracking-tight leading-none" style={{ color: settings.color }}>
                        {currencySymbol}{total.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="text-center mt-3 pb-2 relative z-10">
                <p className="text-[8px] text-zinc-400 font-medium whitespace-pre-wrap">{data.footerMessage || 'Thank you for your patronage!'}</p>
                <div className="flex justify-center items-center gap-1 mt-1 opacity-50">
                     <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                     <p className="text-[7px] text-zinc-300 uppercase tracking-widest font-bold">Generated by MifimnPay</p>
                     <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                </div>
            </div>
        </div>

        <div className="w-full h-[6px] relative z-20" style={{ backgroundImage: `url("${zigzagImage}")`, backgroundSize: '12px 6px', backgroundRepeat: 'repeat-x' }} />
      </div>
    </div>
  );
}
