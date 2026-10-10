function fixVietnameseEncoding(str) {
  if (!str) return "";
  return str;
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function normalizeProductName(rawName, categoryName) {
  if (!rawName || typeof rawName !== "string" || rawName.trim().length === 0) {
    return "Sản phẩm không tên — Tải ngay tại Salemylink";
  }

  const decoded = decodeHtmlEntities(rawName);
  let name = fixVietnameseEncoding(decoded).trim().replace(/[\r\n\t\s]+/g, " ");

  // Loại bỏ prefix format phổ biến trong product name
  name = name.replace(/^\[(PDF|EBOOK|PDF Ebook|Khóa học|Ebook|Course|Course Materials|Document|Tài liệu|Source Code|Template)\]\s*/i, "");
  name = name.replace(/^\((PDF|EBOOK|PDF Ebook|Khóa học|Ebook|Course|Course Materials|Document|Tài liệu|Source Code|Template)\)\s*/i, "");

  // Nếu name quá ngắn (dưới 10 chars) và có category, thêm context
  if (name.length < 10 && categoryName) {
    name = `${name} — ${categoryName}`;
  }

  // Final fallback nếu vẫn quá ngắn (< 10 chars)
  if (name.length < 10) {
    name = `${name} — Tải ngay`;
  }

  // Nếu name quá dài, cắt ngắn tại ranh giới từ <= 87 chars + '...'
  if (name.length > 90) {
    const truncated = name.slice(0, 87);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 50) {
      name = truncated.slice(0, lastSpace) + "...";
    } else {
      name = truncated + "...";
    }
  }

  return name;
}

const samples = [
  "[PDF] Sự ảnh hưởng của thuật toán Topology-Informed Pruning lên hình thái và đặc điểm khuếch tán của bó cung AF ở người trưởng thành thuận tay phải mmzwmhkx",
  "AutoClip",
  "MẪU BÀI 22 - 23 KHÁI QUÁT VỀ VI SINH VẬT THỰC HÀNH MMRXV8N7",
  "AI",
  "test-nhi-khoa"
];

samples.forEach((s) => {
  const norm = normalizeProductName(s, "Tài liệu Y khoa");
  console.log(`Original: (${s.length} chars) "${s}"`);
  console.log(`-> Normalized: (${norm.length} chars) "${norm}"\n`);
});
