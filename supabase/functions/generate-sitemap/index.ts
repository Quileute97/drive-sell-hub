import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600'
}

const SITE_URL = 'https://salemylink.com'

function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateUrlXml(routePath: string, priority = '0.8', changefreq = 'weekly', lastmod = '2026-09-08', image: { loc: string; title?: string } | null = null) {
  const cleanPath = routePath === '/' ? '' : routePath
  const canonicalUrl = `${SITE_URL}${cleanPath || '/'}`
  const baseForParams = cleanPath ? `${SITE_URL}${cleanPath}` : `${SITE_URL}/`
  const sep = baseForParams.includes('?') ? '&' : '?'

  let xml = `  <url>
    <loc>${escapeXml(canonicalUrl)}</loc>
    <xhtml:link rel="alternate" hreflang="vi" href="${escapeXml(canonicalUrl)}"/>
    <xhtml:link rel="alternate" hreflang="vi-VN" href="${escapeXml(canonicalUrl)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(canonicalUrl)}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`

  if (image && image.loc) {
    xml += `
    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>
      ${image.title ? `<image:title>${escapeXml(image.title)}</image:title>` : ''}
    </image:image>`
  }

  xml += `\n  </url>`
  return xml
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
]

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
]

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
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    const today = new Date().toISOString().split('T')[0]

    // Fetch active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, name, updated_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // Fetch products
    const { data: products } = await supabase
      .from('products')
      .select('slug, title, updated_at, created_at, thumbnail_url, view_count, download_count, is_featured')
      .order('created_at', { ascending: false })

    // Fetch seller profiles
    const { data: sellers } = await supabase
      .from('profiles')
      .select('user_id, full_name, updated_at')
      .eq('role', 'seller')

    const urlEntries: string[] = []

    // 1. Static Routes
    for (const r of coreStaticRoutes) {
      urlEntries.push(generateUrlXml(r.path, r.priority, r.changefreq, today))
    }

    // 2. Categories
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        const lastmod = cat.updated_at ? new Date(cat.updated_at).toISOString().split('T')[0] : today
        urlEntries.push(generateUrlXml(`/danh-muc/${cat.slug}`, '0.85', 'weekly', lastmod))
        urlEntries.push(generateUrlXml(`/category/${cat.slug}`, '0.80', 'weekly', lastmod))
      }
    }

    // 3. Tags
    for (const tag of popularTags) {
      urlEntries.push(generateUrlXml(`/tag/${encodeURIComponent(tag)}`, '0.70', 'weekly', today))
    }

    // 4. Guides
    for (const gSlug of guideSlugs) {
      urlEntries.push(generateUrlXml(`/huong-dan/${gSlug}`, '0.85', 'weekly', today))
      urlEntries.push(generateUrlXml(`/guides/${gSlug}`, '0.80', 'weekly', today))
    }

    // 5. Sellers
    if (sellers && sellers.length > 0) {
      for (const seller of sellers) {
        const sellerId = seller.user_id
        const lastmod = seller.updated_at ? new Date(seller.updated_at).toISOString().split('T')[0] : today
        urlEntries.push(generateUrlXml(`/nguoi-ban/${sellerId}`, '0.70', 'weekly', lastmod))
        urlEntries.push(generateUrlXml(`/seller/${sellerId}`, '0.65', 'weekly', lastmod))
      }
    }

    // 6. Products
    if (products && products.length > 0) {
      for (const prod of products) {
        const lastmod = prod.updated_at
          ? new Date(prod.updated_at).toISOString().split('T')[0]
          : (prod.created_at ? new Date(prod.created_at).toISOString().split('T')[0] : today)

        let priority = 0.70
        if (prod.is_featured) {
          priority = 0.95
        } else if ((prod.download_count || 0) > 30 || (prod.view_count || 0) > 100) {
          priority = 0.90
        } else if ((prod.download_count || 0) > 10 || (prod.view_count || 0) > 30) {
          priority = 0.80
        }

        const img = prod.thumbnail_url
          ? { loc: prod.thumbnail_url, title: prod.title }
          : null

        urlEntries.push(generateUrlXml(`/san-pham/${prod.slug}`, priority.toFixed(2), 'weekly', lastmod, img))
        urlEntries.push(generateUrlXml(`/product/${prod.slug}`, (Math.max(priority - 0.05, 0.5)).toFixed(2), 'weekly', lastmod, img))
      }
    }

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`

    return new Response(xmlContent, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { status: 200, headers: corsHeaders }
    )
  }
})
