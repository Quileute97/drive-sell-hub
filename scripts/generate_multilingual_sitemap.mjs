import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_URL = 'https://salemylink.com';

const coreRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: '/seller-guide', priority: '0.8', changefreq: 'monthly' },
  { path: '/search', priority: '0.8', changefreq: 'daily' },
  { path: '/sellers', priority: '0.8', changefreq: 'weekly' },
  { path: '/nguoi-ban', priority: '0.8', changefreq: 'weekly' },
  { path: '/affiliate', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides', priority: '0.8', changefreq: 'weekly' },
  { path: '/huong-dan', priority: '0.8', changefreq: 'weekly' },
  { path: '/guides/hoc-y-khoa', priority: '0.8', changefreq: 'monthly' },
  { path: '/huong-dan/hoc-y-khoa', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides/luyen-thi-ielts', priority: '0.8', changefreq: 'monthly' },
  { path: '/huong-dan/luyen-thi-ielts', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides/viet-luan-van', priority: '0.8', changefreq: 'monthly' },
  { path: '/huong-dan/viet-luan-van', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.4', changefreq: 'yearly' },
];

const categorySlugs = [
  'tai-lieu-hoc-tap',
  'ebook-sach',
  'source-code',
  'khoa-hoc',
  'do-hoa-thiet-ke',
  'template-design',
  'khoa-hoc-online',
];

const popularTags = [
  'ielts',
  'y-khoa',
  'luan-van',
  'toeic',
  'react',
  'canva',
  'excel',
  'english',
  'python',
  'photoshop',
  'powerpoint',
  'marketing',
  'de-thi',
];

function generateUrlXml(routePath, priority = '0.8', changefreq = 'weekly', lastmod = '2026-09-05') {
  const cleanPath = routePath === '/' ? '' : routePath;
  const canonicalUrl = `${SITE_URL}${cleanPath || '/'}`;
  const baseForParams = cleanPath ? `${SITE_URL}${cleanPath}` : `${SITE_URL}/`;
  const sep = baseForParams.includes('?') ? '&' : '?';

  return `  <url>
    <loc>${canonicalUrl}</loc>
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE_URL}${cleanPath || '/'}"/>
    <xhtml:link rel="alternate" hreflang="vi-VN" href="${SITE_URL}${cleanPath || '/'}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseForParams}${sep}lang=en"/>
    <xhtml:link rel="alternate" hreflang="en-US" href="${baseForParams}${sep}lang=en"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${baseForParams}${sep}lang=zh"/>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${baseForParams}${sep}lang=zh"/>
    <xhtml:link rel="alternate" hreflang="es" href="${baseForParams}${sep}lang=es"/>
    <xhtml:link rel="alternate" hreflang="es-ES" href="${baseForParams}${sep}lang=es"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${cleanPath || '/'}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export function generateSitemapXml() {
  const urls = [];

  // 1. Core Routes
  for (const r of coreRoutes) {
    urls.push(generateUrlXml(r.path, r.priority, r.changefreq));
  }

  // 2. Category Routes (Both /danh-muc/ and /category/)
  for (const slug of categorySlugs) {
    urls.push(generateUrlXml(`/danh-muc/${slug}`, '0.8', 'weekly'));
    urls.push(generateUrlXml(`/category/${slug}`, '0.7', 'weekly'));
  }

  // 3. Tag Routes
  for (const tag of popularTags) {
    urls.push(generateUrlXml(`/tag/${tag}`, '0.7', 'weekly'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return xml;
}

// Generate to public/sitemap.xml
const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
const sitemapContent = generateSitemapXml();
fs.writeFileSync(outputPath, sitemapContent, 'utf-8');
console.log(`[Multilingual Sitemap] Generated successfully at ${outputPath} with ${coreRoutes.length + categorySlugs.length * 2 + popularTags.length} multilingual URLs.`);
