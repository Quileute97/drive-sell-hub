import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testProductSsr() {
  const serverPath = path.resolve(__dirname, '../.output/server/index.mjs');
  const serverModule = await import(pathToFileURL(serverPath).href);
  const app = serverModule.default || serverModule;

  const mockEnv = { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } };
  const mockCtx = { waitUntil: () => {}, passThroughOnException: () => {} };
  const req = new Request('https://salemylink.com/san-pham/tu-vung-chat-va-y-tuong-hay-theo-chu-de-cho-b-ai-thi-ielts', {
    headers: { 'Accept': 'text/html', 'User-Agent': 'Googlebot/2.1' }
  });
  const res = await app.fetch(req, mockEnv, mockCtx);
  const html = await res.text();
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null) {
    count++;
    console.log(`\n=== SCRIPT ${count} ===`);
    const fullTag = match[0];
    const content = match[1];
    console.log('Tag opening:', fullTag.slice(0, 100));
    try {
      const parsed = JSON.parse(content);
      console.log('Parsed JSON root keys:', Object.keys(parsed));
      if (parsed['@graph']) {
        console.log('Graph node types:', parsed['@graph'].map(n => n['@type']));
      } else {
        console.log('Root @type:', parsed['@type']);
      }
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
    }
  }
  console.log(`\nTotal JSON-LD scripts found: ${count}`);
}

testProductSsr().catch(console.error);
