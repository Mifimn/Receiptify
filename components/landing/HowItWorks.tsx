import InteractiveFeature from './InteractiveFeature';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-6 tracking-tight">
            It’s simpler than <br/> writing on paper.
          </h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            We stripped away all the complex accounting stuff. Just type, click, and send.
          </p>
        </div>

        {/* The New Interactive Demo */}
        <InteractiveFeature />
        
      </div>
    </section>
  );
}
