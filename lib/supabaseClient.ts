import { createClient } from '@supabase/supabase-js'

// These variables will be pulled from your Vercel Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * MifimnPay Supabase Client
 * * This client handles authentication and data fetching for receipts.
 * Ensure NEXT_PUBLIC_SITE_URL is updated in Vercel to https://mifimnpay.com.ng
 * for correct auth redirects.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
