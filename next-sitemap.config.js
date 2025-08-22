/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_DOMAIN || 'https://www.yourdomain.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.8,
  transform: async (config, url) => {
    // Optional: dynamically add lastmod for products
    if (url.includes('/products/')) {
      // you could fetch product update time from Firestore here
    }
    return {
      loc: url,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    };
  },
};
