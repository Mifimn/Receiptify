import Head from 'next/head';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-black selection:text-white">
      <Head>
        <title>Receiptify | Professional Receipt Generator</title>
        <meta name="description" content="Generate professional receipts for your business in seconds. Trusted by 5,000+ vendors in Nigeria." />
      </Head>

      <Navbar />
      
      <main>
        <Hero />
        <HowItWorks />
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
