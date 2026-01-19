import { MetadataRoute } from 'next';

// ⚡ PRODUCTION URL (Update this!)
const BASE_URL = 'https://eduaccessbd.store';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',      // Admin Panel (Private)
        '/api/',        // Backend API (Private)
        '/checkout/',   // Checkout Process (No SEO value)
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}