import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "@/lib/router-compat";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { getGuideBySlug, GUIDES } from "@/data/guides";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

const BASE = "https://salemylink.com";

interface ProductRow {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  price: number;
  original_price: number | null;
  google_drive_link: string | null;
  thumbnail_url: string | null;
  file_format: string | null;
  categories: { name: string; slug: string } | null;
}

export default function GuideDetail() {
  const { slug = "" } = useParams();
  const guide = getGuideBySlug(slug);
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    if (!guide) return;
    (async () => {
      const orClause = guide.productKeywords
        .map((k) => `title.ilike.%${k}%`)
        .join(",");
      const { data } = await supabase
        .from("products")
        .select(
          `id, slug, title, short_description, price, original_price, google_drive_link, thumbnail_url, file_format, categories(name, slug)`
        )
        .eq("status", "active")
        .or(orClause)
        .order("download_count", { ascending: false })
        .limit(6);
      setProducts((data as any) || []);
    })();
  }, [guide]);

  if (!guide) return <Navigate to="/guides" replace />;

  const url = `${BASE}/guides/${guide.slug}`;
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  const related = (guide.relatedGuides || [])
    .map((s) => GUIDES.find((g) => g.slug === s))
    .filter(Boolean) as typeof GUIDES;

  return (
    <div className="min-h-screen">
      <SEO
        title={guide.metaTitle}
        description={guide.description}
        keywords={guide.keywords}
        url={url}
        type="article"
        publishedTime={`${guide.updatedAt}T00:00:00+07:00`}
        modifiedTime={`${guide.updatedAt}T00:00:00+07:00`}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            datePublished: `${guide.updatedAt}T00:00:00+07:00`,
            dateModified: `${guide.updatedAt}T00:00:00+07:00`,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Organization", name: "Salemylink.com", url: BASE },
            publisher: {
              "@type": "Organization",
              name: "Salemylink.com",
              logo: { "@type": "ImageObject", url: `${BASE}/logo.png` },
            },
            articleSection: guide.category,
            keywords: guide.keywords,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Trang chủ", item: BASE },
              { "@type": "ListItem", position: 2, name: "Cẩm nang", item: `${BASE}/guides` },
              { "@type": "ListItem", position: 3, name: guide.category, item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumb
          items={[
            { label: "Cẩm nang", href: "/guides" },
            { label: guide.category },
          ]}
        />

        <article>
          <header className="mb-8">
            <Badge variant="secondary" className="mb-3">
              {guide.category}
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{guide.title}</h1>
            <p className="text-lg text-muted-foreground italic">"{guide.hero}"</p>
          </header>

          <div className="prose prose-lg max-w-none mb-10">
            <p className="text-base leading-relaxed">{guide.intro}</p>
          </div>

          {guide.sections.map((s, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-2xl font-bold mb-3">{s.heading}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">{s.body}</p>
              {s.items && (
                <ul className="space-y-2">
                  {s.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Example products (traffic → conversion bridge) */}
          {products.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-2">
                Tài liệu {guide.category} nổi bật trên Salemylink
              </h2>
              <p className="text-muted-foreground mb-6">
                Một số sản phẩm liên quan đến chủ đề này được người dùng tải nhiều nhất.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card"
                  >
                    <div className="aspect-[4/3] bg-muted overflow-hidden">
                      <ProductThumbnail
                        googleDriveLink={p.google_drive_link}
                        thumbnailUrl={p.thumbnail_url}
                        fileFormat={p.file_format}
                        title={p.title}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
                        {p.title}
                      </h3>
                      <p className="text-primary font-bold mt-2 text-sm">
                        {p.price === 0 ? "Miễn phí" : formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {guide.categorySlug && (
                <div className="mt-6 text-center">
                  <Link to={`/category/${guide.categorySlug}`}>
                    <Button variant="outline">
                      Xem thêm trong danh mục {guide.category}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Câu hỏi thường gặp</h2>
            <div className="space-y-4">
              {guide.faq.map((f, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2">{f.q}</h3>
                    <p className="text-muted-foreground text-sm">{f.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Related guides */}
          {related.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Hướng dẫn liên quan</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link key={r.slug} to={`/guides/${r.slug}`} className="group">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-5 flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold group-hover:text-primary">
                            {r.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {r.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
