import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_URL = 'https://salemylink.com';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dfalphamyvdfewixrnju.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const coreStaticRoutes = [
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
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.4', changefreq: 'yearly' },
];

const popularTags = [
  'ielts',
  'y khoa',
  'luận văn',
  'toeic',
  'react',
  'canva',
  'excel',
  'english',
  'yds',
  'tool',
  'nội khoa',
  'hóa sinh',
  'nhi khoa',
  'ngoại khoa',
  'dược',
  'giải phẫu',
  'tiểu luận',
  'đồ án',
  'python',
  'photoshop',
  'powerpoint',
  'marketing',
  'sản khoa',
  'đề thi',
];

const guideSlugs = [
  'cach-mua-tai-lieu-hoc-tap-online-an-toan',
  'top-10-tai-lieu-ielts-mien-phi-tot-nhat-2026',
  'hoc-y-khoa-tu-zero',
  'viet-luan-van-tieng-anh-band-7',
  'de-thi-vao-10-cac-tinh-2026',
  'hoc-y-khoa',
  'luyen-thi-ielts',
  'viet-luan-van',
  'kinh-nghiem-mua-tai-lieu-online',
  'tai-lieu-on-thi-vao-10',
];

function generateUrlXml(routePath, priority = '0.8', changefreq = 'weekly', lastmod = '2026-09-08', image = null) {
  const cleanPath = routePath === '/' ? '' : routePath;
  const canonicalUrl = `${SITE_URL}${cleanPath || '/'}`;
  const baseForParams = cleanPath ? `${SITE_URL}${cleanPath}` : `${SITE_URL}/`;
  const sep = baseForParams.includes('?') ? '&' : '?';

  let xml = `  <url>
    <loc>${escapeXml(canonicalUrl)}</loc>
    <xhtml:link rel="alternate" hreflang="vi" href="${escapeXml(SITE_URL + (cleanPath || '/'))}"/>
    <xhtml:link rel="alternate" hreflang="vi-VN" href="${escapeXml(SITE_URL + (cleanPath || '/'))}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(baseForParams + sep + 'lang=en')}"/>
    <xhtml:link rel="alternate" hreflang="en-US" href="${escapeXml(baseForParams + sep + 'lang=en')}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(baseForParams + sep + 'lang=zh')}"/>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(baseForParams + sep + 'lang=zh')}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${escapeXml(baseForParams + sep + 'lang=es')}"/>
    <xhtml:link rel="alternate" hreflang="es-ES" href="${escapeXml(baseForParams + sep + 'lang=es')}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(SITE_URL + (cleanPath || '/'))}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

  if (image && image.loc) {
    xml += `
    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>
      ${image.title ? `<image:title>${escapeXml(image.title)}</image:title>` : ''}
    </image:image>`;
  }

  xml += `\n  </url>`;
  return xml;
}

async function fetchAllFromSupabase(table, select, filter = '') {
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&offset=${from}&limit=${pageSize}`;
    if (filter) {
      url += `&${filter}`;
    }

    try {
      const resp = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (!resp.ok) {
        console.error(`Error fetching ${table}: ${resp.status}`);
        break;
      }

      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        allData = allData.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.error(`Fetch exception for ${table}:`, err);
      hasMore = false;
    }
  }

  return allData;
}

export async function generateFullSitemap() {
  console.log('Generating comprehensive sitemap from Supabase data...');
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch products
  const products = await fetchAllFromSupabase(
    'products',
    'id,slug,title,status,thumbnail_url,download_count,view_count,rating_count,is_featured,updated_at,created_at',
    'order=created_at.desc'
  );
  console.log(`Fetched ${products.length} products.`);

  // 2. Fetch categories
  const categories = await fetchAllFromSupabase(
    'categories',
    'id,slug,name,is_active,updated_at',
    'is_active=eq.true'
  );
  console.log(`Fetched ${categories.length} active categories.`);

  // 3. Fetch sellers
  const sellers = await fetchAllFromSupabase(
    'profiles',
    'id,user_id,full_name,role,updated_at,avatar_url',
    'role=eq.seller'
  );
  console.log(`Fetched ${sellers.length} active sellers.`);

  const urlEntries = [];

  // Add Core Static Routes
  for (const r of coreStaticRoutes) {
    urlEntries.push(generateUrlXml(r.path, r.priority, r.changefreq, today));
  }

  // Add Category Routes (/danh-muc/ and /category/)
  for (const cat of categories) {
    const lastmod = cat.updated_at ? new Date(cat.updated_at).toISOString().split('T')[0] : today;
    urlEntries.push(generateUrlXml(`/danh-muc/${cat.slug}`, '0.85', 'weekly', lastmod));
    urlEntries.push(generateUrlXml(`/category/${cat.slug}`, '0.80', 'weekly', lastmod));
  }

  // Add Tag Routes (/tag/)
  for (const tag of popularTags) {
    urlEntries.push(generateUrlXml(`/tag/${encodeURIComponent(tag)}`, '0.70', 'weekly', today));
  }

  // Add Guide Routes (/huong-dan/ and /guides/)
  for (const gSlug of guideSlugs) {
    urlEntries.push(generateUrlXml(`/huong-dan/${gSlug}`, '0.85', 'weekly', today));
    urlEntries.push(generateUrlXml(`/guides/${gSlug}`, '0.80', 'weekly', today));
  }

  // Add Seller Routes (/nguoi-ban/ and /seller/)
  for (const seller of sellers) {
    const sellerId = seller.user_id || seller.id;
    const lastmod = seller.updated_at ? new Date(seller.updated_at).toISOString().split('T')[0] : today;
    urlEntries.push(generateUrlXml(`/nguoi-ban/${sellerId}`, '0.70', 'weekly', lastmod));
    urlEntries.push(generateUrlXml(`/seller/${sellerId}`, '0.65', 'weekly', lastmod));
  }

  // Add Product Routes (/san-pham/ and /product/)
  for (const prod of products) {
    const lastmod = prod.updated_at
      ? new Date(prod.updated_at).toISOString().split('T')[0]
      : (prod.created_at ? new Date(prod.created_at).toISOString().split('T')[0] : today);

    let priority = 0.70;
    if (prod.is_featured) {
      priority = 0.95;
    } else if ((prod.download_count || 0) > 30 || (prod.view_count || 0) > 100) {
      priority = 0.90;
    } else if ((prod.download_count || 0) > 10 || (prod.view_count || 0) > 30) {
      priority = 0.80;
    }

    const img = prod.thumbnail_url
      ? { loc: prod.thumbnail_url, title: prod.title }
      : null;

    urlEntries.push(generateUrlXml(`/san-pham/${prod.slug}`, priority.toFixed(2), 'weekly', lastmod, img));
    urlEntries.push(generateUrlXml(`/product/${prod.slug}`, (Math.max(priority - 0.05, 0.5)).toFixed(2), 'weekly', lastmod, img));
  }

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xmlContent, 'utf-8');
  console.log(`\n🎉 Generated ${urlEntries.length} URLs in sitemap at: ${outputPath}`);
  return urlEntries.length;
}

// Execute
generateFullSitemap().catch(console.error);
