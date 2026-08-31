export interface GuideSection {
  heading: string;
  body: string;
  subsections?: { subheading: string; text: string; items?: string[] }[];
  items?: string[];
  callout?: string;
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string;
  hero: string;
  category: string;
  categorySlug: string;
  productTags: string[];
  productKeywords: string[];
  intro: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  relatedGuides: string[];
  relatedCategories: { name: string; slug: string }[];
  updatedAt: string;
  createdAt: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "cach-mua-tai-lieu-hoc-tap-online-an-toan",
    title: "Cách mua tài liệu học tập online an toàn, tránh lừa đảo 2026",
    metaTitle: "Cách mua tài liệu học tập online an toàn: hướng dẫn chi tiết 2026",
    description:
      "Kinh nghiệm mua tài liệu học tập online, ebook và khóa học qua Google Drive an toàn, bảo mật. Tránh lừa đảo và chọn người bán uy tín trên Salemylink.",
    keywords:
      "mua tài liệu học tập online, mua ebook an toàn, mua sách digital, mua tài liệu qua google drive, salemylink, kinh nghiệm mua tài liệu online",
    hero: "Mua tài liệu học tập online nhanh chóng và an toàn hơn bao giờ hết khi bạn nắm rõ các nguyên tắc kiểm tra nguồn gốc, bản xem trước và thanh toán bảo mật.",
    category: "Cẩm nang học tập",
    categorySlug: "tai-lieu-hoc-tap",
    productTags: ["tai lieu", "ebook", "on thi", "hoc tap", "giao trinh"],
    productKeywords: ["tài liệu", "đề thi", "giáo trình", "bài giảng", "sách"],
    intro:
      "Trong kỷ nguyên số hóa giáo dục, nhu cầu mua tài liệu học tập online, ebook chuyên ngành, đề thi thử và giáo trình đại học ngày càng tăng mạnh. Thay vì phải đến nhà sách photo hay chờ đợi sách giấy mất nhiều ngày vận chuyển, người học có thể tiếp cận tài liệu số (digital products) chỉ sau vài giây. Tuy nhiên, thị trường tài liệu trực tuyến cũng tiềm ẩn nhiều rủi ro: link tải bị hỏng, tài liệu bị cắt xén không đúng mô tả, file chứa mã độc, hoặc người mua chuyển khoản xong nhưng không nhận được file. Hướng dẫn toàn diện dưới đây của Salemylink sẽ cung cấp cho bạn từng bước từ khâu tìm kiếm, đánh giá độ tin cậy của người bán, kiểm tra bản xem trước trực quan cho đến quy trình thanh toán bảo mật và khiếu nại bảo vệ quyền lợi.",
    sections: [
      {
        heading: "1. Những rủi ro thường gặp khi mua tài liệu học tập online tự do",
        body: "Mua bán tài liệu qua mạng xã hội (Facebook groups, Zalo, Telegram cá nhân) thường không có cơ chế trung gian bảo đảm, dẫn đến nhiều trải nghiệm thất vọng cho sinh viên và người đi làm.",
        items: [
          "Chuyển khoản trực tiếp nhưng bị chặn liên lạc (scam tiền cọc, tài liệu rác).",
          "File tài liệu scan chất lượng kém, mờ chữ, mất trang hoặc nội dung lỗi thời từ nhiều năm trước.",
          "File đính kèm định dạng lạ (.exe, script độc hại) tiềm ẩn nguy cơ bảo mật cho máy tính cá nhân.",
          "Link tải Google Drive bị khóa quyền truy cập hoặc biến mất sau một vài tuần tải về.",
          "Không có chính sách hoàn tiền hoặc hỗ trợ kỹ thuật khi gặp sự cố mở file."
        ]
      },
      {
        heading: "2. Tiêu chí đánh giá người bán uy tín trên sàn TMĐT số",
        body: "Để đảm bảo tài liệu bạn nhận được đúng giá trị và chuẩn xác về mặt học thuật, hãy luôn kiểm tra các chỉ số minh bạch của người bán:",
        subsections: [
          {
            subheading: "2.1. Đánh giá thực tế và điểm sao từ người mua trước",
            text: "Trên các sàn giao dịch sản phẩm số như Salemylink, mỗi đơn hàng thành công đều cho phép người mua để lại đánh giá sao và nhận xét thực tế. Một shop có nhiều đánh giá 4.5 – 5.0 sao cùng nhận xét chi tiết về chất lượng bản in/file PDF là dấu hiệu rõ ràng nhất của uy tín."
          },
          {
            subheading: "2.2. Lịch sử giao dịch và tổng lượt tải xuống",
            text: "Những bộ tài liệu có lượt tải (download count) cao thường là các tài liệu kinh điển, được cộng đồng học tập kiểm chứng qua nhiều mùa thi. Bạn có thể dễ dàng kiểm tra số lượt tải và lượt xem hiển thị công khai trên từng trang sản phẩm."
          },
          {
            subheading: "2.3. Huy hiệu 'Đã xác minh' (Verified Seller)",
            text: "Ưu tiên mua từ những tài khoản người bán đã hoàn tất xác thực thông tin danh tính với sàn. Điều này đảm bảo trách nhiệm pháp lý và sự hỗ trợ lâu dài từ phía người biên soạn."
          }
        ]
      },
      {
        heading: "3. Tận dụng tính năng 'Xem trước' (Preview) trước khi đặt mua",
        body: "Đừng bao giờ mua một bộ tài liệu chỉ dựa trên hình ảnh bìa. Một nền tảng số chuyên nghiệp luôn cung cấp công cụ đọc thử trực tuyến.",
        items: [
          "Đọc kỹ mục lục và vài trang nội dung đầu tiên để đánh giá bố cục, độ nét của văn bản và biểu đồ.",
          "Kiểm tra định dạng file tương thích: PDF cho tài liệu đọc/in ấn, DOCX/PPTX nếu bạn cần chỉnh sửa luận văn hay bài thuyết trình, ZIP/RAR cho các khóa học nhiều video.",
          "Xem dung lượng file công khai để đảm bảo máy tính/điện thoại của bạn đủ bộ nhớ lưu trữ."
        ],
        callout: "Mẹo nhỏ: Tại Salemylink, bạn có thể nhúng xem trước trực tiếp tài liệu thông qua Google Drive Viewer ngay trên trình duyệt mà không cần tải file về máy."
      },
      {
        heading: "4. Quy trình thanh toán tự động và nhận link tải Google Drive an toàn",
        body: "Hệ thống thanh toán số tự động là chìa khóa để bảo vệ túi tiền của bạn. Quy trình mua hàng chuẩn chỉnh bao gồm 3 bước:",
        subsections: [
          {
            subheading: "Bước 1: Chọn sản phẩm và kiểm tra giỏ hàng",
            text: "Truy cập danh mục tài liệu học tập hoặc tìm kiếm theo từ khóa chuyên ngành. Đọc kỹ mô tả chi tiết sản phẩm và nhấn 'Mua ngay' hoặc 'Thêm vào giỏ hàng'."
          },
          {
            subheading: "Bước 2: Thanh toán qua cổng thanh toán trung gian bảo mật (PayOS / QR Ngân hàng)",
            text: "Quét mã QR thanh toán nhanh 24/7. Hệ thống tự động đối soát giao dịch trong 3-5 giây mà không cần bạn phải chụp ảnh màn hình gửi thủ công cho người bán."
          },
          {
            subheading: "Bước 3: Nhận link tải Google Drive bản quyền vĩnh viễn",
            text: "Ngay khi giao dịch hoàn tất, màn hình sẽ hiển thị link tải trực tiếp và gửi bản sao vào email của bạn. File được lưu trữ an toàn trên Google Drive giúp bạn tải xuống với tốc độ cao bất cứ lúc nào."
          }
        ]
      },
      {
        heading: "5. Những lưu ý sau khi nhận tài liệu",
        body: "Sau khi tải tài liệu về máy, hãy lưu trữ vào thư mục cá nhân trên Google Drive hoặc ổ cứng di động để tránh mất dữ liệu. Nếu phát hiện file bị lỗi, thiếu trang so với mô tả, hãy liên hệ ngay với bộ phận hỗ trợ khách hàng của Salemylink qua email support@salemylink.com để được đổi file hoặc hoàn tiền theo chính sách bảo vệ người mua."
      }
    ],
    faq: [
      {
        q: "Tôi có được nhận link tải ngay sau khi chuyển khoản không?",
        a: "Có. Hệ thống của Salemylink tích hợp cổng thanh toán tự động, bạn sẽ nhận được link Google Drive tải ngay lập tức trên màn hình và qua email sau khi quét mã QR thành công."
      },
      {
        q: "Nếu link Google Drive bị lỗi hoặc hết hạn thì phải làm sao?",
        a: "Link sản phẩm đã mua được lưu trữ vĩnh viễn trong tài khoản của bạn. Nếu gặp sự cố phân quyền Google Drive, bạn chỉ cần bấm yêu cầu hỗ trợ, hệ thống hoặc người bán sẽ cấp lại quyền truy cập trong 24 giờ."
      },
      {
        q: "Có thể xem trước tài liệu trước khi trả tiền không?",
        a: "Hầu hết các tài liệu trên Salemylink đều có chế độ Xem trước trực tiếp (Google Drive Preview) giúp bạn đọc thử mục lục và nội dung trước khi quyết định mua."
      }
    ],
    relatedGuides: ["top-10-tai-lieu-ielts-mien-phi-tot-nhat-2026", "de-thi-vao-10-cac-tinh-2026"],
    relatedCategories: [
      { name: "Tài liệu học tập", slug: "tai-lieu-hoc-tap" },
      { name: "Báo cáo & Luận văn", slug: "bao-cao-luan-van" }
    ],
    updatedAt: "2026-08-30",
    createdAt: "2026-01-15"
  },
  {
    slug: "top-10-tai-lieu-ielts-mien-phi-tot-nhat-2026",
    title: "Top 10 tài liệu IELTS miễn phí tốt nhất 2026 – Đầy đủ 4 kỹ năng",
    metaTitle: "Top 10 tài liệu IELTS miễn phí tốt nhất 2026: 4 kỹ năng Listening, Reading, Writing, Speaking",
    description:
      "Tổng hợp top 10 bộ tài liệu IELTS miễn phí tốt nhất 2026 từ band 0 đến 7.5+. Kèm lộ trình tự học 4 kỹ năng Listening, Reading, Writing, Speaking tại nhà.",
    keywords:
      "tài liệu ielts miễn phí, ielts materials free, cambridge ielts, ielts writing band 7, ielts speaking forecast, tu hoc ielts",
    hero: "Luyện thi IELTS đạt band 7.0+ không cần bỏ ra hàng chục triệu nếu bạn nắm trong tay 10 bộ tài liệu chuẩn hóa từ các giám khảo quốc tế.",
    category: "IELTS & Ngoại ngữ",
    categorySlug: "tai-lieu-hoc-tap",
    productTags: ["ielts", "tieng anh", "cambridge", "writing", "speaking", "reading", "listening"],
    productKeywords: ["ielts", "cambridge", "tiếng anh", "writing", "speaking", "reading"],
    intro:
      "Kỳ thi IELTS (International English Language Testing System) tiếp tục là tấm vé vàng cho du học, định cư và xét tuyển thẳng vào các trường đại học hàng đầu Việt Nam năm 2026. Tuy nhiên, giữa 'ma trận' hàng trăm đầu sách và tài liệu trên Internet, việc chọn sai tài liệu không chỉ làm bạn mất thời gian mà còn hình thành những tư duy làm bài sai lệch. Bài viết này tổng hợp và đánh giá chi tiết Top 10 bộ tài liệu luyện thi IELTS miễn phí và có phí được tin dùng nhất, phân bổ từ trình độ mất gốc (Foundation) đến band 7.5+ cho cả 4 kỹ năng Nghe – Đọc – Viết – Nói.",
    sections: [
      {
        heading: "1. Trụ cột nền tảng: Từ vựng & Ngữ pháp (Band 0 – 5.0)",
        body: "Trước khi bắt đầu giải đề Cambridge, bạn cần xây dựng vững chắc nền móng từ vựng học thuật và các cấu trúc ngữ pháp phức hợp.",
        subsections: [
          {
            subheading: "1.1. English Grammar in Use (Raymond Murphy)",
            text: "Cuốn sách kinh điển của Nhà xuất bản Cambridge giúp bạn chuẩn hóa 145 chủ điểm ngữ pháp từ thì động từ, câu điều kiện, mệnh đề quan hệ đến câu bị động nâng cao. Sách trình bày lý thuyết trực quan ở trang trái và bài tập thực hành ở trang phải."
          },
          {
            subheading: "1.2. Cambridge Vocabulary for IELTS (Pauline Cullen)",
            text: "Cung cấp từ vựng học thuật theo 25 chủ đề trọng điểm thường gặp trong bài thi (Environment, Technology, Education, Health...). Học từ vựng theo ngữ cảnh bài thi giúp bạn ghi nhớ sâu và áp dụng chính xác vào bài viết Task 2."
          },
          {
            subheading: "1.3. Cambridge English Collocations in Use (Intermediate & Advanced)",
            text: "Bí quyết đạt điểm Lexical Resource từ band 7.0 trở lên chính là việc sử dụng cụm từ tự nhiên (collocations) như 'make a decision', 'exert a profound impact'. Cuốn sách này là tài liệu bắt buộc cho giai đoạn bứt phá."
          }
        ]
      },
      {
        heading: "2. Bộ sách luyện đề thi thật không thể thay thế (Band 5.0 – 8.5)",
        body: "Luyện đề thi thật giúp bạn làm quen với áp lực thời gian, giọng đọc đa dạng (Anh - Anh, Anh - Mỹ, Anh - Úc) và cấu trúc câu hỏi chuẩn mực của IDP và Hội đồng Anh.",
        subsections: [
          {
            subheading: "2.1. Cambridge IELTS Practice Tests (Tập 10 đến 19)",
            text: "Mỗi cuốn gồm 4 bài test Academic và 2 bài General Training có kèm audio và đáp án chi tiết. Lời khuyên: Hãy tập trung luyện sâu từ cuốn Cam 14 đến Cam 19 vì cấu trúc và độ khó sát nhất với đề thi thực tế năm 2026."
          },
          {
            subheading: "2.2. The Official Cambridge Guide to IELTS",
            text: "Được viết bởi chính các chuyên gia khảo thí IELTS, cuốn sách phân tích từng dạng bài (Matching Headings, True/False/Not Given, Multiple Choice...) kèm chiến thuật xử lý bẫy trong bài thi Listening và Reading."
          }
        ]
      },
      {
        heading: "3. Tài liệu chuyên sâu cho 2 kỹ năng đầu ra: Writing & Speaking",
        body: "Hai kỹ năng này là rào cản lớn nhất của thí sinh Việt Nam. Sử dụng tài liệu chuẩn mẫu giúp bạn nắm vững tiêu chí chấm điểm (Rubrics) của giám khảo.",
        subsections: [
          {
            subheading: "3.1. Tuyển tập bài mẫu Simon IELTS Writing Task 1 & Task 2",
            text: "Thầy Simon – cựu giám khảo IELTS nổi tiếng thế giới với phong cách viết ngắn gọn, súc tích nhưng đạt điểm tuyệt đối về Coherence & Cohesion và Task Response. Bộ bài mẫu của Simon là kim chỉ nam cho band 7.5+."
          },
          {
            subheading: "3.2. Sách 'IELTS Advantage: Writing Skills' (Richard Brown & Lewis Richards)",
            text: "Hướng dẫn chi tiết cách lập dàn ý trong 5 phút, phương pháp phát triển ý tưởng phản biện (brainstorming ideas) và các cấu trúc câu phức đắt giá cho từng dạng bài: Opinion, Discussion, Problem-Solution."
          },
          {
            subheading: "3.3. Bộ đề dự đoán IELTS Speaking Forecast theo quý 2026",
            text: "Cập nhật đầy đủ các chủ đề Part 1, Part 2 và Part 3 mới nhất trong quý. Luyện nói theo forecast giúp bạn không bị bất ngờ trước những chủ đề trừu tượng trong phòng thi thực tế."
          }
        ]
      },
      {
        heading: "4. Lộ trình 3 giai đoạn tự học IELTS 6 tháng tại nhà",
        body: "Để phát huy tối đa hiệu quả của các bộ tài liệu trên, bạn nên tuân thủ lộ trình 3 bước khoa học:",
        items: [
          "Giai đoạn 1 (Tháng 1-2): Củng cố phát âm chuẩn IPA, học 1000 từ vựng Academic cơ bản và làm quen các dạng câu hỏi Reading/Listening.",
          "Giai đoạn 2 (Tháng 3-4): Luyện kỹ năng theo dạng bài. Viết mỗi tuần 2 bài Task 1 và 2 bài Task 2, tự ghi âm bài nói Speaking Part 2 và sửa lỗi ngập ngừng.",
          "Giai đoạn 3 (Tháng 5-6): Luyện đề full test bấm giờ chuẩn xác (Listening 30p, Reading 60p, Writing 60p). Tổng hợp danh sách từ đồng nghĩa (paraphrasing) và các lỗi sai thường gặp."
        ]
      },
      {
        heading: "5. Tải trọn bộ tài liệu IELTS chọn lọc tại Salemylink",
        body: "Nếu bạn không có nhiều thời gian tìm kiếm từng file lẻ trên mạng, bạn có thể tham khảo các bộ tài liệu IELTS tổng hợp kèm bài giải chi tiết song ngữ Việt - Anh được các giáo viên tâm huyết chia sẻ trên Salemylink. Link tải Google Drive tốc độ cao, đầy đủ audio lossless và transcript chuẩn xác."
      }
    ],
    faq: [
      {
        q: "Nên học IELTS từ bộ Cambridge số mấy?",
        a: "Bạn nên bắt đầu luyện từ Cambridge IELTS 14 đến Cambridge 19. Các cuốn trước đó (Cam 1-10) đã khá cũ về định dạng câu hỏi và phong cách ra đề."
      },
      {
        q: "Tự học IELTS 7.0 từ số 0 mất bao lâu?",
        a: "Nếu bạn học kiên trì 2-3 tiếng mỗi ngày với phương pháp đúng và tài liệu chuẩn, thời gian trung bình để đạt band 6.5 - 7.0 từ nền tảng cơ bản là khoảng 6 đến 9 tháng."
      },
      {
        q: "Tài liệu IELTS trên Salemylink có bản quyền và file nghe không?",
        a: "Tất cả các bộ tài liệu IELTS được chia sẻ trên Salemylink đều bao gồm đầy đủ file PDF chất lượng cao, audio nghe và đáp án giải thích chi tiết."
      }
    ],
    relatedGuides: ["viet-luan-van-tieng-anh-band-7", "cach-mua-tai-lieu-hoc-tap-online-an-toan"],
    relatedCategories: [
      { name: "Tài liệu học tập", slug: "tai-lieu-hoc-tap" },
      { name: "Khóa học Online", slug: "khoa-hoc-online" }
    ],
    updatedAt: "2026-08-30",
    createdAt: "2026-01-20"
  },
  {
    slug: "hoc-y-khoa-tu-zero",
    title: "Lộ trình học Y khoa từ Zero: Cẩm nang tài liệu, lâm sàng và nội trú",
    metaTitle: "Học Y khoa từ Zero: lộ trình, tài liệu, bệnh án và thi nội trú 2026",
    description:
      "Cẩm nang học Y khoa toàn diện từ Y1 đến sau đại học: sách giải phẫu, sinh lý, bệnh học nội ngoại sản nhi, cách làm bệnh án và luyện thi bác sĩ nội trú.",
    keywords:
      "học y khoa, tài liệu y khoa, bệnh án lâm sàng, đề thi nội trú y hà nội, sách giải phẫu netter, duoc ly hoc, benh ly hoc",
    hero: "Học Y khoa giỏi không chỉ là ghi nhớ hàng nghìn trang giáo trình, mà là sự thấu hiểu cơ chế bệnh sinh và rèn luyện tư duy chẩn đoán lâm sàng sắc bén.",
    category: "Y khoa & Dược học",
    categorySlug: "tai-lieu-hoc-tap",
    productTags: ["y khoa", "y hoc", "benh an", "noi khoa", "ngoai khoa", "giai phau", "duoc ly"],
    productKeywords: ["y khoa", "y học", "bệnh án", "nội khoa", "ngoại khoa", "thận", "giải phẫu"],
    intro:
      "Hành trình 6 năm đại học Y và những năm tháng đào tạo sau đại học (Bác sĩ nội trú, Chuyên khoa I, Thạc sĩ) là một trong những chặng đường học tập gian nan và thử thách nhất. Khối lượng kiến thức y khoa đồ sộ, yêu cầu chính xác tuyệt đối và môi trường trực bệnh viện căng thẳng đòi hỏi sinh viên Y phải có phương pháp học tập khoa học và nguồn tài liệu chuẩn xác. Hướng dẫn toàn diện này được biên soạn nhằm định hướng lộ trình học tập từ năm thứ nhất (Y1) đến năm cuối (Y6), phương pháp khai thác bệnh án lâm sàng và gợi ý các bộ tài liệu y khoa cốt lõi trên Salemylink.",
    sections: [
      {
        heading: "1. Giai đoạn Y1 – Y2: Chinh phục các môn Y cơ sở",
        body: "Hai năm đầu tiên đặt nền móng giải phẫu, sinh lý và hóa sinh – ba trụ cột quyết định tư duy biện luận của người thầy thuốc tương lai.",
        subsections: [
          {
            subheading: "1.1. Giải phẫu học: Học hình ảnh trực quan",
            text: "Tuyệt đối không học vẹt chữ. Hãy sử dụng Atlas Giải phẫu người của Frank H. Netter kết hợp mô hình 3D (Complete Anatomy) để ghi nhớ cấu trúc mạch máu, thần kinh và cơ quan trong không gian 3 chiều."
          },
          {
            subheading: "1.2. Sinh lý học Guyton & Hall",
            text: "Giáo trình Sinh lý học y khoa Guyton & Hall là cuốn sách gối đầu giường. Hãy tập trung hiểu cơ chế điều hòa nội môi, dẫn truyền thần kinh và sinh lý tuần hoàn - hô hấp thay vì ghi nhớ số liệu máy móc."
          },
          {
            subheading: "1.3. Hóa sinh & Mô phôi học",
            text: "Hiểu rõ các chu trình chuyển hóa glucid, lipid, protid và cấu trúc vi thể của tế bào để làm tiền đề cho môn Dược lý và Bệnh học ở các năm tiếp theo."
          }
        ]
      },
      {
        heading: "2. Giai đoạn Y3 – Y4: Bước chuyển mình sang Tiền lâm sàng & Bệnh học",
        body: "Y3 là bước ngoặt khi sinh viên lần đầu tiên khoác áo blouse trắng bước vào bệnh viện tiếp xúc với người bệnh.",
        subsections: [
          {
            subheading: "2.1. Triệu chứng học Nội khoa & Ngoại khoa",
            text: "Rèn luyện kỹ năng Nhìn - Sờ - Gõ - Nghe. Học cách hỏi bệnh sử, tiền sử và phát hiện các dấu hiệu thực thể (tiếng thổi tim, ran phổi, phản ứng thành bụng, dấu hiệu thần kinh khu trú)."
          },
          {
            subheading: "2.2. Dược lý học lâm sàng (Rang & Dale's Pharmacology)",
            text: "Nắm vững cơ chế tác dụng, chỉ định, chống chỉ định và tương tác thuốc của các nhóm kháng sinh, tim mạch, hạ áp, giảm đau chống viêm."
          },
          {
            subheading: "2.3. Kỹ năng viết bệnh án chuẩn Bộ Y tế",
            text: "Một bệnh án tốt phản ánh tư duy logic của người khám. Bệnh án phải có đầy đủ: Lý do vào viện, Bệnh sử chi tiết, Tiền sử, Khám lâm sàng toàn diện, Tóm tắt bệnh án, Chẩn đoán sơ bộ/phân biệt, Đề xuất cận lâm sàng và Hướng điều trị."
          }
        ]
      },
      {
        heading: "3. Giai đoạn Y5 – Y6: Thực chiến Lâm sàng & Luyện thi Tốt nghiệp",
        body: "Hai năm cuối tập trung giải quyết 4 chuyên khoa lớn: Nội, Ngoại, Sản, Nhi và các chuyên khoa lẻ (Tai Mũi Họng, Mắt, Răng Hàm Mặt, Da liễu, Truyền nhiễm).",
        items: [
          "Tham gia trực cấp cứu, theo dõi diễn biến bệnh nhân nặng và tham gia giao ban khoa phòng mỗi sáng.",
          "Cập nhật các hướng dẫn chẩn đoán và điều trị (Guidelines) mới nhất của Bộ Y tế, Hội Tim mạch Châu Âu (ESC), Hiệp hội Đái tháo đường Hoa Kỳ (ADA), Hướng dẫn bệnh thận học (KDIGO).",
          "Luyện giải đề trắc nghiệm MCQ chuyên đề Nội - Ngoại - Sản - Nhi tổng hợp để chuẩn bị cho kỳ thi tốt nghiệp quốc gia."
        ]
      },
      {
        heading: "4. Chiến lược ôn thi Bác sĩ Nội trú (BSNT) thành công",
        body: "Kỳ thi Bác sĩ nội trú chỉ diễn ra một lần duy nhất trong đời của mỗi bác sĩ đa khoa. Để đạt điểm cao trong kỳ thi khốc liệt này, bạn cần:",
        items: [
          "Bắt đầu ôn thi sớm từ đầu năm thứ 5, lập nhóm học tập 3-4 người để cùng khảo bài và giải đề.",
          "Ôn sâu 4 môn thi chính theo đề cương của các trường Y lớn (Đại học Y Hà Nội, ĐHYD TP.HCM, ĐHY Dược Huế).",
          "Tổng hợp các ca lâm sàng kinh điển, các hội chứng hiếm gặp và xử trí tai biến cấp cứu trong sản phụ khoa và hồi sức tích cực."
        ]
      },
      {
        heading: "5. Kho tài liệu Y khoa chọn lọc trên Salemylink",
        body: "Salemylink tự hào là nơi kết nối các bác sĩ, giảng viên y khoa và thủ khoa nội trú chia sẻ những bộ tài liệu quý giá: slide bài giảng chuyên khoa, bộ câu hỏi trắc nghiệm MCQ có đáp án, mẫu bệnh án điểm 9-10 và tóm tắt guideline điều trị. Mọi tài liệu đều được hỗ trợ định dạng PDF sắc nét, tải nhanh qua Google Drive."
      }
    ],
    faq: [
      {
        q: "Làm thế nào để nhớ được Giải phẫu học lâu dài?",
        a: "Hãy kết hợp học Atlas Netter với việc vẽ lại sơ đồ cấu trúc bằng tay, sau đó kiểm tra lại trên xác ướp hoặc mô hình tại phòng thực tập bộ môn."
      },
      {
        q: "Tài liệu Y khoa trên Salemylink có cập nhật theo guideline mới không?",
        a: "Các người bán trên Salemylink là các bác sĩ nội trú và giảng viên y khoa, thường xuyên cập nhật tài liệu và bài giảng theo guideline mới nhất của Bộ Y tế và quốc tế."
      },
      {
        q: "Bệnh án mẫu có giúp ích gì cho sinh viên đi lâm sàng?",
        a: "Bệnh án mẫu chuẩn giúp sinh viên hình dung cách trình bày lập luận chẩn đoán, biện luận cận lâm sàng và phân tích đơn thuốc điều trị một cách bài bản."
      }
    ],
    relatedGuides: ["viet-luan-van-tieng-anh-band-7", "cach-mua-tai-lieu-hoc-tap-online-an-toan"],
    relatedCategories: [
      { name: "Tài liệu học tập", slug: "tai-lieu-hoc-tap" },
      { name: "Báo cáo & Luận văn", slug: "bao-cao-luan-van" }
    ],
    updatedAt: "2026-08-30",
    createdAt: "2026-01-25"
  },
  {
    slug: "viet-luan-van-tieng-anh-band-7",
    title: "Hướng dẫn viết luận văn tiếng Anh chuẩn Academic Band 7+",
    metaTitle: "Viết luận văn tiếng Anh chuẩn Band 7+: đề cương, cấu trúc, trích dẫn APA 2026",
    description:
      "Bí quyết viết luận văn tốt nghiệp và essay tiếng Anh đạt band 7+ (Academic Writing): cách phát triển luận điểm, liên từ nối, trích dẫn APA và tránh đạo văn.",
    keywords:
      "viết luận văn tiếng anh, essay band 7, academic writing, luan van thac si tieng anh, trich dan apa, cohesion and coherence",
    hero: "Một bài luận văn tiếng Anh xuất sắc không chỉ nằm ở vốn từ vựng học thuật phức tạp, mà là sự chặt chẽ trong cấu trúc lập luận và tính logic xuyên suốt.",
    category: "Luận văn & Báo cáo",
    categorySlug: "bao-cao-luan-van",
    productTags: ["luan van", "bao cao", "ielts", "tieng anh", "writing", "essay", "apa"],
    productKeywords: ["luận văn", "báo cáo", "writing", "tiếng anh", "ielts", "essay"],
    intro:
      "Viết luận văn tốt nghiệp bằng tiếng Anh (Graduation Thesis / Master Dissertation) hoặc các bài tiểu luận học thuật (Academic Essays) là thử thách bắt buộc đối với sinh viên các chương trình chất lượng cao, chương trình liên kết quốc tế và học viên cao học. Rất nhiều bạn sinh viên có nền tảng ngữ pháp tốt nhưng khi viết luận văn vẫn bị điểm thấp do thiếu tính liên kết (Coherence), luận điểm mơ hồ hoặc vi phạm quy tắc trích dẫn học thuật (Plagiarism). Hướng dẫn này sẽ giúp bạn làm chủ cấu trúc 5 chương chuẩn quốc tế, nâng cấp vốn từ vựng Academic và hoàn thiện bài luận đạt chuẩn Band 7.0+.",
    sections: [
      {
        heading: "1. Xác định đề tài nghiên cứu & Cấu trúc chuẩn 5 chương",
        body: "Đề tài nghiên cứu tốt cần đáp ứng nguyên tắc SMART: Cụ thể (Specific), Đo lường được (Measurable), Khả thi (Achievable), Thực tiễn (Relevant) và Có thời hạn (Time-bound).",
        subsections: [
          {
            subheading: "Chapter 1: Introduction (Mở đầu)",
            text: "Trình bày bối cảnh nghiên cứu (Background of the Study), lý do chọn đề tài (Rationale), câu hỏi nghiên cứu (Research Questions), mục tiêu (Research Objectives) và phạm vi nghiên cứu (Scope and Limitations)."
          },
          {
            subheading: "Chapter 2: Literature Review (Tổng quan tài liệu)",
            text: "Phân tích có phê phán các nghiên cứu trước đây (Critical Review), chỉ ra khoảng trống tri thức (Research Gap) và xây dựng khung lý thuyết/khung khái niệm (Theoretical/Conceptual Framework)."
          },
          {
            subheading: "Chapter 3: Methodology (Phương pháp nghiên cứu)",
            text: "Mô tả thiết kế nghiên cứu (Định lượng Quantitative, Định tính Qualitative hoặc Kết hợp Mixed-methods), cỡ mẫu, công cụ thu thập dữ liệu (khảo sát, phỏng vấn) và phương pháp xử lý số liệu (SPSS, AMOS, NVivo)."
          },
          {
            subheading: "Chapter 4: Findings & Discussion (Kết quả & Thảo luận)",
            text: "Trình bày các phát hiện qua bảng biểu và phân tích sâu sắc mối liên hệ giữa kết quả thu được với các lý thuyết đã nêu ở Chapter 2."
          },
          {
            subheading: "Chapter 5: Conclusion & Recommendations (Kết luận & Khuyến nghị)",
            text: "Tóm tắt đóng góp chính của luận văn, hàm ý quản trị/chính sách và đề xuất hướng nghiên cứu tiếp theo trong tương lai."
          }
        ]
      },
      {
        heading: "2. Nâng cấp Academic Vocabulary & Ngữ pháp Band 7+",
        body: "Để văn phong toát lên sự chuyên nghiệp và khách quan của một nhà nghiên cứu, hãy lưu ý các nguyên tắc viết sau:",
        items: [
          "Sử dụng thể bị động (Passive Voice) và ngôn ngữ gián tiếp để đảm bảo tính khách quan (Tránh dùng 'I think', 'In my opinion' trong luận văn học thuật).",
          "Áp dụng Hedging Language (ngôn ngữ rào đón): Sử dụng các động từ khuyết thiếu và trạng từ như 'tends to', 'suggests that', 'is likely to', 'plausibly' thay vì khẳng định tuyệt đối 100%.",
          "Đa dạng hóa từ nối chuyển tiếp (Transitional Signals): 'Consequently', 'Furthermore', 'In contrast', 'Nonetheless', 'To elucidate', 'In particular'."
        ]
      },
      {
        heading: "3. Quy tắc trích dẫn chuẩn APA 7th Edition & Tránh đạo văn",
        body: "Đạo văn (Plagiarism) là lỗi nghiêm trọng nhất có thể khiến luận văn bị hủy kết quả. Hãy tuân thủ nghiêm ngặt chuẩn trích dẫn:",
        subsections: [
          {
            subheading: "3.1. Trích dẫn trong bài (In-text Citations)",
            text: "Đối với 1 tác giả: (Smith, 2024). Đối với 2 tác giả: (Smith & Johnson, 2024). Đối với 3 tác giả trở lên: (Smith et al., 2024)."
          },
          {
            subheading: "3.2. Quản lý trích dẫn tự động bằng Zotero / Mendeley / EndNote",
            text: "Cài đặt phần mềm quản lý trích dẫn để tự động chèn chú thích và xuất danh mục tài liệu tham khảo (References) chính xác 100%, tiết kiệm hàng chục giờ sửa tay."
          },
          {
            subheading: "3.3. Kỹ thuật Paraphrase đỉnh cao",
            text: "Thay đổi cấu trúc ngữ pháp (chuyển câu chủ động sang bị động, biến đổi từ loại danh từ - động từ) kết hợp sử dụng từ đồng nghĩa mà không làm biến dạng nghĩa gốc của tác giả."
          }
        ]
      },
      {
        heading: "4. Chuẩn bị Slide thuyết trình & Kỹ năng bảo vệ trước Hội đồng",
        body: "Một buổi bảo vệ thành công phụ thuộc 50% vào slide báo cáo và phong thái tự tin của bạn:",
        items: [
          "Thiết kế 12 – 15 slide súc tích: Tối giản chữ, tập trung vào sơ đồ phương pháp nghiên cứu và biểu đồ kết quả quan trọng nhất.",
          "Kiểm soát thời gian nói chính xác trong vòng 10-15 phút, phát âm rõ ràng các thuật ngữ chuyên ngành tiếng Anh.",
          "Lường trước 5-10 câu hỏi phản biện từ Hội đồng và chuẩn bị sẵn các slide phụ lục (Appendix slides) chứa số liệu chi tiết để giải trình."
        ]
      },
      {
        heading: "5. Mẫu luận văn và slide bảo vệ xuất sắc trên Salemylink",
        body: "Salemylink cung cấp bộ sưu tập các bài luận văn mẫu, báo cáo thực tập tốt nghiệp và template slide PowerPoint bảo vệ của sinh viên xuất sắc các trường RMIT, BUV, Đại học Ngoại Thương, Đại học Kinh tế Quốc dân. Bạn có thể tham khảo cấu trúc, cách diễn đạt học thuật và bảng biểu để hoàn thiện bài luận của mình."
      }
    ],
    faq: [
      {
        q: "Làm thế nào để kiểm tra tỷ lệ đạo văn Turnitin an toàn?",
        a: "Hãy kiểm tra Turnitin qua tài khoản trường cấp không lưu trữ dữ liệu (No-repository) để tránh bài viết bị lưu vào cơ sở dữ liệu trước ngày nộp chính thức."
      },
      {
        q: "Độ dài tiêu chuẩn của một luận văn tốt nghiệp tiếng Anh là bao nhiêu?",
        a: "Luận văn cử nhân đại học thường từ 8,000 – 12,000 từ, trong khi luận văn thạc sĩ dao động từ 15,000 – 25,000 từ tùy theo quy định của từng trường."
      },
      {
        q: "Có nên dùng AI (ChatGPT) để viết luận văn không?",
        a: "Bạn có thể dùng AI để gợi ý dàn ý hoặc kiểm tra lỗi ngữ pháp, nhưng tuyệt đối không sao chép nguyên văn vì các trường hiện đều quét AI detector nghiêm ngặt."
      }
    ],
    relatedGuides: ["top-10-tai-lieu-ielts-mien-phi-tot-nhat-2026", "cach-mua-tai-lieu-hoc-tap-online-an-toan"],
    relatedCategories: [
      { name: "Báo cáo & Luận văn", slug: "bao-cao-luan-van" },
      { name: "Tài liệu học tập", slug: "tai-lieu-hoc-tap" }
    ],
    updatedAt: "2026-08-30",
    createdAt: "2026-02-01"
  },
  {
    slug: "de-thi-vao-10-cac-tinh-2026",
    title: "Tuyển tập đề thi vào 10 các tỉnh 2026 – Lời giải chi tiết & Chiến thuật",
    metaTitle: "Đề thi vào 10 các tỉnh 2026: đề thi thử Toán Văn Anh, lời giải chi tiết",
    description:
      "Tuyển tập đề thi tuyển sinh vào lớp 10 năm học 2025-2026 các tỉnh Hà Nội, TP.HCM, Nam Định, Nghệ An... Kèm lời giải chi tiết và chiến thuật ôn thi 9+.",
    keywords:
      "de thi vao 10 cac tinh 2026, de thi vao 10 mon toan, de thi vao 10 mon van, de thi vao 10 mon tieng anh, tai lieu on thi lop 10, de thi thu vao 10",
    hero: "Bứt phá điểm số trong kỳ thi tuyển sinh vào lớp 10 công lập với bộ đề thi chọn lọc sát cấu trúc ma trận mới nhất của Bộ Giáo dục và Đào tạo.",
    category: "Luyện thi vào 10",
    categorySlug: "tai-lieu-hoc-tap",
    productTags: ["de thi", "vao 10", "toan", "van", "tieng anh", "on thi", "nam dinh", "ha noi"],
    productKeywords: ["vào 10", "đề thi", "toán", "văn", "tiếng anh", "lớp 10", "tuyển sinh"],
    intro:
      "Kỳ thi tuyển sinh vào lớp 10 Trung học Phổ thông (THPT) là một trong những kỳ thi có tính cạnh tranh cao nhất tại Việt Nam, đặc biệt là tại các thành phố lớn như Hà Nội, TP.HCM, Đà Nẵng và các tỉnh có truyền thống hiếu học như Nam Định, Nghệ An, Hải Phòng. Để giành được tấm vé vào các trường THPT công lập top đầu hoặc trường THPT Chuyên, học sinh lớp 9 không chỉ cần nắm vững kiến thức sách giáo khoa mà còn phải liên tục cọ xát với các dạng đề thi thử chuẩn cấu trúc. Bài viết này tổng hợp toàn cảnh ma trận đề thi tuyển sinh vào 10 các tỉnh năm học 2025 – 2026, chiến thuật làm bài 3 môn bắt buộc (Toán – Ngữ Văn – Tiếng Anh) và chia sẻ kho đề thi có lời giải chi tiết trên Salemylink.",
    sections: [
      {
        heading: "1. Phân tích ma trận & Xu hướng ra đề thi vào 10 năm 2026",
        body: "Chương trình Giáo dục phổ thông mới chú trọng đánh giá năng lực thực tế, giải quyết vấn đề và tư duy vận dụng cao của học sinh.",
        subsections: [
          {
            subheading: "1.1. Môn Toán: Tăng cường bài toán thực tế",
            text: "Cấu trúc đề thi Toán vào 10 thường gồm 5 bài lớn (thời gian làm bài 120 phút). Điểm mới đáng chú ý là sự xuất hiện của các bài toán thực tế ứng dụng hàm số bậc nhất, hệ phương trình, lượng giác hình học và tính toán tài chính tiêu dùng. Câu phân loại học sinh thường rơi vào bài hình học phẳng phần cuối hoặc bất đẳng thức cực trị."
          },
          {
            subheading: "1.2. Môn Ngữ Văn: Đọc hiểu văn bản ngoài SGK & Nghị luận xã hội",
            text: "Phần Đọc hiểu và Nghị luận xã hội đang có xu hướng sử dụng ngữ liệu mới lạ từ đời sống thực tế hoặc các tác phẩm văn học mở rộng. Yêu cầu học sinh phải có góc nhìn độc lập, suy nghĩ sâu sắc về lối sống trách nhiệm, lòng nhân ái và kỹ năng số của thế hệ trẻ."
          },
          {
            subheading: "1.3. Môn Tiếng Anh: Tăng độ phân hóa từ vựng & Ngữ âm",
            text: "Đề thi gồm 40-50 câu trắc nghiệm (thời gian làm bài 60 phút) kiểm tra toàn diện Ngữ âm (Trọng âm, Phát âm), Tìm lỗi sai, Điền từ đoạn văn, Đọc hiểu trả lời câu hỏi và Viết lại câu không đổi nghĩa."
          }
        ]
      },
      {
        heading: "2. Tuyển tập đề thi tuyển sinh tiêu biểu theo từng địa phương",
        body: "Mỗi tỉnh thành có đặc thù ra đề riêng biệt, học sinh cần luyện tập đúng bộ đề của tỉnh mình dự thi:",
        items: [
          "Hà Nội: Đề thi có độ bao phủ kiến thức rộng, tính chuẩn mực cao, yêu cầu trình bày chặt chẽ từng bước lập luận môn Toán.",
          "TP. Hồ Chí Minh: Tiên phong trong các câu hỏi toán học thực tế và dạng bài đọc hiểu môn Tiếng Anh giàu tính ứng dụng.",
          "Nam Định: Đề thi Toán và Tiếng Anh nổi tiếng có độ phân hóa cao, câu phân loại cực trị và hình học đòi hỏi tư duy biến đổi linh hoạt.",
          "Nghệ An & Thanh Hóa: Chú trọng các dạng toán đại số nâng cao và nghị luận văn học sâu sắc."
        ]
      },
      {
        heading: "3. Chiến thuật phân bổ thời gian & Bí quyết đạt điểm 9+",
        body: "Nắm chắc chiến thuật trong phòng thi sẽ giúp bạn tối ưu hóa từng 0.25 điểm quý giá:",
        items: [
          "Quy tắc 'Dễ làm trước – Khó làm sau': Dành 30-40 phút đầu để giải quyết triệt để 70% câu hỏi ở mức độ nhận biết và thông hiểu, kiểm tra lại đáp án để không bị mất điểm oan.",
          "Môn Toán: Trình bày sạch đẹp, ghi rõ điều kiện xác định và kết luận nghiệm. Vẽ hình hình học bằng thước kẻ và compa chuẩn xác ngay từ ban đầu.",
          "Môn Ngữ Văn: Lập dàn ý vắn tắt trong 3 phút trước khi viết. Đảm bảo cấu trúc đoạn văn nghị luận xã hội (Mở đoạn - Giải thích - Bàn luận/Dẫn chứng - Phản đề - Bài học nhận thức).",
          "Môn Tiếng Anh: Tô phiếu trắc nghiệm trực tiếp sau mỗi câu, không để dồn đến cuối giờ tránh tô lệch dòng."
        ]
      },
      {
        heading: "4. Lộ trình ôn thi 3 tháng nước rút trước kỳ thi",
        body: "Giai đoạn nước rút là thời điểm vàng để tổng kết và lấp đầy các lỗ hổng kiến thức:",
        items: [
          "Tháng thứ 1: Hệ thống hóa lại toàn bộ công thức Toán, từ vựng Tiếng Anh theo chủ đề và các tác phẩm văn học trọng tâm qua sơ đồ tư duy (Mindmap).",
          "Tháng thứ 2: Giải mỗi tuần 3-4 đề thi thử bấm đúng thời gian thực tế, phân tích kỹ các lỗi sai và ghi chú vào sổ tay kinh nghiệm.",
          "Tháng thứ 3: Giữ gìn sức khỏe, ôn tập nhẹ nhàng, làm lại các câu phân loại và chuẩn bị tâm lý tự tin bước vào phòng thi."
        ]
      },
      {
        heading: "5. Tải trọn bộ đề thi thử vào 10 các tỉnh có đáp án tại Salemylink",
        body: "Salemylink tổng hợp đầy đủ các bộ đề thi chính thức và đề thi thử tuyển sinh lớp 10 của các trường chuyên, trường THPT điểm trên toàn quốc. Tất cả tài liệu đều đi kèm file PDF chất lượng cao, bảng đáp án trắc nghiệm và thang điểm chấm chi tiết từng phần giúp phụ huynh và học sinh dễ dàng tự chấm điểm và đánh giá năng lực tại nhà."
      }
    ],
    faq: [
      {
        q: "Làm thế nào để lấy trọn điểm các câu toán thực tế vào lớp 10?",
        a: "Hãy đọc kỹ đề bài 2 lần để xác định rõ đại lượng cần tìm, đặt ẩn và điều kiện của ẩn, sau đó thiết lập phương trình hoặc hệ phương trình tương ứng."
      },
      {
        q: "Đề thi thử trên Salemylink có giống đề thi thật không?",
        a: "Các đề thi trên Salemylink được tuyển chọn từ các đợt thi thử của các trường THPT Chuyên và Phòng GD&ĐT các quận/huyện, bám sát 100% ma trận đề thi chính thức."
      },
      {
        q: "Tài liệu đề thi tải về có thể in ra giấy để làm thử không?",
        a: "Có. Tất cả tài liệu được định dạng PDF tiêu chuẩn A4 sắc nét, bạn có thể dễ dàng in ra để làm bài trực tiếp như thi thật."
      }
    ],
    relatedGuides: ["cach-mua-tai-lieu-hoc-tap-online-an-toan", "top-10-tai-lieu-ielts-mien-phi-tot-nhat-2026"],
    relatedCategories: [
      { name: "Tài liệu học tập", slug: "tai-lieu-hoc-tap" },
      { name: "Khóa học Online", slug: "khoa-hoc-online" }
    ],
    updatedAt: "2026-08-30",
    createdAt: "2026-02-10"
  }
];

export const getGuideBySlug = (slug: string): Guide | undefined => {
  // Direct match
  const direct = GUIDES.find((g) => g.slug === slug);
  if (direct) return direct;

  // Backward-compatibility aliases
  const aliasMap: Record<string, string> = {
    "hoc-y-khoa": "hoc-y-khoa-tu-zero",
    "luyen-thi-ielts": "top-10-tai-lieu-ielts-mien-phi-tot-nhat-2026",
    "viet-luan-van": "viet-luan-van-tieng-anh-band-7",
  };

  const targetSlug = aliasMap[slug];
  if (targetSlug) {
    return GUIDES.find((g) => g.slug === targetSlug);
  }

  return undefined;
};
