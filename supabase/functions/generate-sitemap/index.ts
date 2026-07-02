import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600'
}

const SITE_URL = 'https://salemylink.com'

// Helper to escape XML special characters
function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Helper to get Google Drive thumbnail URL
function getGoogleDriveThumbnail(driveUrl: string): string | null {
  if (!driveUrl) return null
  const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
  if (fileIdMatch) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w800`
  }
  return null
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating dynamic sitemap...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch active categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('slug, name, updated_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (catError) {
      console.error('Error fetching categories:', catError)
    }

    // Fetch active products with more details
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('slug, title, updated_at, rating_average, rating_count, view_count, download_count, google_drive_link, thumbnail_url, is_featured')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (prodError) {
      console.error('Error fetching products:', prodError)
    }

    // Fetch seller profiles
    const { data: sellers, error: sellerError } = await supabase
      .from('profiles')
      .select('user_id, full_name, updated_at')
      .eq('role', 'seller')

    if (sellerError) {
      console.error('Error fetching sellers:', sellerError)
    }

    console.log(`Found ${categories?.length || 0} categories, ${products?.length || 0} products, ${sellers?.length || 0} sellers`)

    const today = new Date().toISOString().split('T')[0]

    // Generate sitemap XML with image extension
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${SITE_URL}/og-image.png</image:loc>
      <image:title>Salemylink.com - Nền tảng bán sản phẩm Digital</image:title>
    </image:image>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/how-it-works</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/seller-guide</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/search</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${SITE_URL}/sellers</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>${SITE_URL}/terms-of-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>${SITE_URL}/auth</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>${SITE_URL}/seller-auth</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`

    // Add category pages
    if (categories && categories.length > 0) {
      sitemap += `
  <!-- Category Pages (${categories.length} categories) -->`
      for (const category of categories) {
        const lastmod = category.updated_at 
          ? new Date(category.updated_at).toISOString().split('T')[0]
          : today
        sitemap += `
  <url>
    <loc>${SITE_URL}/category/${escapeXml(category.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      }
    }

    // Add seller profile pages
    if (sellers && sellers.length > 0) {
      sitemap += `

  <!-- Seller Profile Pages (${sellers.length} sellers) -->`
      for (const seller of sellers) {
        const lastmod = seller.updated_at 
          ? new Date(seller.updated_at).toISOString().split('T')[0]
          : today
        sitemap += `
  <url>
    <loc>${SITE_URL}/seller/${seller.user_id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
      }
    }

    // Add product pages with images
    if (products && products.length > 0) {
      sitemap += `

  <!-- Product Pages (${products.length} products) -->`
      for (const product of products) {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : today
        
        // Calculate priority based on popularity and featured status
        let priority = 0.7
        if (product.is_featured) {
          priority = 0.95
        } else if (product.view_count > 100 || product.download_count > 50 || product.rating_count > 10) {
          priority = 0.9
        } else if (product.view_count > 50 || product.download_count > 20 || product.rating_count > 5) {
          priority = 0.85
        } else if (product.view_count > 20 || product.download_count > 10) {
          priority = 0.8
        }
        
        // Get image URL
        const imageUrl = product.thumbnail_url || getGoogleDriveThumbnail(product.google_drive_link)
        
        sitemap += `
  <url>
    <loc>${SITE_URL}/product/${escapeXml(product.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority.toFixed(2)}</priority>`
        
        // Add image if available
        if (imageUrl) {
          sitemap += `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(product.title)}</image:title>
    </image:image>`
        }
        
        sitemap += `
  </url>`
      }
    }

    sitemap += `

</urlset>`

    console.log('Sitemap generated successfully with', 
      (categories?.length || 0), 'categories,',
      (products?.length || 0), 'products,',
      (sellers?.length || 0), 'sellers'
    )

    return new Response(sitemap, {
      status: 200,
      headers: corsHeaders
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
