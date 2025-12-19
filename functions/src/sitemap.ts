import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize admin SDK if not already done
if (process.env.FUNCTIONS_EMULATOR !== 'true') {
    try { initializeApp(); } catch (e) {}
}

const BASE_URL = 'https://chiari-voices-blog-3e51b.web.app';

export const sitemap = onRequest(async (req, res) => {
  try {
    const db = getFirestore();
    const postsSnapshot = await db.collection('posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();

    const posts = postsSnapshot.docs.map(doc => ({
      slug: doc.data().slug,
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static Pages -->
      <url>
        <loc>${BASE_URL}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${BASE_URL}/blog</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      
      <!-- Dynamic Blog Posts -->
      ${posts.map(post => `
      <url>
        <loc>${BASE_URL}/blog/${post.slug}</loc>
        <lastmod>${post.updatedAt}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>`).join('')}
    </urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});
