"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPostDelete = exports.onPostChange = exports.sitemap = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const date_fns_1 = require("date-fns");
const firestore_1 = require("firebase-functions/v2/firestore");
admin.initializeApp();
const db = admin.firestore();
const escapeXml = (unsafe) => {
    if (typeof unsafe !== 'string') {
        logger.warn('escapeXml was called with a non-string value:', unsafe);
        return '';
    }
    return unsafe.replace(/[<>&'"]/g, (c) => {
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
const generateSitemap = async () => {
    logger.info("Sitemap generation requested");
    const baseUrl = "https://blog.chiarivoices.org";
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const addUrl = (loc, lastmod, changefreq = 'weekly', priority = '0.8') => {
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
    addUrl('/', (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'), 'daily', '1.0');
    addUrl('/posts', (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'), 'daily', '1.0');
    addUrl('/about', undefined, 'monthly', '0.5');
    addUrl('/contact', undefined, 'monthly', '0.5');
    // Dynamic post pages
    try {
        const postsSnapshot = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').get();
        logger.info(`Found ${postsSnapshot.size} published posts.`);
        postsSnapshot.forEach(doc => {
            const post = doc.data();
            logger.info(`Processing post with id ${doc.id}`);
            logger.info(`Post data: ${JSON.stringify(post)}`); // Log the entire post object
            if (post && post.slug) {
                logger.info(`Post ${doc.id} has slug: ${post.slug}`);
                const postUrl = `/post/${escapeXml(post.slug)}`;
                const lastMod = post.createdAt?.seconds ? (0, date_fns_1.format)(new Date(post.createdAt.seconds * 1000), 'yyyy-MM-dd') : (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
                addUrl(postUrl, lastMod, 'weekly', '0.9');
            }
            else {
                logger.warn(`Post with id ${doc.id} is missing slug, skipping sitemap entry.`);
            }
        });
    }
    catch (error) {
        logger.error("Error fetching posts:", error);
    }
    // Dynamic tag pages
    try {
        const tagsSnapshot = await db.collection('posts').where('status', '==', 'published').get();
        const tags = new Set();
        logger.info(`Found ${tagsSnapshot.size} posts to process for tags.`);
        tagsSnapshot.forEach(doc => {
            const post = doc.data();
            logger.info(`Processing tags for post with id ${doc.id}`);
            logger.info(`Post data for tags: ${JSON.stringify(post)}`); // Log the entire post object
            if (post && post.tags && Array.isArray(post.tags)) {
                logger.info(`Post ${doc.id} has tags: ${post.tags.join(', ')}`);
                post.tags.forEach((tag) => {
                    if (tag) {
                        tags.add(tag);
                    }
                });
            }
        });
        tags.forEach(tag => {
            addUrl(`/posts?tag=${encodeURIComponent(tag)}`, (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'), 'weekly', '0.7');
        });
    }
    catch (error) {
        logger.error("Error fetching tags:", error);
    }
    xml += '</urlset>';
    return xml;
};
exports.sitemap = (0, https_1.onRequest)(async (req, res) => {
    try {
        const sitemapXml = await generateSitemap();
        res.set('Content-Type', 'application/xml');
        res.status(200).send(sitemapXml);
    }
    catch (error) {
        logger.error("Error generating sitemap:", error);
        res.status(500).send("Sitemap generation failed.");
    }
});
const regenerateSitemap = async () => {
    logger.info("Sitemap regeneration triggered.");
    await generateSitemap();
};
exports.onPostChange = (0, firestore_1.onDocumentWritten)("posts/{postId}", (event) => {
    logger.info("Post changed, regenerating sitemap...");
    return regenerateSitemap();
});
exports.onPostDelete = (0, firestore_1.onDocumentDeleted)("posts/{postId}", (event) => {
    logger.info("Post deleted, regenerating sitemap...");
    return regenerateSitemap();
});
//# sourceMappingURL=index.js.map