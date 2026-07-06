export interface GuideSection {
  heading: string;
  body: string;
  items?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string;
  hero: string;
  category: string;
  categorySlug?: string;
  productTags: string[];
  productKeywords: string[];
  intro: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  relatedGuides?: string[];
  updatedAt: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "hoc-y-khoa",
    title: "Hướng dẫn học Y khoa hiệu quả – Tài liệu, đề thi, bệnh án",
    metaTitle: "Hướng dẫn học Y khoa: tài liệu, đề thi, bệnh án 2026",
    description:
      "Lộ trình học Y khoa từ Y1 đến sau đại học: chọn tài liệu chuẩn, luyện đề thi, học bệnh án lâm sàng. Kèm gợi ý tài liệu Y khoa đang bán chạy trên Salemylink.",
    keywords:
      "học y khoa, tài liệu y khoa, đề thi y khoa, bệnh án lâm sàng, sách y học, nội khoa, ngoại khoa, sản phụ khoa",
    hero: "Học Y khoa giỏi không nằm ở việc đọc thật nhiều sách, mà ở việc chọn đúng tài liệu và luyện đúng dạng đề.",
    category: "Y khoa",
    categorySlug: "tai-lieu-hoc-tap",
    productTags: ["y khoa", "y hoc", "benh an", "noi khoa", "ngoai khoa"],
    productKeywords: ["y khoa", "y học", "bệnh án", "nội khoa", "ngoại khoa", "sản phụ khoa", "thận"],
    intro:
      "Bài viết này tổng hợp lộ trình học Y khoa theo từng năm, các nhóm tài liệu cốt lõi và cách luyện đề sau đại học. Ở cuối bài, bạn có thể tham khảo các bộ tài liệu Y khoa được sinh viên và bác sĩ nội trú mua nhiều nhất trên Salemylink.",
    sections: [
      {
        heading: "1. Xác định lộ trình theo từng giai đoạn",
        body: "Sinh viên Y khoa nên chia lộ trình học thành 3 giai đoạn: cơ sở (Y1–Y2), tiền lâm sàng (Y3–Y4) và lâm sàng (Y5–Y6, nội trú). Mỗi giai đoạn ưu tiên một nhóm tài liệu khác nhau.",
        items: [
          "Y1–Y2: Giải phẫu, Sinh lý, Hóa sinh – ưu tiên atlas và sách giáo trình chuẩn.",
          "Y3–Y4: Bệnh học, Dược lý, Vi sinh – học kèm bệnh án và ca lâm sàng.",
          "Y5–Y6: Nội, Ngoại, Sản, Nhi – luyện đề thi tốt nghiệp và đề nội trú.",
        ],
      },
      {
        heading: "2. Cách chọn tài liệu Y khoa chất lượng",
        body: "Ưu tiên tài liệu do giảng viên các trường Y lớn biên soạn, có nguồn trích dẫn rõ ràng, cập nhật theo guideline mới (ESC, ADA, KDIGO…). Tránh tài liệu photo mờ, không rõ tác giả.",
      },
      {
        heading: "3. Luyện đề thi và bệnh án lâm sàng",
        body: "Sau khi nắm lý thuyết, hãy luyện đề theo dạng: MCQ, case lâm sàng, viết bệnh án. Mỗi tuần nên hoàn thành ít nhất một bệnh án đầy đủ theo mẫu chuẩn của Bộ môn.",
      },
      {
        heading: "4. Tài liệu chuyên sâu cho nội trú và sau đại học",
        body: "Đối với thí sinh thi nội trú, hãy tập trung vào các bộ đề thi các năm gần nhất, tổng hợp hội chứng trong thận học, tim mạch, hô hấp… và các phác đồ điều trị mới nhất.",
      },
    ],
    faq: [
      {
        q: "Nên bắt đầu học Y khoa từ tài liệu nào?",
        a: "Bắt đầu từ giáo trình chính thức của trường, sau đó bổ sung atlas giải phẫu và sách bệnh án lâm sàng để hình dung ứng dụng thực tế.",
      },
      {
        q: "Có nên mua tài liệu Y khoa online không?",
        a: "Có, nếu tài liệu được biên soạn hoặc tổng hợp bởi bác sĩ, giảng viên uy tín. Trên Salemylink, các sản phẩm Y khoa đều có thông tin người bán và đánh giá của người mua.",
      },
    ],
    relatedGuides: ["luyen-thi-ielts", "viet-luan-van"],
    updatedAt: "2026-06-01",
  },
  {
    slug: "luyen-thi-ielts",
    title: "Lộ trình luyện thi IELTS 0 → 7.0 cho người Việt",
    metaTitle: "Luyện thi IELTS 0–7.0: lộ trình, tài liệu, đề thi thật",
    description:
      "Lộ trình luyện IELTS 4 kỹ năng Listening, Reading, Writing, Speaking từ mất gốc đến 7.0. Kèm bộ tài liệu IELTS Cambridge, sample Writing/Speaking mới nhất trên Salemylink.",
    keywords:
      "luyện thi ielts, ielts 7.0, ielts writing, ielts speaking, ielts reading, ielts listening, cambridge ielts, tài liệu ielts",
    hero: "IELTS 7.0 không đến từ việc học thêm sách, mà từ việc luyện đúng đề và chữa đúng lỗi.",
    category: "IELTS & Ngoại ngữ",
    categorySlug: "tai-lieu-hoc-tap",
    productTags: ["ielts", "tieng anh", "cambridge", "writing", "speaking"],
    productKeywords: ["ielts", "cambridge", "writing", "speaking", "reading", "listening"],
    intro:
      "Bài viết đưa ra lộ trình luyện IELTS 6 tháng cho người Việt, chia theo band mục tiêu 5.0 / 6.5 / 7.0. Ở cuối bài có tuyển tập tài liệu IELTS và bộ giải đề Cambridge được người học tải nhiều nhất.",
    sections: [
      {
        heading: "1. Xác định band mục tiêu và điểm xuất phát",
        body: "Làm một bài test đầu vào để biết band hiện tại. Với người mất gốc, cần 3–4 tuần củng cố ngữ pháp và từ vựng nền trước khi vào bài thi thật.",
      },
      {
        heading: "2. Lộ trình 4 kỹ năng",
        body: "Chia mỗi tuần thành các buổi cố định cho từng kỹ năng và luôn có 1 buổi làm full test.",
        items: [
          "Listening: luyện Cambridge 10–18, note-taking theo dạng đề.",
          "Reading: luyện scan/skim, timing 20 phút/passage.",
          "Writing: học sample Task 1 (biểu đồ) và Task 2 (essay) theo chủ đề.",
          "Speaking: quay video Part 1–2–3, tự nghe lại và chữa phát âm.",
        ],
      },
      {
        heading: "3. Nguồn tài liệu IELTS đáng dùng",
        body: "Ưu tiên bộ Cambridge IELTS (bản gốc), sample Writing của giám khảo, tuyển tập topic Speaking theo quý. Tránh học dàn trải quá nhiều nguồn.",
      },
      {
        heading: "4. Chiến lược 4 tuần cuối trước khi thi",
        body: "4 tuần cuối chỉ nên làm đề thi thật, chữa lỗi và luyện phản xạ. Không học thêm cấu trúc mới trong giai đoạn này để tránh loạn.",
      },
    ],
    faq: [
      {
        q: "Học IELTS bao lâu thì đạt 6.5?",
        a: "Trung bình 4–6 tháng nếu bạn đã có nền tiếng Anh phổ thông và luyện đề đều đặn 1–2 giờ/ngày.",
      },
      {
        q: "Nên mua tài liệu IELTS ở đâu?",
        a: "Bạn có thể tham khảo bộ giải đề Cambridge và sample Writing/Speaking đang được bán trên Salemylink, đa phần đều được giáo viên IELTS biên soạn.",
      },
    ],
    relatedGuides: ["viet-luan-van", "hoc-y-khoa"],
    updatedAt: "2026-06-01",
  },
  {
    slug: "viet-luan-van",
    title: "Cách viết luận văn tốt nghiệp – từ đề cương đến bảo vệ",
    metaTitle: "Viết luận văn tốt nghiệp: đề cương, cấu trúc, mẫu chuẩn",
    description:
      "Hướng dẫn viết luận văn tốt nghiệp đại học & thạc sĩ: chọn đề tài, viết đề cương, cấu trúc chương, trích dẫn APA. Kèm mẫu luận văn, slide bảo vệ trên Salemylink.",
    keywords:
      "viết luận văn, luận văn tốt nghiệp, đề cương luận văn, mẫu luận văn, slide bảo vệ, báo cáo thực tập, APA",
    hero: "Một luận văn tốt bắt đầu từ đề cương rõ ràng và kết thúc bằng một buổi bảo vệ tự tin.",
    category: "Luận văn & Báo cáo",
    categorySlug: "bao-cao-luan-van",
    productTags: ["luan van", "bao cao", "de cuong", "slide", "thuc tap"],
    productKeywords: ["luận văn", "báo cáo", "đề cương", "slide", "thực tập"],
    intro:
      "Hướng dẫn dưới đây tổng hợp các bước viết luận văn từ khâu chọn đề tài đến bảo vệ trước hội đồng, kèm mẫu luận văn và slide bảo vệ đã được sinh viên các trường lớn sử dụng.",
    sections: [
      {
        heading: "1. Chọn đề tài và viết đề cương",
        body: "Đề tài tốt là đề tài đủ hẹp để làm sâu và đủ rộng để có dữ liệu. Đề cương nên có: lý do chọn đề tài, mục tiêu, câu hỏi nghiên cứu, phương pháp, cấu trúc dự kiến.",
      },
      {
        heading: "2. Cấu trúc chuẩn 5 chương",
        body: "Đa số luận văn đại học và thạc sĩ tại Việt Nam theo cấu trúc 5 chương.",
        items: [
          "Chương 1: Mở đầu – bối cảnh, mục tiêu, đối tượng, phạm vi.",
          "Chương 2: Cơ sở lý thuyết và tổng quan nghiên cứu.",
          "Chương 3: Phương pháp nghiên cứu.",
          "Chương 4: Kết quả và thảo luận.",
          "Chương 5: Kết luận và kiến nghị.",
        ],
      },
      {
        heading: "3. Trích dẫn và tài liệu tham khảo",
        body: "Dùng chuẩn APA hoặc theo yêu cầu của khoa. Nên dùng Zotero/Mendeley để quản lý trích dẫn và tránh đạo văn.",
      },
      {
        heading: "4. Chuẩn bị slide và bảo vệ",
        body: "Slide bảo vệ chỉ nên có 12–15 slide, tập trung vào phương pháp, kết quả và đóng góp mới. Luyện nói trong 15 phút và chuẩn bị trước các câu hỏi phản biện.",
      },
    ],
    faq: [
      {
        q: "Có nên tham khảo mẫu luận văn không?",
        a: "Có. Mẫu luận văn giúp bạn hình dung cấu trúc, cách trình bày bảng biểu, trích dẫn. Tuyệt đối không sao chép nguyên văn để tránh đạo văn.",
      },
      {
        q: "Slide bảo vệ nên có bao nhiêu trang?",
        a: "12–15 slide là hợp lý cho phần trình bày 15 phút, chưa kể trang bìa và tài liệu tham khảo.",
      },
    ],
    relatedGuides: ["hoc-y-khoa", "luyen-thi-ielts"],
    updatedAt: "2026-06-01",
  },
];

export const getGuideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
