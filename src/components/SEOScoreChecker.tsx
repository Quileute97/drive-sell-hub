import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SEOCheck {
  label: string;
  status: 'good' | 'warning' | 'bad';
  message: string;
  score: number; // 0-100
}

interface SEOScoreCheckerProps {
  html: string;
  title?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getHeadings(html: string): { level: number; text: string }[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const headings: { level: number; text: string }[] = [];
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
    headings.push({
      level: parseInt(el.tagName[1]),
      text: el.textContent || '',
    });
  });
  return headings;
}

function getImages(html: string): { src: string; alt: string }[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images: { src: string; alt: string }[] = [];
  doc.querySelectorAll('img').forEach((img) => {
    images.push({ src: img.src, alt: img.alt });
  });
  return images;
}

function getLinks(html: string): number {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelectorAll('a[href]').length;
}

function calcKeywordDensity(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const words = countWords(text);
  if (words === 0) return 0;
  const kw = keyword.toLowerCase();
  const matches = text.toLowerCase().split(kw).length - 1;
  const kwWords = countWords(keyword);
  return (matches * kwWords / words) * 100;
}

export function SEOScoreChecker({
  html,
  title = '',
  metaDescription = '',
  focusKeyword = '',
}: SEOScoreCheckerProps) {
  const checks = useMemo<SEOCheck[]>(() => {
    const plainText = stripHtml(html);
    const wordCount = countWords(plainText);
    const headings = getHeadings(html);
    const images = getImages(html);
    const linkCount = getLinks(html);
    const results: SEOCheck[] = [];

    // 1. Word count
    if (wordCount >= 300) {
      results.push({ label: 'Độ dài nội dung', status: 'good', message: `${wordCount} từ — đủ dài cho SEO`, score: 100 });
    } else if (wordCount >= 150) {
      results.push({ label: 'Độ dài nội dung', status: 'warning', message: `${wordCount} từ — nên viết thêm (tối thiểu 300 từ)`, score: 50 });
    } else {
      results.push({ label: 'Độ dài nội dung', status: 'bad', message: `${wordCount} từ — quá ngắn (cần ít nhất 150 từ)`, score: 10 });
    }

    // 2. Heading structure
    const h2Count = headings.filter((h) => h.level === 2).length;
    const h3Count = headings.filter((h) => h.level === 3).length;
    if (h2Count >= 1 && h3Count >= 0) {
      results.push({ label: 'Cấu trúc heading', status: 'good', message: `${h2Count} H2, ${h3Count} H3 — cấu trúc tốt`, score: 100 });
    } else if (h2Count >= 1) {
      results.push({ label: 'Cấu trúc heading', status: 'warning', message: `Có H2 nhưng thiếu H3 — nên thêm tiêu đề phụ`, score: 60 });
    } else {
      results.push({ label: 'Cấu trúc heading', status: 'bad', message: `Thiếu H2 — nên chia nội dung bằng tiêu đề`, score: 0 });
    }

    // 3. Images & alt text
    if (images.length > 0) {
      const withAlt = images.filter((i) => i.alt && i.alt.trim().length > 0).length;
      if (withAlt === images.length) {
        results.push({ label: 'Hình ảnh & Alt text', status: 'good', message: `${images.length} ảnh, tất cả có alt text`, score: 100 });
      } else {
        results.push({ label: 'Hình ảnh & Alt text', status: 'warning', message: `${withAlt}/${images.length} ảnh có alt text`, score: 50 });
      }
    } else {
      results.push({ label: 'Hình ảnh & Alt text', status: 'warning', message: `Chưa có ảnh — nên thêm ít nhất 1 ảnh`, score: 30 });
    }

    // 4. Internal/external links
    if (linkCount >= 2) {
      results.push({ label: 'Liên kết', status: 'good', message: `${linkCount} liên kết — tốt cho SEO`, score: 100 });
    } else if (linkCount >= 1) {
      results.push({ label: 'Liên kết', status: 'warning', message: `${linkCount} liên kết — nên thêm`, score: 50 });
    } else {
      results.push({ label: 'Liên kết', status: 'bad', message: `Chưa có liên kết nào`, score: 20 });
    }

    // 5. Keyword density
    if (focusKeyword.trim()) {
      const density = calcKeywordDensity(plainText, focusKeyword);
      if (density >= 1 && density <= 3) {
        results.push({ label: 'Mật độ từ khóa', status: 'good', message: `${density.toFixed(1)}% — lý tưởng`, score: 100 });
      } else if (density > 0 && density < 1) {
        results.push({ label: 'Mật độ từ khóa', status: 'warning', message: `${density.toFixed(1)}% — hơi thấp (nên 1-3%)`, score: 50 });
      } else if (density > 3) {
        results.push({ label: 'Mật độ từ khóa', status: 'warning', message: `${density.toFixed(1)}% — hơi cao, tránh nhồi từ khóa`, score: 40 });
      } else {
        results.push({ label: 'Mật độ từ khóa', status: 'bad', message: `Không tìm thấy từ khóa "${focusKeyword}"`, score: 0 });
      }

      // Keyword in headings
      const kwInHeading = headings.some((h) => h.text.toLowerCase().includes(focusKeyword.toLowerCase()));
      results.push({
        label: 'Từ khóa trong heading',
        status: kwInHeading ? 'good' : 'bad',
        message: kwInHeading ? 'Từ khóa xuất hiện trong heading' : 'Nên thêm từ khóa vào ít nhất 1 heading',
        score: kwInHeading ? 100 : 0,
      });
    }

    // 6. Meta title
    if (title.trim()) {
      const len = title.trim().length;
      if (len >= 30 && len <= 60) {
        results.push({ label: 'Tiêu đề SEO', status: 'good', message: `${len} ký tự — độ dài lý tưởng`, score: 100 });
      } else if (len > 0 && len < 30) {
        results.push({ label: 'Tiêu đề SEO', status: 'warning', message: `${len} ký tự — nên dài 30-60 ký tự`, score: 50 });
      } else if (len > 60) {
        results.push({ label: 'Tiêu đề SEO', status: 'warning', message: `${len} ký tự — quá dài, nên dưới 60`, score: 40 });
      }
    }

    // 7. Meta description
    if (metaDescription.trim()) {
      const len = metaDescription.trim().length;
      if (len >= 120 && len <= 160) {
        results.push({ label: 'Mô tả meta', status: 'good', message: `${len} ký tự — lý tưởng`, score: 100 });
      } else if (len > 0 && len < 120) {
        results.push({ label: 'Mô tả meta', status: 'warning', message: `${len} ký tự — nên 120-160 ký tự`, score: 50 });
      } else if (len > 160) {
        results.push({ label: 'Mô tả meta', status: 'warning', message: `${len} ký tự — quá dài`, score: 40 });
      }
    }

    // 8. Paragraph length check
    const paragraphs = html.split(/<\/p>|<\/h[1-6]>/).filter(Boolean);
    const longParagraphs = paragraphs.filter((p) => countWords(stripHtml(p)) > 150).length;
    if (longParagraphs === 0) {
      results.push({ label: 'Độ dài đoạn văn', status: 'good', message: 'Các đoạn văn có độ dài phù hợp', score: 100 });
    } else {
      results.push({ label: 'Độ dài đoạn văn', status: 'warning', message: `${longParagraphs} đoạn quá dài (>150 từ)`, score: 40 });
    }

    return results;
  }, [html, title, metaDescription, focusKeyword]);

  const overallScore = useMemo(() => {
    if (checks.length === 0) return 0;
    return Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length);
  }, [checks]);

  const scoreColor = overallScore >= 70 ? 'text-green-600' : overallScore >= 40 ? 'text-yellow-600' : 'text-red-600';
  const progressColor = overallScore >= 70 ? 'bg-green-500' : overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  const statusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'good': return <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />;
      case 'bad': return <XCircle className="h-4 w-4 text-red-600 shrink-0" />;
    }
  };

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={cn('text-2xl font-bold', scoreColor)}>{overallScore}</div>
          <div className="text-left">
            <p className="text-sm font-medium">Điểm SEO</p>
            <p className="text-xs text-muted-foreground">
              {overallScore >= 70 ? 'Tốt' : overallScore >= 40 ? 'Cần cải thiện' : 'Yếu'} — {checks.filter(c => c.status === 'good').length}/{checks.length} tiêu chí đạt
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={overallScore >= 70 ? 'default' : overallScore >= 40 ? 'secondary' : 'destructive'}>
            {overallScore >= 70 ? 'Tốt' : overallScore >= 40 ? 'Trung bình' : 'Cần cải thiện'}
          </Badge>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-1 p-3 rounded-lg border bg-card">
          <div className="mb-3">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className={cn('h-full rounded-full transition-all duration-500', progressColor)} style={{ width: `${overallScore}%` }} />
            </div>
          </div>
          {checks.map((check, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5 text-sm">
              {statusIcon(check.status)}
              <div>
                <span className="font-medium">{check.label}:</span>{' '}
                <span className="text-muted-foreground">{check.message}</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
