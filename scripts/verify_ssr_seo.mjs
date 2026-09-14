import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifySeo() {
  console.log('=== VERIFYING SEO IMPLEMENTATION ===\n');

  // 1. Verify sitemap.xml
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('sitemap.xml does not exist!');
  }
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  
  const hasPlaceholders = sitemapContent.includes('placeholder');
  const hasLangQueryParams = sitemapContent.includes('?lang=') || sitemapContent.includes('&amp;lang=');
  const hasImageCaptions = sitemapContent.includes('<image:caption>');
  const hasImageTitles = sitemapContent.includes('<image:title>');
  const hasViHreflang = sitemapContent.includes('hreflang="vi"');
  const hasXDefault = sitemapContent.includes('hreflang="x-default"');

  console.log('1. Sitemap checks:');
  console.log('   - No placeholders in sitemap:', !hasPlaceholders ? '✅ PASS' : '❌ FAIL');
  console.log('   - No ?lang= query param hreflangs:', !hasLangQueryParams ? '✅ PASS' : '❌ FAIL');
  console.log('   - Has <image:caption> entries:', hasImageCaptions ? '✅ PASS' : '❌ FAIL');
  console.log('   - Has <image:title> entries:', hasImageTitles ? '✅ PASS' : '❌ FAIL');
  console.log('   - Has vi & x-default hreflangs:', (hasViHreflang && hasXDefault) ? '✅ PASS' : '❌ FAIL');

  // 2. Verify server handler SSR response
  const serverPath = path.resolve(__dirname, '../.output/server/index.mjs');
  if (fs.existsSync(serverPath)) {
    console.log('\n2. Testing Nitro SSR Server Entry:');
    try {
      const { pathToFileURL } = await import('url');
      const serverModule = await import(pathToFileURL(serverPath).href);
      const app = serverModule.default || serverModule;

      const mockEnv = { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } };
      const mockCtx = { waitUntil: () => {}, passThroughOnException: () => {} };

      // Test Homepage SSR
      const homeReq = new Request('https://salemylink.com/', {
        headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
      });
      const homeRes = await app.fetch(homeReq, mockEnv, mockCtx);
      const homeHtml = await homeRes.text();

      console.log('   - Homepage Status:', homeRes.status === 200 ? '✅ 200 OK' : `❌ Status ${homeRes.status}`);
      console.log('   - Homepage Cache-Control:', homeRes.headers.get('cache-control') || 'None');
      console.log('   - Homepage Title:', homeHtml.includes('<title>Salemylink - Marketplace Ebook') ? '✅ Unique & Optimized' : '❌ Check Title');
      console.log('   - Homepage H1 Content:', homeHtml.includes('Mua bán tài liệu số, ebook') ? '✅ Rich Content Present' : '❌ Missing H1');
      console.log('   - Homepage Categories Links:', homeHtml.includes('/danh-muc/') ? '✅ Category Links Rendered' : '❌ Missing Category Links');
      console.log('   - Homepage Popular Tags:', homeHtml.includes('/tag/') ? '✅ Tag Links Rendered' : '❌ Missing Tag Links');
      console.log('   - Homepage No Skeleton boxes:', !homeHtml.includes('<div class="h-8 bg-muted rounded w-1/3 mx-auto"></div>') ? '✅ PASS (No Skeleton)' : '❌ Skeleton found');

      // Test Category SSR
      const catReq = new Request('https://salemylink.com/danh-muc/tai-lieu-hoc-tap', {
        headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
      });
      const catRes = await app.fetch(catReq, mockEnv, mockCtx);
      const catHtml = await catRes.text();

      console.log('\n3. Category Page SSR (/danh-muc/tai-lieu-hoc-tap):');
      console.log('   - Status:', catRes.status === 200 ? '✅ 200 OK' : `❌ Status ${catRes.status}`);
      console.log('   - Title:', catHtml.includes('Tài liệu học tập') ? '✅ Category Name in Title' : '❌ Check Title');
      console.log('   - Breadcrumb HTML:', catHtml.includes('aria-label="Breadcrumb"') ? '✅ Visible Breadcrumb' : '❌ Missing Breadcrumb');
      console.log('   - Product links with <a href=".../san-pham/...":', catHtml.includes('/san-pham/') ? '✅ Real Product Links' : '❌ Missing Links');
      console.log('   - ItemList Schema:', catHtml.includes('"@type":"ItemList"') || catHtml.includes('"@type": "ItemList"') ? '✅ Structured Data Present' : '❌ Missing Schema');

    } catch (err) {
      console.error('SSR test error:', err);
    }
  }

  console.log('\n=== ALL VERIFICATION CHECKS COMPLETED ===');
}

verifySeo().catch(console.error);
