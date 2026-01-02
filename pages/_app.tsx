import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Update this to your actual Vercel URL once deployed
  const siteUrl = 'https://mifimnpay.vercel.app'; 

  return (
    <>
      <Head>
        {/* 1. Basic Site Info */}
        <title>MifimnPay | Professional Receipt Generator</title>
        <meta name="description" content="Generate authentic OPay-style receipts instantly with MifimnPay. Download PDF or share via WhatsApp." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        
        {/* 2. Favicon */}
        <link rel="icon" href="/favicon.png" />

        {/* 3. Open Graph (WhatsApp, Facebook) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MifimnPay - Create Receipts Instantly" />
        <meta property="og:description" content="The fastest way to generate professional payment receipts for your business." />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="MifimnPay" />

        {/* 4. Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MifimnPay - Create Receipts Instantly" />
        <meta name="twitter:description" content="Generate authentic OPay-style receipts instantly for your business." />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}
