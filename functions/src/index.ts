import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { format } from 'date-fns';

admin.initializeApp();

const db = admin.firestore();

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"/]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const sitemap = onRequest(async (req, res) => {
  logger.info("Sitemap generation requested");

  const baseUrl = "https://blog.chiarivoices.org";

  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  const addUrl = (loc: string, lastmod?: string, changefreq = 'weekly', priority = '0.8') => {
    xml += '<url>';
    xml += `<loc>${baseUrl}${loc}</loc>`;
    if (lastmod) {
      xml += `<lastmod>${lastmod}</lastmod>`;
    }
    xml += `<changefreq>${changefreq}</changefreq>`;
    xml += `<priority>${priority}</priority>`;
    xml += '</url>';
  };

  // Static pages
  addUrl('/', format(new Date(), 'yyyy-MM-dd'), 'daily', '1.0');
  addUrl('/posts', format(new Date(), 'yyyy-MM-dd'), 'daily', '1.0');
  addUrl('/about', undefined, 'monthly', '0.5');
  addUrl('/contact', undefined, 'monthly', '0.5');

  // Dynamic post pages
  try {
    const postsSnapshot = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').get();
    postsSnapshot.forEach(doc => {
      const post = doc.data();
      const postUrl = `/post/${escapeXml(post.slug)}`;
      const lastMod = post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      addUrl(postUrl, lastMod, 'weekly', '0.9');
    });
  } catch (error) {
    logger.error("Error fetching posts:", error);
  }

  // Dynamic tag pages
  try {
    const tagsSnapshot = await db.collection('posts').where('status', '==', 'published').get();
    const tags = new Set<string>();
    tagsSnapshot.forEach(doc => {
      const post = doc.data();
      if (post.tags) {
        post.tags.forEach((tag: string) => tags.add(tag));
      }
    });

    tags.forEach(tag => {
      addUrl(`/posts?tag=${encodeURIComponent(tag)}`, format(new Date(), 'yyyy-MM-dd'), 'weekly', '0.7');
    });
  } catch (error) {
    logger.error("Error fetching tags:", error);
  }

  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.status(200).send(xml);
});
