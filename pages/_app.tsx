import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import ProfileAlert from '../components/dashboard/ProfileAlert'; // Import the new alert component

export default function App({ Component, pageProps }: AppProps) {
  const siteUrl = 'https://mifimnpay.vercel.app'; 

  return (
    <AuthProvider>
      <Head>
        <title>MifimnPay | Professional Receipt Generator</title>
        <meta name="description" content="Generate authentic branded receipts instantly with MifimnPay." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        
        <link rel="icon" href="/favicon.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MifimnPay" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
      </Head>
      
      {/* Global Profile Alert: Displays for 10 seconds 
          if business details or logo are missing.
      */}
      <ProfileAlert />
      
      <Component {...pageProps} />
    </AuthProvider>
  );
}