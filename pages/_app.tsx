import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css'; // Keep your existing styles import

export default function App({ Component, pageProps }: AppProps) {
  // Replace this with your actual deployed Vercel URL later
  const siteUrl = 'https://receiptifys.vercel.app'; 

  return (
    <>
      <Head>
        {/* 1. Basic Site Info */}
        <title>Receiptify | Professional Receipt Generator</title>
        <meta name="description" content="Generate authentic OPay-style receipts instantly. Download PDF or share via WhatsApp. No account needed for previews." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* 2. Favicon (Browser Tab Icon) */}
        <link rel="icon" href="/favicon.png" />

        {/* 3. Open Graph (WhatsApp, Facebook, iMessage) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Receiptify - Create Receipts Instantly" />
        <meta property="og:description" content="The fastest way to generate professional payment receipts for your business. Try it now." />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="Receiptify" />

        {/* 4. Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Receiptify - Create Receipts Instantly" />
        <meta name="twitter:description" content="Generate authentic OPay-style receipts instantly for your business." />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}
