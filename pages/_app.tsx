// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import ProfileAlert from '../components/dashboard/ProfileAlert'; 
import InstallPrompt from '../components/PWA/InstallPrompt'; 
import { GoogleAnalytics } from '@next/third-parties/google';

export default function App({ Component, pageProps }: AppProps) {
  const siteUrl = 'https://mifimnpay.com.ng'; 
  const title = "MifimnPay | Professional Receipt Generator";
  const description = "Generate authentic branded receipts instantly with MifimnPay.";
  const shareImage = `${siteUrl}/favicon.png`;

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title key="title">{title}</title>
        <meta name="description" content={description} key="desc" />

        {/* --- Open Graph / WhatsApp / Facebook --- */}
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:url" content={siteUrl} key="ogurl" />
        <meta property="og:title" content={title} key="ogtitle" />
        <meta property="og:description" content={description} key="ogdesc" />
        <meta property="og:image" content={shareImage} key="ogimage" />
        <meta property="og:image:secure_url" content={shareImage} key="ogimagesecure" />
        <meta property="og:image:width" content="512" key="ogwidth" />
        <meta property="og:image:height" content="512" key="ogheight" />
        <meta property="og:image:type" content="image/png" key="ogimgtype" />

        {/* --- Twitter --- */}
        <meta name="twitter:card" content="summary" key="twcard" />
        <meta name="twitter:title" content={title} key="twtitle" />
        <meta name="twitter:description" content={description} key="twdesc" />
        <meta name="twitter:image" content={shareImage} key="twimage" />

        <link rel="icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
      </Head>
      
      <InstallPrompt />
      <ProfileAlert />
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-TTGK2RZ120" />
    </AuthProvider>
  );
}