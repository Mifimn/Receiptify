import { Star } from 'lucide-react';

const reviews = [
  {
    name: "Amina Yusuf",
    role: "Perfume Vendor, Ilorin",
    text: "Before Receiptify, I was writing on paper. Now my customers take me more seriously because they see a branded receipt.",
    rating: 5
  },
  {
    name: "Tunde Logistics",
    role: "Bike Rider, Offa",
    text: "It is very fast. I generate the receipt before I even deliver the package. My customers love it.",
    rating: 5
  },
  {
    name: "Chioma Bakes",
    role: "Cake Vendor",
    text: "The best part is I don't need to login. I just open the site and type. It saves me so much time.",
    rating: 4
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-brand-black text-center mb-12">Trusted by 5,000+ Vendors</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-brand-black mb-6 leading-relaxed">"{review.text}"</p>
              <div>
                <p className="font-bold text-sm text-brand-black">{review.name}</p>
                <p className="text-xs text-brand-gray">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Brand Logos Strip */}
        <div className="mt-20 pt-10 border-t border-brand-border/50">
           <p className="text-center text-xs font-bold text-brand-gray uppercase tracking-widest mb-8">Powering sales for</p>
           <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
             {/* Using text as placeholders for logos since we can't load external images */}
             <span className="text-xl font-bold font-mono">OPAY</span>
             <span className="text-xl font-bold font-serif">Kuda.</span>
             <span className="text-xl font-bold italic">Moniepoint</span>
             <span className="text-xl font-bold">PalmPay</span>
           </div>
        </div>
      </div>
    </section>
  );
}
