import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import ProfileAlert from '../components/dashboard/ProfileAlert'; 
import { GoogleAnalytics } from '@next/third-parties/google';

export default function App({ Component, pageProps }: AppProps) {
  const siteUrl = 'https://mifimnpay.vercel.app'; 
  const title = "MifimnPay | Professional Receipt Generator";
  const description = "Generate authentic branded receipts instantly with MifimnPay.";
  const ogImage = `${siteUrl}/og-image.png`;

  return (
    <AuthProvider>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        
        <meta name="google-site-verification" content="3LLBnYF_neMyal_kjtQyVOSE25JcDQBwnw40fWe_yEE" />
        <link rel="icon" href="/favicon.png" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      
      <ProfileAlert />
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-TTGK2RZ120" />
    </AuthProvider>
  );
}
