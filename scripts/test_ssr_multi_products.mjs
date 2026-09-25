import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testProducts() {
  const serverPath = path.resolve(__dirname, '../.output/server/index.mjs');
  const serverModule = await import(pathToFileURL(serverPath).href);
  const app = serverModule.default || serverModule;

  const testSlugs = [
    'tu-vung-chat-va-y-tuong-hay-theo-chu-de-cho-b-ai-thi-ielts',
    'thao-luan-van-ban-phap-quy-2495',
    'autoclip-mmyycxgr', // No thumb/images/driveFileId
    'dinh-khop-so-som-gay-bien-dang-hop-so-det-di-tat-chiari-type-1-va-nao-ung-thuy-bao-cao-ca-lam-sang-va-hoi-cuu-y-van-mmrng54e'
  ];

  const mockEnv = { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } };
  const mockCtx = { waitUntil: () => {}, passThroughOnException: () => {} };

  for (const slug of testSlugs) {
    console.log('\n========================================');
    console.log('Testing slug:', slug);
    const req = new Request('https://salemylink.com/san-pham/' + slug, {
      headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
    });
    const res = await app.fetch(req, mockEnv, mockCtx);
    const html = await res.text();
    const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let scriptIdx = 0;
    while ((match = regex.exec(html)) !== null) {
      scriptIdx++;
      const content = match[1];
      const parsed = JSON.parse(content);
      if (parsed['@graph']) {
        const productNodes = parsed['@graph'].filter(n => n['@type'] === 'Product');
        console.log(`  Script #${scriptIdx} graph has ${productNodes.length} Product node(s)`);
        for (const productNode of productNodes) {
          console.log('    name:', productNode.name);
          console.log('    brand:', JSON.stringify(productNode.brand));
          console.log('    image:', JSON.stringify(productNode.image));
          console.log('    offers.price:', productNode.offers?.price, productNode.offers?.priceCurrency);
          console.log('    sku:', productNode.sku);
          console.log('    aggregateRating:', productNode.aggregateRating?.ratingValue, `(${productNode.aggregateRating?.reviewCount} reviews)`);
          console.log('    reviews count in schema:', productNode.review?.length);

          const productString = JSON.stringify(productNode);
          const brandMatches = productString.match(/"brand"\s*:/g);
          console.log('    "brand" key count in Product JSON:', brandMatches?.length);
          const priceMatches = JSON.stringify(productNode.offers).match(/"price"\s*:/g);
          console.log('    "price" key count in offers JSON:', priceMatches?.length);
        }
      }
    }
  }
}

testProducts().catch(console.error);
