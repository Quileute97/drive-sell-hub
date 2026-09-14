import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const TELEGRAM_COMMUNITY_URL = "https://t.me/+2ZkLgrmVJgBkMGM1";

export const Footer = () => {
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order')
        .limit(5);
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <footer className="bg-card border-t" role="contentinfo">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity inline-flex">
              <img
                src="/logo.png"
                alt="Salemylink Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl shadow-sm object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Salemylink.com
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t("footer.companyDesc")}
            </p>
            <nav className="flex items-center space-x-2" aria-label="Social media links">
              <a
                href={TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sky-500 bg-sky-500/10 hover:bg-sky-500 hover:text-white transition-all shadow-xs"
                aria-label="Group Telegram (Cộng đồng)"
                title="Group Telegram (Cộng đồng)"
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
              <Button variant="ghost" size="icon" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Youtube">
                <Youtube className="h-5 w-5" />
              </Button>
            </nav>
          </div>

          {/* Quick Links */}
          <nav className="space-y-4" aria-labelledby="footer-links-heading">
            <h3 id="footer-links-heading" className="text-lg font-semibold">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={TELEGRAM_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-1.5"
                >
                  <TelegramIcon className="h-4 w-4 shrink-0" />
                  <span>Group Telegram (Cộng đồng)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.howItWorks")}</Link></li>
              <li><Link to="/huong-dan" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.guidesAndTips")}</Link></li>
              <li><Link to="/seller-guide" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.sellerGuide")}</Link></li>
              <li><Link to="/affiliate" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.affiliateProgram")}</Link></li>
              <li><Link to="/nguoi-ban" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.topSellers")}</Link></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.privacyPolicy")}</Link></li>
              <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.termsOfService")}</Link></li>
            </ul>
          </nav>

          {/* Categories */}
          <nav className="space-y-4" aria-labelledby="footer-categories-heading">
            <h3 id="footer-categories-heading" className="text-lg font-semibold">{t("footer.topCategories")}</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link to={`/danh-muc/${category.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <>
                  <li><Link to="/danh-muc/tai-lieu-hoc-tap" className="text-muted-foreground hover:text-primary transition-colors">Tài liệu học tập</Link></li>
                  <li><Link to="/danh-muc/khoa-hoc-online" className="text-muted-foreground hover:text-primary transition-colors">Khóa học Online</Link></li>
                  <li><Link to="/danh-muc/template-design" className="text-muted-foreground hover:text-primary transition-colors">Template & Design</Link></li>
                </>
              )}
            </ul>
          </nav>

          {/* Contact & Language */}
          <div className="space-y-4">
            <address className="space-y-4 not-italic">
              <h3 className="text-lg font-semibold">{t("footer.contact")}</h3>
              <div className="space-y-3 text-sm">
                <a
                  href={TELEGRAM_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-sky-500 transition-colors group"
                >
                  <TelegramIcon className="h-5 w-5 text-sky-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sky-600 dark:text-sky-400 font-medium group-hover:underline">Group Telegram (Cộng đồng)</span>
                </a>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">support@salemylink.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">1900-xxxx</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">Hà Nội, Việt Nam</span>
                </div>
              </div>
            </address>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t("footer.language")}
              </h4>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} {t("footer.allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};