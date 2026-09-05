import { SupportedLanguage } from './languages';

export interface Translations {
  seo: {
    siteName: string;
    siteTitle: string;
    siteDescription: string;
    siteKeywords: string;
    homeTitle: string;
    homeDesc: string;
    aboutTitle: string;
    aboutDesc: string;
    howItWorksTitle: string;
    howItWorksDesc: string;
    sellerGuideTitle: string;
    sellerGuideDesc: string;
    sellersTitle: string;
    sellersDesc: string;
    guidesTitle: string;
    guidesDesc: string;
    affiliateTitle: string;
    affiliateDesc: string;
    privacyTitle: string;
    privacyDesc: string;
    termsTitle: string;
    termsDesc: string;
    searchTitle: string;
    searchDesc: string;
  };
  nav: {
    home: string;
    search: string;
    searchPlaceholder: string;
    cart: string;
    wishlist: string;
    account: string;
    login: string;
    register: string;
    sellerAuth: string;
    sellerDashboard: string;
    admin: string;
    logout: string;
    myOrders: string;
    accountManage: string;
    guides: string;
    sellers: string;
    affiliate: string;
  };
  hero: {
    badge: string;
    titleMain: string;
    titleHighlight: string;
    subtitle: string;
    searchButton: string;
    popularTags: string;
  };
  trust: {
    instantDelivery: string;
    instantDeliveryDesc: string;
    safePayment: string;
    safePaymentDesc: string;
    qualityVerified: string;
    qualityVerifiedDesc: string;
    support: string;
    supportDesc: string;
    lowFee: string;
    lowFeeDesc: string;
  };
  product: {
    buyNow: string;
    freeDownload: string;
    preview: string;
    format: string;
    rating: string;
    reviews: string;
    downloads: string;
    seller: string;
    category: string;
    inStock: string;
    description: string;
    relatedProducts: string;
    customerReviews: string;
    noReviewsYet: string;
    verifiedPurchase: string;
    price: string;
  };
  footer: {
    companyDesc: string;
    quickLinks: string;
    topCategories: string;
    contact: string;
    aboutUs: string;
    howItWorks: string;
    guidesAndTips: string;
    sellerGuide: string;
    affiliateProgram: string;
    topSellers: string;
    privacyPolicy: string;
    termsOfService: string;
    allRightsReserved: string;
    language: string;
  };
  common: {
    viewAll: string;
    viewDetails: string;
    backToHome: string;
    filter: string;
    sort: string;
    loading: string;
    error: string;
    noData: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  vi: {
    seo: {
      siteName: "Salemylink.com",
      siteTitle: "Salemylink – Marketplace sản phẩm Digital Việt Nam",
      siteDescription:
        "Marketplace sản phẩm digital Việt Nam. Mua bán ebook, tài liệu, khóa học qua Google Drive an toàn, nhanh chóng.",
      siteKeywords:
        "bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital, bán tài liệu online",
      homeTitle: "Salemylink – Mua bán tài liệu số, ebook, khóa học",
      homeDesc:
        "Marketplace mua bán tài liệu số, ebook, khóa học online qua Google Drive. Giao dịch an toàn, tải xuống ngay sau khi thanh toán.",
      aboutTitle: "Về Salemylink – Marketplace tài liệu số Việt Nam",
      aboutDesc:
        "Tìm hiểu về Salemylink: nền tảng mua bán ebook, tài liệu, khóa học qua Google Drive an toàn cho người Việt.",
      howItWorksTitle: "Cách thức hoạt động – Salemylink",
      howItWorksDesc:
        "Hướng dẫn chi tiết quy trình mua và bán sản phẩm số trên Salemylink nhanh chóng, tiện lợi qua Google Drive.",
      sellerGuideTitle: "Hướng dẫn bán hàng – Salemylink",
      sellerGuideDesc:
        "Hướng dẫn tạo tài khoản, đăng bán sản phẩm và kiếm tiền hoa hồng chỉ 5% trên Salemylink.",
      sellersTitle: "Top Người bán uy tín – Salemylink",
      sellersDesc:
        "Khám phá danh sách các nhà sáng tạo nội dung, giảng viên và người bán sản phẩm số uy tín hàng đầu trên Salemylink.",
      guidesTitle: "Cẩm nang học tập & Kỹ năng số – Salemylink",
      guidesDesc:
        "Tổng hợp hướng dẫn học tập, luyện thi IELTS, cẩm nang y khoa, viết luận văn và chia sẻ kiến thức số hữu ích.",
      affiliateTitle: "Chương trình Tiếp thị liên kết (Affiliate) – Salemylink",
      affiliateDesc:
        "Kiếm hoa hồng 5% trên mỗi đơn hàng thành công khi giới thiệu sản phẩm số tại Salemylink.",
      privacyTitle: "Chính sách bảo mật – Salemylink",
      privacyDesc:
        "Cam kết bảo vệ dữ liệu cá nhân, thông tin thanh toán và quyền riêng tư của khách hàng tại Salemylink.",
      termsTitle: "Điều khoản dịch vụ – Salemylink",
      termsDesc:
        "Điều khoản và quy định sử dụng nền tảng thương mại điện tử sản phẩm số Salemylink.",
      searchTitle: "Tìm kiếm sản phẩm số – Salemylink",
      searchDesc:
        "Tìm kiếm hàng ngàn ebook, tài liệu, giáo trình, khóa học, source code và template số tại Salemylink.",
    },
    nav: {
      home: "Trang chủ",
      search: "Tìm kiếm",
      searchPlaceholder: "Tìm kiếm sản phẩm digital, ebook, tài liệu...",
      cart: "Giỏ hàng",
      wishlist: "Yêu thích",
      account: "Tài khoản",
      login: "Đăng nhập",
      register: "Đăng ký",
      sellerAuth: "Trở thành người bán",
      sellerDashboard: "Dashboard bán hàng",
      admin: "Quản trị hệ thống",
      logout: "Đăng xuất",
      myOrders: "Đơn hàng của tôi",
      accountManage: "Quản lý tài khoản",
      guides: "Cẩm nang",
      sellers: "Người bán",
      affiliate: "Affiliate",
    },
    hero: {
      badge: "🚀 Sàn giao dịch sản phẩm số #1 Việt Nam",
      titleMain: "Kho Sản Phẩm Digital",
      titleHighlight: "Chất Lượng Cao",
      subtitle:
        "Khám phá hàng ngàn ebook, tài liệu học tập, khóa học online và source code chất lượng. Giao hàng tự động qua Google Drive.",
      searchButton: "Tìm kiếm",
      popularTags: "Xu hướng tìm kiếm:",
    },
    trust: {
      instantDelivery: "Giao hàng tức thì",
      instantDeliveryDesc: "Nhận link Google Drive tự động ngay sau khi thanh toán",
      safePayment: "Thanh toán an toàn",
      safePaymentDesc: "Tích hợp cổng thanh toán bảo mật PayOS, QR Ngân hàng",
      qualityVerified: "Kiểm duyệt chất lượng",
      qualityVerifiedDesc: "100% tài liệu và sản phẩm được kiểm duyệt nội dung",
      support: "Hỗ trợ tận tâm 24/7",
      supportDesc: "Đội ngũ CSKH sẵn sàng giải đáp và xử lý mọi thắc mắc",
      lowFee: "Phí bán hàng chỉ 5%",
      lowFeeDesc: "Mức chiết khấu hấp dẫn nhất thị trường cho nhà sáng tạo",
    },
    product: {
      buyNow: "Mua ngay",
      freeDownload: "Tải miễn phí",
      preview: "Xem trước",
      format: "Định dạng",
      rating: "Đánh giá",
      reviews: "nhận xét",
      downloads: "lượt tải",
      seller: "Người bán",
      category: "Danh mục",
      inStock: "Còn hàng",
      description: "Mô tả sản phẩm",
      relatedProducts: "Sản phẩm liên quan",
      customerReviews: "Đánh giá từ người mua",
      noReviewsYet: "Chưa có đánh giá nào cho sản phẩm này.",
      verifiedPurchase: "Đã mua hàng",
      price: "Giá",
    },
    footer: {
      companyDesc:
        "Nền tảng thương mại điện tử hàng đầu cho sản phẩm digital tại Việt Nam. Kết nối người mua và người bán một cách an toàn, nhanh chóng.",
      quickLinks: "Liên kết nhanh",
      topCategories: "Danh mục nổi bật",
      contact: "Liên hệ & Hỗ trợ",
      aboutUs: "Về chúng tôi",
      howItWorks: "Cách thức hoạt động",
      guidesAndTips: "Cẩm nang & Hướng dẫn",
      sellerGuide: "Hướng dẫn bán hàng",
      affiliateProgram: "Affiliate - Kiếm 5% hoa hồng",
      topSellers: "Top Người bán uy tín",
      privacyPolicy: "Chính sách bảo mật",
      termsOfService: "Điều khoản sử dụng",
      allRightsReserved: "Salemylink.com. Nền tảng chia sẻ và mua bán sản phẩm digital hàng đầu Việt Nam.",
      language: "Ngôn ngữ",
    },
    common: {
      viewAll: "Xem tất cả",
      viewDetails: "Xem chi tiết",
      backToHome: "Quay về trang chủ",
      filter: "Bộ lọc",
      sort: "Sắp xếp",
      loading: "Đang tải...",
      error: "Đã có lỗi xảy ra",
      noData: "Không tìm thấy dữ liệu",
    },
  },

  en: {
    seo: {
      siteName: "Salemylink.com",
      siteTitle: "Salemylink – Leading Digital Products Marketplace",
      siteDescription:
        "Vietnam's premier digital products marketplace. Buy and sell ebooks, study materials, courses via Google Drive safely and fast.",
      siteKeywords:
        "sell digital products, digital ebooks, study materials, online courses, google drive, digital marketplace, buy digital files",
      homeTitle: "Salemylink – Buy & Sell Digital Goods, Ebooks, Courses",
      homeDesc:
        "Premier marketplace for digital documents, ebooks, online courses delivered via Google Drive. Secure checkout and instant delivery.",
      aboutTitle: "About Salemylink – Leading Digital Goods Marketplace",
      aboutDesc:
        "Learn about Salemylink: the trusted platform for buying and selling digital files, ebooks, and courses via Google Drive.",
      howItWorksTitle: "How It Works – Salemylink",
      howItWorksDesc:
        "Step-by-step guide on how to buy and sell digital products on Salemylink quickly and securely via Google Drive.",
      sellerGuideTitle: "Seller Guide – Salemylink",
      sellerGuideDesc:
        "Discover how to create a seller account, list digital products, and earn with only 5% platform fee on Salemylink.",
      sellersTitle: "Top Verified Sellers – Salemylink",
      sellersDesc:
        "Explore top creators, educators, and verified digital product sellers on Salemylink.",
      guidesTitle: "Learning Guides & Digital Skills – Salemylink",
      guidesDesc:
        "Curated guides on IELTS preparation, medical notes, thesis writing, and valuable digital knowledge.",
      affiliateTitle: "Affiliate Program – Salemylink",
      affiliateDesc:
        "Earn 5% commission on every successful referral for digital products on Salemylink.",
      privacyTitle: "Privacy Policy – Salemylink",
      privacyDesc:
        "Commitment to protecting personal data, payment information, and customer privacy on Salemylink.",
      termsTitle: "Terms of Service – Salemylink",
      termsDesc:
        "Terms and conditions for using Salemylink digital products marketplace platform.",
      searchTitle: "Search Digital Products – Salemylink",
      searchDesc:
        "Search thousands of ebooks, documents, study materials, courses, source code, and design templates on Salemylink.",
    },
    nav: {
      home: "Home",
      search: "Search",
      searchPlaceholder: "Search digital products, ebooks, documents...",
      cart: "Cart",
      wishlist: "Wishlist",
      account: "Account",
      login: "Sign In",
      register: "Sign Up",
      sellerAuth: "Become a Seller",
      sellerDashboard: "Seller Dashboard",
      admin: "Admin Center",
      logout: "Sign Out",
      myOrders: "My Orders",
      accountManage: "Manage Account",
      guides: "Guides",
      sellers: "Sellers",
      affiliate: "Affiliate",
    },
    hero: {
      badge: "🚀 #1 Digital Products Marketplace in Vietnam",
      titleMain: "Explore Premium",
      titleHighlight: "Digital Goods",
      subtitle:
        "Discover thousands of high-quality ebooks, study materials, online courses, and source codes. Automated instant delivery via Google Drive.",
      searchButton: "Search",
      popularTags: "Trending Searches:",
    },
    trust: {
      instantDelivery: "Instant Delivery",
      instantDeliveryDesc: "Automatic Google Drive link sent immediately after payment",
      safePayment: "Secure Payment",
      safePaymentDesc: "Protected payment gateway with bank transfer & PayOS support",
      qualityVerified: "Verified Quality",
      qualityVerifiedDesc: "100% curated and verified digital content & materials",
      support: "24/7 Dedicated Support",
      supportDesc: "Customer service team ready to assist you anytime",
      lowFee: "Only 5% Seller Fee",
      lowFeeDesc: "Most competitive platform commission for content creators",
    },
    product: {
      buyNow: "Buy Now",
      freeDownload: "Free Download",
      preview: "Preview",
      format: "Format",
      rating: "Rating",
      reviews: "reviews",
      downloads: "downloads",
      seller: "Seller",
      category: "Category",
      inStock: "In Stock",
      description: "Product Description",
      relatedProducts: "Related Products",
      customerReviews: "Customer Reviews",
      noReviewsYet: "No reviews for this product yet.",
      verifiedPurchase: "Verified Buyer",
      price: "Price",
    },
    footer: {
      companyDesc:
        "Leading digital commerce platform in Vietnam. Connecting buyers and creators with safe, fast, and automated transactions.",
      quickLinks: "Quick Links",
      topCategories: "Top Categories",
      contact: "Contact & Support",
      aboutUs: "About Us",
      howItWorks: "How It Works",
      guidesAndTips: "Guides & Articles",
      sellerGuide: "Seller Guide",
      affiliateProgram: "Affiliate - Earn 5% Commission",
      topSellers: "Top Verified Sellers",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      allRightsReserved: "Salemylink.com. Leading digital products marketplace platform in Vietnam.",
      language: "Language",
    },
    common: {
      viewAll: "View All",
      viewDetails: "View Details",
      backToHome: "Back to Home",
      filter: "Filter",
      sort: "Sort",
      loading: "Loading...",
      error: "An error occurred",
      noData: "No data found",
    },
  },

  zh: {
    seo: {
      siteName: "Salemylink.com",
      siteTitle: "Salemylink – 越南领先数字产品交易平台",
      siteDescription:
        "越南首屈一指的数字产品市场。通过Google Drive安全快捷地买卖电子书、学习资料、在线课程和源码。",
      siteKeywords:
        "出售数字产品, 电子书, 学习资料, 在线课程, 谷歌云端硬盘, 数字市场, 源码模板",
      homeTitle: "Salemylink – 买卖数字资料、电子书、在线课程",
      homeDesc:
        "数字资料、电子书与在线课程交易平台，通过Google Drive全自动交付。安全支付，付款后立即可下载。",
      aboutTitle: "关于 Salemylink – 领先的数字商品交易平台",
      aboutDesc:
        "了解Salemylink：值得信赖的越南数字产品平台，通过Google Drive安全买卖电子书与课程。",
      howItWorksTitle: "运作方式 – Salemylink",
      howItWorksDesc:
        "详细指南：如何在Salemylink上通过Google Drive快速安全地购买与销售数字产品。",
      sellerGuideTitle: "卖家指南 – Salemylink",
      sellerGuideDesc:
        "了解如何注册卖家账户、发布数字产品，仅需5%超低平台手续费即可轻松变现。",
      sellersTitle: "认证优质卖家 – Salemylink",
      sellersDesc:
        "探索Salemylink上顶级创作者、讲师及认证数字内容创作者。",
      guidesTitle: "学习指南与数字技能 – Salemylink",
      guidesDesc:
        "精选雅思备考、医学资料、论文写作与实用数字技能教程。",
      affiliateTitle: "联盟营销推广计划 – Salemylink",
      affiliateDesc:
        "推广Salemylink优质数字产品，每笔成功交易即可获得5%佣金奖励。",
      privacyTitle: "隐私政策 – Salemylink",
      privacyDesc:
        "致力于保护Salemylink用户的个人隐私、交易数据与账户安全。",
      termsTitle: "服务条款 – Salemylink",
      termsDesc:
        "使用Salemylink数字产品电商平台的条款与规范。",
      searchTitle: "搜索数字产品 – Salemylink",
      searchDesc:
        "在Salemylink上搜索数千种优质电子书、学习资料、课程、源码与设计模板。",
    },
    nav: {
      home: "首页",
      search: "搜索",
      searchPlaceholder: "搜索数字产品、电子书、资料...",
      cart: "购物车",
      wishlist: "收藏夹",
      account: "账户",
      login: "登录",
      register: "注册",
      sellerAuth: "成为卖家",
      sellerDashboard: "卖家中心",
      admin: "系统管理",
      logout: "退出登录",
      myOrders: "我的订单",
      accountManage: "账户设置",
      guides: "学习指南",
      sellers: "优质卖家",
      affiliate: "联盟分销",
    },
    hero: {
      badge: "🚀 越南排名第一的数字产品交易平台",
      titleMain: "探索高品质",
      titleHighlight: "数字资源库",
      subtitle:
        "汇聚数千款精品电子书、学习课件、在线课程与开发源码。通过Google Drive自动即时交付。",
      searchButton: "搜索",
      popularTags: "热门搜索：",
    },
    trust: {
      instantDelivery: "即时极速发货",
      instantDeliveryDesc: "付款后系统自动发送Google Drive下载链接",
      safePayment: "安全可靠支付",
      safePaymentDesc: "多重加密保护，支持PayOS与银行转账",
      qualityVerified: "正品质量审核",
      qualityVerifiedDesc: "100%人工审核数字内容与课件质量",
      support: "24/7全天候支持",
      supportDesc: "专业客服团队随时为您提供解答与协助",
      lowFee: "卖家手续费仅5%",
      lowFeeDesc: "行业极具竞争力的佣金比例，赋能内容创作者",
    },
    product: {
      buyNow: "立即购买",
      freeDownload: "免费下载",
      preview: "在线预览",
      format: "文件格式",
      rating: "评分",
      reviews: "条评价",
      downloads: "次下载",
      seller: "创作者",
      category: "分类",
      inStock: "有现货",
      description: "商品详情",
      relatedProducts: "相关推荐",
      customerReviews: "买家真实评价",
      noReviewsYet: "暂无评价。",
      verifiedPurchase: "已购买用户",
      price: "价格",
    },
    footer: {
      companyDesc:
        "越南领先的数字产品电子商务平台。安全、快速地连接内容买家与创作者。",
      quickLinks: "快捷导航",
      topCategories: "热门分类",
      contact: "联系与支持",
      aboutUs: "关于我们",
      howItWorks: "交易流程",
      guidesAndTips: "攻略与指南",
      sellerGuide: "开店指南",
      affiliateProgram: "联盟营销 (赚5%佣金)",
      topSellers: "认证卖家",
      privacyPolicy: "隐私政策",
      termsOfService: "使用条款",
      allRightsReserved: "Salemylink.com. 越南领先的数字产品交易平台 版权所有。",
      language: "语言选择",
    },
    common: {
      viewAll: "查看全部",
      viewDetails: "查看详情",
      backToHome: "返回首页",
      filter: "筛选",
      sort: "排序",
      loading: "加载中...",
      error: "发生错误",
      noData: "未找到相关内容",
    },
  },

  es: {
    seo: {
      siteName: "Salemylink.com",
      siteTitle: "Salemylink – Plataforma Líder de Productos Digitales",
      siteDescription:
        "El marketplace de productos digitales líder en Vietnam. Compra y vende ebooks, materiales de estudio y cursos vía Google Drive de forma rápida y segura.",
      siteKeywords:
        "vender productos digitales, ebooks digitales, material de estudio, cursos online, google drive, marketplace digital, comprar archivos",
      homeTitle: "Salemylink – Compra y Vende Bienes Digitales, Ebooks, Cursos",
      homeDesc:
        "Marketplace principal de documentos digitales, ebooks y cursos online entregados vía Google Drive. Pago seguro y entrega inmediata.",
      aboutTitle: "Sobre Salemylink – Plataforma de Productos Digitales",
      aboutDesc:
        "Conoce Salemylink: la plataforma de confianza para comprar y vender archivos digitales, ebooks y cursos vía Google Drive.",
      howItWorksTitle: "Cómo Funciona – Salemylink",
      howItWorksDesc:
        "Guía paso a paso sobre cómo comprar y vender productos digitales en Salemylink de manera rápida y segura.",
      sellerGuideTitle: "Guía para Vendedores – Salemylink",
      sellerGuideDesc:
        "Descubre cómo crear tu cuenta de vendedor, publicar productos digitales y ganar dinero con solo 5% de comisión.",
      sellersTitle: "Mejores Vendedores Verificados – Salemylink",
      sellersDesc:
        "Explora los mejores creadores, educadores y vendedores verificados de contenido digital en Salemylink.",
      guidesTitle: "Guías de Aprendizaje y Habilidades Digitales – Salemylink",
      guidesDesc:
        "Guías seleccionadas sobre preparación de IELTS, notas médicas, redacción de tesis y conocimientos digitales útiles.",
      affiliateTitle: "Programa de Afiliados – Salemylink",
      affiliateDesc:
        "Gana un 5% de comisión en cada venta exitosa referida en Salemylink.",
      privacyTitle: "Política de Privacidad – Salemylink",
      privacyDesc:
        "Compromiso con la protección de datos personales, información de pago y privacidad en Salemylink.",
      termsTitle: "Términos de Servicio – Salemylink",
      termsDesc:
        "Términos y condiciones para el uso de la plataforma de productos digitales Salemylink.",
      searchTitle: "Buscar Productos Digitales – Salemylink",
      searchDesc:
        "Busca entre miles de ebooks, documentos, cursos, código fuente y plantillas en Salemylink.",
    },
    nav: {
      home: "Inicio",
      search: "Buscar",
      searchPlaceholder: "Buscar productos digitales, ebooks, documentos...",
      cart: "Carrito",
      wishlist: "Favoritos",
      account: "Cuenta",
      login: "Iniciar Sesión",
      register: "Registrarse",
      sellerAuth: "Ser Vendedor",
      sellerDashboard: "Panel de Vendedor",
      admin: "Administración",
      logout: "Cerrar Sesión",
      myOrders: "Mis Pedidos",
      accountManage: "Gestionar Cuenta",
      guides: "Guías",
      sellers: "Vendedores",
      affiliate: "Afiliados",
    },
    hero: {
      badge: "🚀 Marketplace de Productos Digitales #1 en Vietnam",
      titleMain: "Explora Bienes Digitales",
      titleHighlight: "De Alta Calidad",
      subtitle:
        "Descubre miles de ebooks, materiales de estudio, cursos online y código fuente de primera calidad. Entrega automática e instantánea vía Google Drive.",
      searchButton: "Buscar",
      popularTags: "Búsquedas Populares:",
    },
    trust: {
      instantDelivery: "Entrega Inmediata",
      instantDeliveryDesc: "Enlace de Google Drive generado automáticamente tras el pago",
      safePayment: "Pago 100% Seguro",
      safePaymentDesc: "Pasarela protegida con transferencias bancarias y PayOS",
      qualityVerified: "Calidad Verificada",
      qualityVerifiedDesc: "Contenidos y materiales 100% revisados y verificados",
      support: "Soporte 24/7",
      supportDesc: "Equipo de atención al cliente listo para ayudarte en todo momento",
      lowFee: "Comisión de solo 5%",
      lowFeeDesc: "La tarifa más competitiva del mercado para creadores",
    },
    product: {
      buyNow: "Comprar Ahora",
      freeDownload: "Descarga Gratis",
      preview: "Vista Previa",
      format: "Formato",
      rating: "Calificación",
      reviews: "opiniones",
      downloads: "descargas",
      seller: "Vendedor",
      category: "Categoría",
      inStock: "Disponible",
      description: "Descripción del Producto",
      relatedProducts: "Productos Relacionados",
      customerReviews: "Opiniones de Clientes",
      noReviewsYet: "Aún no hay opiniones para este producto.",
      verifiedPurchase: "Comprador Verificado",
      price: "Precio",
    },
    footer: {
      companyDesc:
        "Plataforma líder de comercio digital en Vietnam. Conectando compradores y creadores con transacciones rápidas, seguras y automáticas.",
      quickLinks: "Enlaces Rápidos",
      topCategories: "Categorías Destacadas",
      contact: "Contacto y Soporte",
      aboutUs: "Sobre Nosotros",
      howItWorks: "Cómo Funciona",
      guidesAndTips: "Guías y Consejos",
      sellerGuide: "Guía de Vendedor",
      affiliateProgram: "Afiliados (Gana 5% de Comisión)",
      topSellers: "Vendedores Verificados",
      privacyPolicy: "Política de Privacidad",
      termsOfService: "Términos de Servicio",
      allRightsReserved: "Salemylink.com. Plataforma líder de productos digitales en Vietnam.",
      language: "Idioma",
    },
    common: {
      viewAll: "Ver Todo",
      viewDetails: "Ver Detalles",
      backToHome: "Volver al Inicio",
      filter: "Filtrar",
      sort: "Ordenar",
      loading: "Cargando...",
      error: "Ocurrió un error",
      noData: "No se encontraron datos",
    },
  },
};
