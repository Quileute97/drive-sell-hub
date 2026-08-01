import { Link } from "@/lib/router-compat";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GUIDES } from "@/data/guides";
import { BookOpen, ArrowRight } from "lucide-react";

const BASE = "https://salemylink.com";

export default function Guides() {
  const url = `${BASE}/guides`;

  return (
    <div className="min-h-screen">
      <SEO
        title="Cẩm nang học tập & luyện thi"
        description="Tổng hợp hướng dẫn học Y khoa, luyện thi IELTS, viết luận văn tốt nghiệp… kèm tài liệu và ví dụ sản phẩm thực tế trên Salemylink."
        keywords="cẩm nang học tập, hướng dẫn học y khoa, luyện thi ielts, viết luận văn, tài liệu học tập"
        url={url}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Cẩm nang học tập & luyện thi | Salemylink",
            url,
            description:
              "Tổng hợp hướng dẫn học tập, luyện thi và viết luận văn kèm ví dụ sản phẩm trên Salemylink.",
            hasPart: GUIDES.map((g) => ({
              "@type": "Article",
              headline: g.title,
              url: `${BASE}/guides/${g.slug}`,
              description: g.description,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Trang chủ", item: BASE },
              { "@type": "ListItem", position: 2, name: "Cẩm nang", item: url },
            ],
          },
        ]}
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ label: "Cẩm nang" }]} />

        <section className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Cẩm nang học tập & luyện thi
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hướng dẫn chi tiết theo từng chủ đề — Y khoa, IELTS, luận văn tốt nghiệp — kèm ví dụ tài liệu đang bán trên Salemylink.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="group">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{g.category}</Badge>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {g.title}
                  </h2>
                  <p className="text-sm text-muted-foreground flex-1">
                    {g.description}
                  </p>
                  <span className="mt-4 text-primary text-sm font-medium inline-flex items-center gap-1">
                    Đọc hướng dẫn <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
