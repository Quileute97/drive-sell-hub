import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAllRoutes() {
  const serverPath = path.resolve(__dirname, '../.output/server/index.mjs');
  const serverModule = await import(pathToFileURL(serverPath).href);
  const app = serverModule.default || serverModule;

  const testRoutes = [
    '/',
    '/danh-muc/khoa-hoc-online',
    '/tag/ielts',
    '/nguoi-ban/quileute97',
    '/huong-dan',
    '/huong-dan/huong-dan-mua-hang'
  ];

  const mockEnv = { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } };
  const mockCtx = { waitUntil: () => {}, passThroughOnException: () => {} };

  for (const route of testRoutes) {
    console.log('\n========================================');
    console.log('Testing route:', route);
    const req = new Request('https://salemylink.com' + route, {
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
      const graph = parsed['@graph'] || [parsed];
      console.log(`  Script #${scriptIdx} contains types:`, graph.map(n => n['@type']));

      // If there are products (e.g. inside ItemList or direct)
      for (const node of graph) {
        if (node['@type'] === 'ItemList' && Array.isArray(node.itemListElement)) {
          console.log(`    ItemList '${node.name}' has ${node.itemListElement.length} items`);
          const firstItem = node.itemListElement[0]?.item;
          if (firstItem && firstItem['@type'] === 'Product') {
            console.log('      First Product item in ItemList:');
            console.log('        name:', firstItem.name);
            console.log('        brand:', JSON.stringify(firstItem.brand));
            console.log('        image:', JSON.stringify(firstItem.image));
            console.log('        price:', firstItem.offers?.price, firstItem.offers?.priceCurrency);
            const brandMatches = JSON.stringify(firstItem).match(/"brand"\s*:/g);
            console.log('        "brand" key count in Product:', brandMatches?.length);
            const priceMatches = JSON.stringify(firstItem.offers).match(/"price"\s*:/g);
            console.log('        "price" key count in offers:', priceMatches?.length);
          }
        }
      }
    }
  }
}

testAllRoutes().catch(console.error);
