// SEO overrides for known category slugs and tags.
// Keys are normalized (lowercase, trimmed). Falls back to generic template if missing.

export interface SeoOverride {
  title: string;
  description: string;
  keywords?: string[];
}

const normalize = (s: string) => s.trim().toLowerCase();

// Category slug -> SEO copy
const CATEGORY_OVERRIDES: Record<string, SeoOverride> = {
  "tai-lieu-hoc-tap": {
    title: "Tài liệu học tập & đề thi Việt Nam | Salemylink",
    description:
      "Tài liệu học tập, đề thi, giáo trình, sách tham khảo chất lượng cao. Tải xuống nhanh chóng qua Google Drive tại Salemylink.",
    keywords: ["tài liệu học tập", "đề thi", "giáo trình", "sách tham khảo", "học tập việt nam"],
  },
  "ebook-sach": {
    title: "Ebook & Sách Digital | Salemylink",
    description:
      "Kho ebook, sách digital đa thể loại: kinh doanh, kỹ năng, văn học, self-help. Mua và tải PDF/EPUB an toàn tại Salemylink.",
    keywords: ["ebook", "sách digital", "ebook pdf", "sách điện tử", "ebook việt nam"],
  },
  "source-code": {
    title: "Source Code & Template | Salemylink",
    description:
      "Source code website, app, template UI/UX chất lượng. Tải source code React, Next.js, PHP, Flutter và nhiều framework tại Salemylink.",
    keywords: ["source code", "template", "source code website", "template ui", "code mẫu"],
  },
  "khoa-hoc": {
    title: "Khóa học online & Video học | Salemylink",
    description:
      "Khóa học online chất lượng: lập trình, marketing, thiết kế, ngoại ngữ. Học mọi lúc, mọi nơi qua Google Drive tại Salemylink.",
    keywords: ["khóa học online", "video học", "học lập trình", "khóa học marketing"],
  },
  "do-hoa-thiet-ke": {
    title: "Đồ họa & Thiết kế - PSD, AI, Figma | Salemylink",
    description:
      "File đồ họa, thiết kế PSD, AI, Figma, mockup, template Canva chuyên nghiệp. Tải ngay tại Salemylink.",
    keywords: ["đồ họa", "thiết kế", "psd", "template figma", "mockup"],
  },
};

// Tag -> SEO copy (keys normalized to lowercase)
const TAG_OVERRIDES: Record<string, SeoOverride> = {
  "ielts": {
    title: "Tài liệu IELTS, bài mẫu, sách Cambridge | Salemylink",
    description:
      "Tổng hợp tài liệu IELTS: Cambridge IELTS, bài mẫu Writing, Speaking, đề thi thật. Tải nhanh tại Salemylink.",
    keywords: ["ielts", "cambridge ielts", "bài mẫu ielts", "sách ielts", "đề thi ielts"],
  },
  "y khoa": {
    title: "Tài liệu y khoa, bệnh án mẫu, nhi khoa | Salemylink",
    description:
      "Tài liệu y khoa chuyên sâu: bệnh án mẫu, nhi khoa, nội khoa, ngoại khoa, dược lý. Nguồn học tập cho sinh viên y tại Salemylink.",
    keywords: ["tài liệu y khoa", "bệnh án mẫu", "nhi khoa", "nội khoa", "sinh viên y"],
  },
  "luận văn": {
    title: "Luận văn mẫu, tiểu luận, đồ án tốt nghiệp | Salemylink",
    description:
      "Kho luận văn thạc sĩ, luận văn tốt nghiệp, tiểu luận, đồ án mẫu đa ngành. Tham khảo và tải xuống tại Salemylink.",
    keywords: ["luận văn", "luận văn mẫu", "tiểu luận", "đồ án tốt nghiệp"],
  },
  "toeic": {
    title: "Tài liệu TOEIC, đề thi & sách luyện thi | Salemylink",
    description:
      "Sách TOEIC, đề thi thật, tài liệu luyện Listening/Reading. Tăng band điểm nhanh cùng tài liệu tại Salemylink.",
    keywords: ["toeic", "đề thi toeic", "sách toeic", "luyện thi toeic"],
  },
  "react": {
    title: "Source code React, template & khóa học React | Salemylink",
    description:
      "Source code dự án React, template dashboard, khóa học React từ cơ bản đến nâng cao. Tải ngay tại Salemylink.",
    keywords: ["source code react", "template react", "khóa học react"],
  },
  "canva": {
    title: "Template Canva chuyên nghiệp cho thiết kế | Salemylink",
    description:
      "Template Canva đa ngành: social media, presentation, CV, poster. Tải file Canva chất lượng tại Salemylink.",
    keywords: ["template canva", "canva mẫu", "thiết kế canva"],
  },
  "excel": {
    title: "File Excel mẫu, template quản lý & báo cáo | Salemylink",
    description:
      "Template Excel quản lý, báo cáo tài chính, dashboard, hàm nâng cao. Tải file Excel chuyên nghiệp tại Salemylink.",
    keywords: ["file excel", "template excel", "excel mẫu", "excel quản lý"],
  },
};

export function getCategorySeo(slug: string, name: string): SeoOverride {
  const key = normalize(slug);
  if (CATEGORY_OVERRIDES[key]) return CATEGORY_OVERRIDES[key];
  return {
    title: `${name} | Salemylink`,
    description: `Kho ${name} chất lượng cao, tải xuống nhanh qua Google Drive. Mua bán an toàn tại Salemylink.`,
    keywords: [name, `mua ${name}`, `tải ${name}`, "salemylink"],
  };
}

export function getTagSeo(tag: string): SeoOverride {
  const key = normalize(tag);
  if (TAG_OVERRIDES[key]) return TAG_OVERRIDES[key];
  return {
    title: `${tag} - Sản phẩm digital liên quan | Salemylink`,
    description: `Khám phá sản phẩm digital gắn tag "${tag}" tại Salemylink: ebook, tài liệu, khóa học, source code chất lượng.`,
    keywords: [tag, "sản phẩm digital", "salemylink"],
  };
}
