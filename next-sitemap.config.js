/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mifimnpay.com.ng',
  generateRobotsTxt: true, // This creates the robots.txt file automatically
  sitemapSize: 7000,
  // List pages you DON'T want Google to show in search results
  exclude: [
    '/dashboard', 
    '/settings', 
    '/onboarding', 
    '/history',
    '/login'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/settings', '/onboarding'],
      },
    ],
  },
}
