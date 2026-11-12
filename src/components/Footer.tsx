import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const TELEGRAM_COMMUNITY_URL = "https://t.me/+2ZkLgrmVJgBkMGM1";

const FALLBACK_FOOTER_CATEGORIES = [
  { id: "cat-1", name: "Tài liệu học tập", slug: "tai-lieu-hoc-tap" },
  { id: "cat-2", name: "Khóa học Online", slug: "khoa-hoc-online" },
  { id: "cat-3", name: "Ebook - Sách điện tử", slug: "ebook-sach-dien-tu" },
  { id: "cat-4", name: "Source Code & Lập trình", slug: "source-code-lap-trinh" },
  { id: "cat-5", name: "Đồ họa & Thiết kế", slug: "do-hoa-thiet-ke" },
];

export const Footer = ({
  initialCategories,
}: {
  initialCategories?: { id: string; name: string; slug: string }[] | undefined;
}) => {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>(() =>
    initialCategories && initialCategories.length > 0
      ? initialCategories.slice(0, 5)
      : FALLBACK_FOOTER_CATEGORIES
  );
  const { t } = useLanguage();

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories.slice(0, 5));
      return;
    }

    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('sort_order')
          .limit(5);

        if (!cancelled && data && data.length > 0) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [initialCategories]);

  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <div className="mx-auto max-w-[1280px] px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="Salemylink"
                width={34}
                height={34}
                className="size-[34px] rounded-lg object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-primary">
                Salemylink
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("footer.companyDesc")}
            </p>
            <nav className="flex items-center gap-1.5" aria-label="Social media links">
              <a
                href={TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-[#229ED9] hover:text-white transition-colors"
                aria-label="Group Telegram (Cộng đồng)"
                title="Group Telegram (Cộng đồng)"
              >
                <TelegramIcon className="h-4 w-4 shrink-0" />
                <span>Cộng đồng Telegram</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </nav>
          </div>

          {/* Quick Links */}
          <nav className="space-y-3" aria-labelledby="footer-links-heading">
            <h3 id="footer-links-heading" className="text-sm font-semibold text-foreground">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href={TELEGRAM_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Group Telegram (Cộng đồng)"
                  className="inline-flex min-h-8 items-center gap-1.5 py-1 font-medium text-sky-700 hover:underline whitespace-nowrap"
                >
                  <TelegramIcon className="h-4 w-4 shrink-0" />
                  <span>Group Telegram</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </li>
              <li><Link to="/about" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/how-it-works" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.howItWorks")}</Link></li>
              <li><Link to="/huong-dan" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.guidesAndTips")}</Link></li>
              <li><Link to="/seller-guide" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.sellerGuide")}</Link></li>
              <li><Link to="/affiliate" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.affiliateProgram")}</Link></li>
              <li><Link to="/nguoi-ban" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.topSellers")}</Link></li>
              <li><Link to="/privacy-policy" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.privacyPolicy")}</Link></li>
              <li><Link to="/terms-of-service" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">{t("footer.termsOfService")}</Link></li>
            </ul>
          </nav>

          {/* Categories */}
          <nav className="space-y-3" aria-labelledby="footer-categories-heading">
            <h3 id="footer-categories-heading" className="text-sm font-semibold text-foreground">
              {t("footer.topCategories")}
            </h3>
            <ul className="space-y-1 text-sm">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link to={`/danh-muc/${category.slug}`} className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <>
                  <li><Link to="/danh-muc/tai-lieu-hoc-tap" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">Tài liệu học tập</Link></li>
                  <li><Link to="/danh-muc/khoa-hoc-online" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">Khóa học Online</Link></li>
                  <li><Link to="/danh-muc/template-design" className="inline-flex min-h-8 items-center py-1 text-muted-foreground hover:text-primary transition-colors">Template &amp; Design</Link></li>
                </>
              )}
            </ul>
          </nav>

          {/* Contact & Language */}
          <div className="space-y-4">
            <address className="space-y-3 not-italic">
              <h3 className="text-sm font-semibold text-foreground">{t("footer.contact")}</h3>
              <div className="space-y-1.5 text-sm">
                <a
                  href={TELEGRAM_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Group Telegram (Cộng đồng)"
                  className="inline-flex min-h-8 items-center gap-2.5 py-1 text-muted-foreground hover:text-sky-700 transition-colors whitespace-nowrap"
                >
                  <TelegramIcon className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="font-medium text-sky-700 hover:underline">Group Telegram</span>
                </a>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">support@salemylink.com</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">1900-xxxx</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Hà Nội, Việt Nam</span>
                </div>
              </div>
            </address>

            <div className="pt-1">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("footer.language")}
              </h4>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t("footer.allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};