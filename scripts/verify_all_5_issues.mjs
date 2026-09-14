import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVerification() {
  console.log('====================================================');
  console.log('       VERIFYING 5 REPORTED ISSUES ON NITRO SSR     ');
  console.log('====================================================\n');

  const serverPath = path.resolve(__dirname, '../.output/server/index.mjs');
  if (!fs.existsSync(serverPath)) {
    throw new Error('SSR server build not found at: ' + serverPath);
  }

  const serverModule = await import(pathToFileURL(serverPath).href);
  const app = serverModule.default || serverModule;

  const mockEnv = {
    ASSETS: {
      fetch: async () => new Response(null, { status: 404 }),
    },
  };
  const mockCtx = {
    waitUntil: () => {},
    passThroughOnException: () => {},
  };

  const fetchSsr = (req) => app.fetch(req, mockEnv, mockCtx);

  // ----------------------------------------------------
  // 1. Check Issue 1: Hreflang & Multilingual Content
  // ----------------------------------------------------
  console.log('--- 1. Testing Hreflang & Multilingual declarations ---');
  const req1 = new Request('https://salemylink.com/', {
    headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
  });
  const res1 = await fetchSsr(req1);
  const html1 = await res1.text();

  const hasFakeHreflangs = html1.includes('hreflang="en"') || html1.includes('hreflang="zh"') || html1.includes('hreflang="es"');
  const hasViHreflang = html1.includes('hreflang="vi"');
  const hasViVnHreflang = html1.includes('hreflang="vi-VN"');
  const hasXDefault = html1.includes('hreflang="x-default"');
  const hasFakeLocales = html1.includes('content="en_US"') || html1.includes('content="zh_CN"') || html1.includes('content="es_ES"');
  const hasVietnameseContentLanguage = html1.includes('content-language" content="vi"') || html1.includes('content-language" content="vi-VN"');

  console.log('   - No fake hreflangs (en/zh/es):', !hasFakeHreflangs ? '✅ PASS' : '❌ FAIL');
  console.log('   - Has vi / vi-VN hreflangs:', (hasViHreflang && hasViVnHreflang) ? '✅ PASS' : '❌ FAIL');
  console.log('   - Has x-default hreflang:', hasXDefault ? '✅ PASS' : '❌ FAIL');
  console.log('   - No fake og:locale:alternate (en_US/zh_CN/es_ES):', !hasFakeLocales ? '✅ PASS' : '❌ FAIL');
  console.log('   - content-language is vi:', hasVietnameseContentLanguage ? '✅ PASS' : '❌ FAIL');

  // ----------------------------------------------------
  // 2. Check Issue 2: FAQ Answers in SSR HTML
  // ----------------------------------------------------
  console.log('\n--- 2. Testing FAQ Answers in SSR HTML ---');
  const req2 = new Request('https://salemylink.com/san-pham/thao-luan-van-ban-phap-quy-2495', {
    headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
  });
  const res2 = await fetchSsr(req2);
  const html2 = await res2.text();

  const hasFaqQuestion = html2.includes('Tôi nhận sản phẩm như thế nào sau khi mua?') || html2.includes('Câu hỏi thường gặp');
  const hasFaqAnswerText = html2.includes('Sau khi thanh toán thành công, bạn sẽ nhận được link Google Drive');
  
  console.log('   - FAQ Question present in SSR:', hasFaqQuestion ? '✅ PASS' : '❌ FAIL');
  console.log('   - FAQ Answer content rendered in SSR HTML:', hasFaqAnswerText ? '✅ PASS (Answers NOT empty!)' : '❌ FAIL (Answers empty in SSR)');

  // ----------------------------------------------------
  // 3. Check Issue 3: OG Image Uniqueness Across Products
  // ----------------------------------------------------
  console.log('\n--- 3. Testing OG Images on Product Pages ---');
  
  // Product A: thao-luan-van-ban-phap-quy-2495
  const ogImgA = html2.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || '';
  
  // Product B: b-ai-1-qua-trinh-hinh-thanh-va-phat-trien-phoi-th-ai-cua-he-tim-mach-tsbs-do-nguyen-tin-mn1uhhxh
  const req3B = new Request('https://salemylink.com/san-pham/b-ai-1-qua-trinh-hinh-thanh-va-phat-trien-phoi-th-ai-cua-he-tim-mach-tsbs-do-nguyen-tin-mn1uhhxh', {
    headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
  });
  const res3B = await fetchSsr(req3B);
  const html3B = await res3B.text();
  const ogImgB = html3B.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || '';

  // Product C: 50-de-thuc-chien-luyen-thi-vao-10-ha-noi-de-so-4-mnr99e4u
  const req3C = new Request('https://salemylink.com/san-pham/50-de-thuc-chien-luyen-thi-vao-10-ha-noi-de-so-4-mnr99e4u', {
    headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
  });
  const res3C = await fetchSsr(req3C);
  const html3C = await res3C.text();
  const ogImgC = html3C.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || '';

  console.log('   - Product A (thao-luan-van-ban):', ogImgA);
  console.log('   - Product B (b-ai-1):', ogImgB);
  console.log('   - Product C (50-de-luyen-thi):', ogImgC);

  const areImagesUnique = (ogImgA && ogImgB && ogImgC && ogImgA !== ogImgB && ogImgB !== ogImgC);
  console.log('   - Products have unique OG images:', areImagesUnique ? '✅ PASS (Unique images!)' : '❌ FAIL (Duplicate images)');

  // ----------------------------------------------------
  // 4. Check Issue 4: Placeholder references in SSR data
  // ----------------------------------------------------
  console.log('\n--- 4. Testing Placeholder references for bo-slide-thuyet-trinh ---');
  const req4 = new Request('https://salemylink.com/san-pham/bo-slide-thuyet-trinh', {
    headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
  });
  const res4 = await fetchSsr(req4);
  const html4 = await res4.text();

  const hasPlaceholderInHtml = html4.includes('via.placeholder.com');
  console.log('   - Status:', res4.status === 200 ? '✅ 200 OK' : `❌ Status ${res4.status}`);
  console.log('   - No via.placeholder.com in SSR HTML / JSON:', !hasPlaceholderInHtml ? '✅ PASS (Zero placeholders!)' : '❌ FAIL (Placeholder found!)');

  // ----------------------------------------------------
  // 5. Check Issue 5: /sellers Redirect
  // ----------------------------------------------------
  console.log('\n--- 5. Testing /sellers Redirect ---');
  const req5 = new Request('https://salemylink.com/sellers', {
    headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
  });
  const res5 = await fetchSsr(req5);
  const location5 = res5.headers.get('location');

  console.log('   - /sellers HTTP Status:', res5.status === 301 || res5.status === 302 ? `✅ ${res5.status}` : `❌ Status ${res5.status}`);
  console.log('   - /sellers Location header:', location5 === '/nguoi-ban' || location5 === 'https://salemylink.com/nguoi-ban' ? `✅ ${location5}` : `❌ ${location5}`);

  console.log('\n====================================================');
  console.log('              ALL 5 CHECKS COMPLETED                ');
  console.log('====================================================');
}

runVerification().catch(console.error);
