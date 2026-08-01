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
  "english": {
    title: "Tài liệu tiếng Anh, đề thi, bài mẫu | Salemylink",
    description:
      "Tài liệu tiếng Anh: ngữ pháp, từ vựng, đề thi, bài mẫu Writing & Speaking cho mọi trình độ. Tải nhanh tại Salemylink.",
    keywords: ["tài liệu tiếng anh", "đề thi tiếng anh", "bài mẫu tiếng anh", "học tiếng anh"],
  },
  "yds": {
    title: "Tài liệu YDS, từ vựng, đề thi | Salemylink",
    description:
      "Tài liệu YDS: từ vựng chuyên ngành, đề thi thử, hướng dẫn ôn luyện đầy đủ. Tải xuống ngay tại Salemylink.",
    keywords: ["yds", "tài liệu yds", "từ vựng yds", "đề thi yds"],
  },
  "tool": {
    title: "Toolkit, template & công cụ học tập | Salemylink",
    description:
      "Bộ công cụ, toolkit và template hỗ trợ học tập, làm việc: quản lý thời gian, ghi chú, báo cáo. Tải tại Salemylink.",
    keywords: ["toolkit", "công cụ học tập", "template", "tool"],
  },
  "nội khoa": {
    title: "Tài liệu nội khoa, bệnh án mẫu | Salemylink",
    description:
      "Tài liệu nội khoa: bệnh án mẫu, phác đồ điều trị, slide bài giảng cho sinh viên và bác sĩ. Tải tại Salemylink.",
    keywords: ["nội khoa", "bệnh án nội khoa", "phác đồ điều trị", "tài liệu y khoa"],
  },
  "hóa sinh": {
    title: "Tài liệu hóa sinh, sinh học phân tử | Salemylink",
    description:
      "Tài liệu hóa sinh, sinh học phân tử: giáo trình, slide, đề thi và bài tập có lời giải. Tải tại Salemylink.",
    keywords: ["hóa sinh", "sinh học phân tử", "giáo trình hóa sinh", "đề thi hóa sinh"],
  },
  "nhi khoa": {
    title: "Tài liệu nhi khoa, bệnh án nhi mẫu | Salemylink",
    description:
      "Tài liệu nhi khoa: bệnh án nhi mẫu, phác đồ, slide bài giảng dành cho sinh viên y. Tải tại Salemylink.",
    keywords: ["nhi khoa", "bệnh án nhi", "tài liệu nhi khoa"],
  },
  "ngoại khoa": {
    title: "Tài liệu ngoại khoa, phẫu thuật, bệnh án | Salemylink",
    description:
      "Tài liệu ngoại khoa: kỹ thuật phẫu thuật, bệnh án mẫu, slide bài giảng chuyên sâu. Tải tại Salemylink.",
    keywords: ["ngoại khoa", "phẫu thuật", "bệnh án ngoại khoa"],
  },
  "dược": {
    title: "Tài liệu dược, dược lý & dược lâm sàng | Salemylink",
    description:
      "Tài liệu ngành dược: dược lý, dược lâm sàng, bào chế, đề thi và giáo trình. Tải tại Salemylink.",
    keywords: ["dược", "dược lý", "dược lâm sàng", "tài liệu ngành dược"],
  },
  "giải phẫu": {
    title: "Tài liệu giải phẫu, atlas & bài giảng | Salemylink",
    description:
      "Tài liệu giải phẫu người: atlas hình ảnh, bài giảng, đề thi và sơ đồ hệ cơ quan. Tải tại Salemylink.",
    keywords: ["giải phẫu", "atlas giải phẫu", "bài giảng giải phẫu"],
  },
  "tiểu luận": {
    title: "Tiểu luận mẫu đa ngành, có tài liệu tham khảo | Salemylink",
    description:
      "Kho tiểu luận mẫu đa ngành kèm tài liệu tham khảo, trình bày đúng chuẩn. Tham khảo và tải tại Salemylink.",
    keywords: ["tiểu luận", "tiểu luận mẫu", "bài tiểu luận"],
  },
  "đồ án": {
    title: "Đồ án tốt nghiệp mẫu, báo cáo & source code | Salemylink",
    description:
      "Đồ án tốt nghiệp mẫu kèm báo cáo, slide bảo vệ và source code đa ngành. Tải tại Salemylink.",
    keywords: ["đồ án", "đồ án tốt nghiệp", "báo cáo đồ án"],
  },
  "python": {
    title: "Source code Python, tài liệu & khóa học | Salemylink",
    description:
      "Source code Python, tài liệu lập trình, khóa học từ cơ bản đến data science. Tải tại Salemylink.",
    keywords: ["python", "source code python", "khóa học python"],
  },
  "photoshop": {
    title: "File PSD, action & template Photoshop | Salemylink",
    description:
      "File PSD, action, brush, mockup và template Photoshop chuyên nghiệp. Tải tại Salemylink.",
    keywords: ["photoshop", "file psd", "template photoshop"],
  },
  "powerpoint": {
    title: "Template PowerPoint thuyết trình đẹp | Salemylink",
    description:
      "Template PowerPoint thuyết trình, báo cáo, đồ án với thiết kế hiện đại. Tải file PPTX tại Salemylink.",
    keywords: ["powerpoint", "template powerpoint", "slide thuyết trình"],
  },
  "marketing": {
    title: "Tài liệu marketing, khóa học & template | Salemylink",
    description:
      "Tài liệu marketing: digital marketing, content, ads, template kế hoạch marketing. Tải tại Salemylink.",
    keywords: ["marketing", "digital marketing", "tài liệu marketing"],
  },
  "sản khoa": {
    title: "Tài liệu sản khoa, phụ khoa, bệnh án mẫu | Salemylink",
    description:
      "Tài liệu sản khoa và phụ khoa: bệnh án mẫu, phác đồ, slide bài giảng cho sinh viên y và bác sĩ. Tải tại Salemylink.",
    keywords: ["sản khoa", "phụ khoa", "bệnh án sản khoa", "tài liệu y khoa"],
  },
  "đề thi": {
    title: "Đề thi các môn, ôn thi đại học & THPT | Salemylink",
    description:
      "Kho đề thi các môn: ôn thi đại học, THPT quốc gia, học kỳ, có đáp án chi tiết. Tải nhanh tại Salemylink.",
    keywords: ["đề thi", "ôn thi đại học", "đề thi thpt", "đề thi có đáp án"],
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
