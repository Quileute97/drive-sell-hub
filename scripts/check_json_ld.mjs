import { pathToFileURL } from 'url';
import path from 'path';

async function check() {
  const serverPath = path.resolve('.output/server/index.mjs');
  const serverModule = await import(pathToFileURL(serverPath).href);
  const app = serverModule.default || serverModule;
  const mockEnv = { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } };
  const mockCtx = { waitUntil: () => {}, passThroughOnException: () => {} };
  const res = await app.fetch(new Request('https://salemylink.com/san-pham/thao-luan-van-ban-phap-quy-2495'), mockEnv, mockCtx);
  const html = await res.text();
  const jsonLdMatches = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  console.log('Found', jsonLdMatches?.length, 'JSON-LD script tags:');
  if (jsonLdMatches) {
    for (let i = 0; i < jsonLdMatches.length; i++) {
      console.log('\n--- JSON-LD Tag #' + (i + 1) + ' ---');
      console.log(jsonLdMatches[i]);
    }
  }
}
check().catch(console.error);
