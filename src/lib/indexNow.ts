const INDEXNOW_KEY = "04307b9c3b8f10fb48243d7ba088c9c5";
const SITE_URL = "https://salemylink.com";

/**
 * Submit URLs to IndexNow for faster indexing by Bing, Yandex, and other search engines.
 * Call this after publishing/updating a product, category, or page.
 */
export async function submitToIndexNow(urls: string | string[]): Promise<boolean> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  
  // Ensure all URLs are absolute
  const absoluteUrls = urlList.map(url => 
    url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`
  );

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "salemylink.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: absoluteUrls,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] Submitted ${absoluteUrls.length} URL(s) successfully`);
      return true;
    }
    
    console.warn(`[IndexNow] Submission failed with status ${response.status}`);
    return false;
  } catch (error) {
    console.warn("[IndexNow] Submission error:", error);
    return false;
  }
}

/**
 * Notify IndexNow when a product is created or updated.
 */
export function notifyProductChange(slug: string) {
  submitToIndexNow(`${SITE_URL}/product/${slug}`);
}

/**
 * Notify IndexNow when a category page changes.
 */
export function notifyCategoryChange(slug: string) {
  submitToIndexNow(`${SITE_URL}/category/${slug}`);
}
